import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { useProgram } from "@/contexts/ProgramProvider";
import { PublicKey, SystemProgram } from "@solana/web3.js";

const MAX_TWEET_LENGTH = 280;

interface TweetComposerProps {
  onTweetPosted?: () => void;
}

export const TweetComposer = ({ onTweetPosted }: TweetComposerProps) => {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const { publicKey, connected } = useWallet();
  const { program } = useProgram();

  const handlePost = async () => {
    if (!connected || !publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!program) {
      toast.error("Program not initialized");
      return;
    }

    if (content.trim().length === 0) {
      toast.error("Tweet cannot be empty");
      return;
    }

    if (content.length > MAX_TWEET_LENGTH) {
      toast.error(`Tweet is too long (${content.length}/${MAX_TWEET_LENGTH})`);
      return;
    }

    setIsPosting(true);
    try {
      // Get user's profile to check if it exists and get tweet count
      const [profilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), publicKey.toBuffer()],
        program.programId
      );

      let tweetCount = 0;
      try {
        const profile = await program.account.profile.fetch(profilePda);
        tweetCount = profile.tweetCount.toNumber();
      } catch (error) {
        toast.error("Please create a profile first");
        return;
      }

      // Create tweet PDA
      const [tweetPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("tweet"),
          publicKey.toBuffer(),
          new Uint8Array([tweetCount]),
        ],
        program.programId
      );

      // Send the tweet transaction
      const tx = await program.methods
        .sendTweet(content)
        .accounts({
          tweet: tweetPda,
          profile: profilePda,
          author: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success("Tweet posted successfully!");
      setContent("");
      onTweetPosted?.(); // Refresh the feed
    } catch (error: any) {
      console.error("Error posting tweet:", error);
      if (error.message?.includes("Profile does not exist")) {
        toast.error("Please create a profile first");
      } else if (error.message?.includes("ContentTooLong")) {
        toast.error("Tweet content is too long");
      } else {
        toast.error("Failed to post tweet");
      }
    } finally {
      setIsPosting(false);
    }
  };

  const charactersLeft = MAX_TWEET_LENGTH - content.length;
  const isOverLimit = charactersLeft < 0;

  return (
    <Card className="p-4 border-border">
      <div className="space-y-4">
        <Textarea
          placeholder="What's happening on Solana?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px] resize-none border-none focus-visible:ring-0 text-lg"
          disabled={!connected || isPosting}
        />
        <div className="flex items-center justify-between">
          <span
            className={`text-sm font-medium ${
              isOverLimit ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {charactersLeft}
          </span>
          <Button
            onClick={handlePost}
            disabled={
              !connected ||
              isPosting ||
              content.trim().length === 0 ||
              isOverLimit
            }
            className="rounded-full"
          >
            <Send className="mr-2 h-4 w-4" />
            {isPosting ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
