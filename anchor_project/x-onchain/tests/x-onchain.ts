import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { XOnchain } from "../target/types/x_onchain";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert, expect } from "chai";

describe("x-onchain", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.XOnchain as Program<XOnchain>;
  const user = provider.wallet;
  const user2 = anchor.web3.Keypair.generate();
  const user3 = anchor.web3.Keypair.generate();
  const user4 = anchor.web3.Keypair.generate();

  before(async function () {
    this.timeout(30000);

    // Airdrop to test users
    const airdrops = [
      provider.connection.requestAirdrop(user2.publicKey, LAMPORTS_PER_SOL),
      provider.connection.requestAirdrop(user3.publicKey, LAMPORTS_PER_SOL),
      provider.connection.requestAirdrop(user4.publicKey, LAMPORTS_PER_SOL),
    ];

    const signatures = await Promise.all(airdrops);
    await Promise.all(
      signatures.map((sig) => provider.connection.confirmTransaction(sig))
    );
  });

  describe("create_profile", () => {
    it("should create a profile successfully", async () => {
      // Use a fresh user to avoid conflicts
      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), user4.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .createProfile("fresh_user", "Fresh User")
        .accounts({
          profile: profilePda,
          user: user4.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user4])
        .rpc();

      const profile = await program.account.profile.fetch(profilePda);

      // Debug: log the profile to see its structure
      console.log("Profile:", profile);

      assert.equal(profile.author.toString(), user4.publicKey.toString());
      assert.equal(profile.handle, "fresh_user");
      assert.equal(profile.name, "Fresh User");
      assert(profile.tweetCount.eq(new BN(0)));
      assert(profile.followers.eq(new BN(0)));
      assert(profile.following.eq(new BN(0)));
    });

    it("should fail when creating profile with handle too long", async () => {
      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), user2.publicKey.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .createProfile("this_handle_is_way_too_long", "Test User")
          .accounts({
            profile: profilePda,
            user: user2.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([user2])
          .rpc();

        assert.fail("Should have failed with long handle");
      } catch (error) {
        assert(error instanceof Error);
      }
    });

    it("should fail when creating duplicate profile", async () => {
      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), user.publicKey.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .createProfile("another_handle", "Another Name")
          .accounts({
            profile: profilePda,
            user: user.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        assert.fail("Should have failed with duplicate profile");
      } catch (error) {
        assert(error instanceof Error);
      }
    });
  });

  describe("send_tweet", () => {
    it("should send a tweet successfully", async () => {
      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), user.publicKey.toBuffer()],
        program.programId
      );

      const [tweetPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("tweet"), user.publicKey.toBuffer(), new Uint8Array([0])],
        program.programId
      );

      const tweetContent = "Hello Solana! This is my first tweet 🚀";

      await program.methods
        .sendTweet(tweetContent)
        .accounts({
          tweet: tweetPda,
          profile: profilePda,
          author: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const tweet = await program.account.tweet.fetch(tweetPda);
      const profile = await program.account.profile.fetch(profilePda);

      assert.equal(tweet.author.toString(), user.publicKey.toString());
      assert.equal(tweet.content, tweetContent);
      assert(tweet.likes.eq(new BN(0)));
      assert(tweet.comments.eq(new BN(0)));
      assert(profile.tweetCount.eq(new BN(1)));
    });

    it("should fail when tweet content is too long", async () => {
      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), user.publicKey.toBuffer()],
        program.programId
      );

      const longContent = "a".repeat(281);

      try {
        const [tweetPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("tweet"),
            user.publicKey.toBuffer(),
            new Uint8Array([1]),
          ],
          program.programId
        );

        await program.methods
          .sendTweet(longContent)
          .accounts({
            tweet: tweetPda,
            profile: profilePda,
            author: user.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        assert.fail("Should have failed with long content");
      } catch (error) {
        assert(error instanceof Error);
      }
    });

    it("should fail when user doesn't have a profile", async () => {
      const userWithoutProfile = anchor.web3.Keypair.generate();

      const signature = await provider.connection.requestAirdrop(
        userWithoutProfile.publicKey,
        LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(signature);

      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), userWithoutProfile.publicKey.toBuffer()],
        program.programId
      );

      const [tweetPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("tweet"),
          userWithoutProfile.publicKey.toBuffer(),
          new Uint8Array([0]),
        ],
        program.programId
      );

      try {
        await program.methods
          .sendTweet("This should fail")
          .accounts({
            tweet: tweetPda,
            profile: profilePda,
            author: userWithoutProfile.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([userWithoutProfile])
          .rpc();

        assert.fail("Should have failed without profile");
      } catch (error) {
        assert(error instanceof Error);
      }
    });
  });

  describe("like_tweet", () => {
    let tweetPda: PublicKey;

    before(async () => {
      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), user.publicKey.toBuffer()],
        program.programId
      );

      tweetPda = PublicKey.findProgramAddressSync(
        [Buffer.from("tweet"), user.publicKey.toBuffer(), new Uint8Array([0])],
        program.programId
      )[0];
    });

    it("should like a tweet successfully", async () => {
      const initialTweet = await program.account.tweet.fetch(tweetPda);
      const initialLikes = initialTweet.likes;

      await program.methods
        .likeTweet()
        .accounts({
          tweet: tweetPda,
          user: user.publicKey,
        })
        .rpc();

      const tweet = await program.account.tweet.fetch(tweetPda);
      assert(tweet.likes.eq(initialLikes.add(new BN(1))));
    });

    it("should allow multiple likes from different users", async () => {
      const [user3ProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), user3.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .createProfile("user3_handle", "User Three")
        .accounts({
          profile: user3ProfilePda,
          user: user3.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user3])
        .rpc();

      const initialTweet = await program.account.tweet.fetch(tweetPda);
      const initialLikes = initialTweet.likes;

      await program.methods
        .likeTweet()
        .accounts({
          tweet: tweetPda,
          user: user3.publicKey,
        })
        .signers([user3])
        .rpc();

      const tweet = await program.account.tweet.fetch(tweetPda);
      assert(tweet.likes.eq(initialLikes.add(new BN(1))));
    });

    it("should fail when trying to like non-existent tweet", async () => {
      const nonExistentTweet = anchor.web3.Keypair.generate();

      try {
        await program.methods
          .likeTweet()
          .accounts({
            tweet: nonExistentTweet.publicKey,
            user: user.publicKey,
          })
          .rpc();

        assert.fail("Should have failed with non-existent tweet");
      } catch (error) {
        assert(error instanceof Error);
      }
    });
  });

  describe("follow_user", () => {
    it("should follow user successfully", async () => {
      // Use fresh users to avoid conflicts
      const follower = anchor.web3.Keypair.generate();
      const following = anchor.web3.Keypair.generate();

      // Airdrop to both users
      const airdrops = [
        provider.connection.requestAirdrop(
          follower.publicKey,
          LAMPORTS_PER_SOL
        ),
        provider.connection.requestAirdrop(
          following.publicKey,
          LAMPORTS_PER_SOL
        ),
      ];
      const signatures = await Promise.all(airdrops);
      await Promise.all(
        signatures.map((sig) => provider.connection.confirmTransaction(sig))
      );

      const [followerProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), follower.publicKey.toBuffer()],
        program.programId
      );

      const [followingProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), following.publicKey.toBuffer()],
        program.programId
      );

      // Create profiles for both users
      await program.methods
        .createProfile("follower_handle", "Follower User")
        .accounts({
          profile: followerProfilePda,
          user: follower.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([follower])
        .rpc();

      await program.methods
        .createProfile("following_handle", "Following User")
        .accounts({
          profile: followingProfilePda,
          user: following.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([following])
        .rpc();

      const initialFollowerProfile = await program.account.profile.fetch(
        followerProfilePda
      );
      const initialFollowingProfile = await program.account.profile.fetch(
        followingProfilePda
      );

      await program.methods
        .followUser()
        .accounts({
          userProfile: followerProfilePda,
          targetProfile: followingProfilePda,
          user: follower.publicKey,
          target: following.publicKey,
        })
        .signers([follower])
        .rpc();

      const followerProfile = await program.account.profile.fetch(
        followerProfilePda
      );
      const followingProfile = await program.account.profile.fetch(
        followingProfilePda
      );

      assert(
        followerProfile.following.eq(
          initialFollowerProfile.following.add(new BN(1))
        )
      );
      assert(
        followingProfile.followers.eq(
          initialFollowingProfile.followers.add(new BN(1))
        )
      );
    });

    it("should fail when following non-existent user", async () => {
      const nonExistentUser = anchor.web3.Keypair.generate();
      const [nonExistentProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), nonExistentUser.publicKey.toBuffer()],
        program.programId
      );

      const user1ProfilePda = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), user.publicKey.toBuffer()],
        program.programId
      )[0];

      try {
        await program.methods
          .followUser()
          .accounts({
            userProfile: user1ProfilePda,
            targetProfile: nonExistentProfilePda,
            user: user.publicKey,
            target: nonExistentUser.publicKey,
          })
          .rpc();

        assert.fail("Should have failed with non-existent user profile");
      } catch (error) {
        assert(error instanceof Error);
      }
    });

    it("should fail when follower doesn't have a profile", async () => {
      const userWithoutProfile = anchor.web3.Keypair.generate();

      const signature = await provider.connection.requestAirdrop(
        userWithoutProfile.publicKey,
        LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(signature);

      const [nonExistentProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), userWithoutProfile.publicKey.toBuffer()],
        program.programId
      );

      const user1ProfilePda = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), user.publicKey.toBuffer()],
        program.programId
      )[0];

      try {
        await program.methods
          .followUser()
          .accounts({
            userProfile: nonExistentProfilePda,
            targetProfile: user1ProfilePda,
            user: userWithoutProfile.publicKey,
            target: user.publicKey,
          })
          .signers([userWithoutProfile])
          .rpc();

        assert.fail("Should have failed without follower profile");
      } catch (error) {
        assert(error instanceof Error);
      }
    });
  });

  describe("edge cases", () => {
    it("should handle multiple tweets correctly", async () => {
      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), user.publicKey.toBuffer()],
        program.programId
      );

      for (let i = 1; i <= 3; i++) {
        const [tweetPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("tweet"),
            user.publicKey.toBuffer(),
            new Uint8Array([i]),
          ],
          program.programId
        );

        await program.methods
          .sendTweet(`Tweet number ${i}`)
          .accounts({
            tweet: tweetPda,
            profile: profilePda,
            author: user.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
      }

      const profile = await program.account.profile.fetch(profilePda);
      assert(profile.tweetCount.eq(new BN(4)));
    });

    it("should emit events correctly", async () => {
      const [tweetPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("tweet"), user.publicKey.toBuffer(), new Uint8Array([4])],
        program.programId
      );

      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), user.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .sendTweet("Test tweet for events")
        .accounts({
          tweet: tweetPda,
          profile: profilePda,
          author: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      let eventEmitted = false;

      const eventListener = program.addEventListener(
        "tweetLiked",
        (event, slot) => {
          assert.equal(event.tweet.toString(), tweetPda.toString());
          assert.equal(event.user.toString(), user.publicKey.toString());
          eventEmitted = true;
        }
      );

      await program.methods
        .likeTweet()
        .accounts({
          tweet: tweetPda,
          user: user.publicKey,
        })
        .rpc();

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await program.removeEventListener(eventListener);

      assert(eventEmitted, "TweetLiked event should have been emitted");
    });
  });
});
