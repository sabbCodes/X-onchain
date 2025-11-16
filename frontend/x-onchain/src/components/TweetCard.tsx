import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";
import { Tweet } from "@/types/program";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "@/contexts/ProgramProvider";

interface TweetCardProps {
  tweet: Tweet & { publicKey?: PublicKey };
}

export const TweetCard = ({ tweet }: TweetCardProps) => {
  const [likes, setLikes] = useState(tweet.likes.toNumber());
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const { connected, publicKey } = useWallet();
  const { program } = useProgram();

  const handleLike = async () => {
    if (!connected || !publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!program || !tweet.publicKey) {
      toast.error("Unable to like tweet");
      return;
    }

    setIsLiking(true);
    try {
      await program.methods
        .likeTweet()
        .accounts({
          tweet: tweet.publicKey,
          user: publicKey,
        })
        .rpc();

      // Update local state
      if (isLiked) {
        setLikes(likes - 1);
        setIsLiked(false);
        toast.success("Like removed");
      } else {
        setLikes(likes + 1);
        setIsLiked(true);
        toast.success("Tweet liked!");
      }
    } catch (error: any) {
      console.error("Error liking tweet:", error);
      if (error.message?.includes("Account does not exist")) {
        toast.error("Tweet not found");
      } else {
        toast.error("Failed to like tweet");
      }
    } finally {
      setIsLiking(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const shortenAddress = (address: PublicKey) => {
    const str = address.toString();
    return `${str.slice(0, 4)}...${str.slice(-4)}`;
  };

  return (
    <Card className="p-4 border-border hover:bg-tweet-hover transition-colors cursor-pointer">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold">
                {shortenAddress(tweet.author).slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold">{shortenAddress(tweet.author)}</p>
              <p className="text-sm text-muted-foreground">
                {formatTimestamp(tweet.timestamp.toNumber())}
              </p>
            </div>
          </div>
        </div>

        <p className="text-base leading-relaxed">{tweet.content}</p>

        <div className="flex items-center gap-6 pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-primary"
            disabled
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">{tweet.comments.toNumber()}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-green-500"
            disabled
          >
            <Repeat2 className="h-4 w-4" />
            <span className="text-sm">0</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${
              isLiked
                ? "text-pink-500 hover:text-pink-600"
                : "text-muted-foreground hover:text-pink-500"
            }`}
            onClick={handleLike}
            disabled={isLiking}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-sm">{likes}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};
