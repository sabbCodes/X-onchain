import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { Profile } from "@/types/program";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { CreateProfileModal } from "./CreateProfileModal";
import { useProgram } from "@/contexts/ProgramProvider";
import { PublicKey } from "@solana/web3.js";

interface ProfileCardProps {
  profile: Profile | null;
  onProfileUpdate?: () => void;
}

export const ProfileCard = ({ profile, onProfileUpdate }: ProfileCardProps) => {
  const { connected, publicKey } = useWallet();
  const { program } = useProgram();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [followers, setFollowers] = useState(
    profile?.followers?.toNumber() || 0
  );

  // Fetch profile data when program or publicKey changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!program || !publicKey) return;

      try {
        const [profilePda] = PublicKey.findProgramAddressSync(
          [Buffer.from("profile"), publicKey.toBuffer()],
          program.programId
        );

        const profileAccount = await program.account.profile.fetch(profilePda);
        setCurrentProfile(profileAccount as Profile);
      } catch (error) {
        // Profile doesn't exist yet, that's fine
        setCurrentProfile(null);
      }
    };

    fetchProfile();
  }, [program, publicKey]);

  const handleFollow = async () => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      // TODO: Integrate with Anchor program
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (isFollowing) {
        setFollowers(followers - 1);
        setIsFollowing(false);
        toast.success("Unfollowed successfully");
      } else {
        setFollowers(followers + 1);
        setIsFollowing(true);
        toast.success("Followed successfully");
      }
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to follow user");
    }
  };

  const handleProfileCreated = () => {
    onProfileUpdate?.();
    // Refetch profile data
    if (program && publicKey) {
      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), publicKey.toBuffer()],
        program.programId
      );
      program.account.profile.fetch(profilePda).then((profileAccount) => {
        setCurrentProfile(profileAccount as Profile);
      });
    }
  };

  if (!connected || !publicKey) {
    return (
      <Card className="p-6 border-border">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold">Welcome to X-OnChain</h3>
          <p className="text-muted-foreground">
            Connect your Solana wallet to start posting tweets on-chain!
          </p>
        </div>
      </Card>
    );
  }

  if (!currentProfile) {
    return (
      <>
        <Card className="p-6 border-border">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold">Create Your Profile</h3>
            <p className="text-muted-foreground">
              Set up your profile to start tweeting on Solana
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full"
            >
              Create Profile
            </Button>
          </div>
        </Card>
        <CreateProfileModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onProfileCreated={handleProfileCreated}
        />
      </>
    );
  }

  const isOwnProfile = currentProfile.author.equals(publicKey);

  return (
    <>
      <Card className="p-6 border-border">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">{currentProfile.name}</h3>
              <p className="text-muted-foreground">@{currentProfile.handle}</p>
            </div>
            {!isOwnProfile && (
              <Button
                onClick={handleFollow}
                variant={isFollowing ? "outline" : "default"}
                size="sm"
                className="rounded-full"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>

          <div className="flex gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Tweets</p>
              <p className="text-lg font-bold">
                {currentProfile.tweetCount.toNumber()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Followers</p>
              <p className="text-lg font-bold">{followers}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Following</p>
              <p className="text-lg font-bold">
                {currentProfile.following.toNumber()}
              </p>
            </div>
          </div>
        </div>
      </Card>
      <CreateProfileModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProfileCreated={handleProfileCreated}
      />
    </>
  );
};
