import { useState, useEffect } from "react";
import { TweetCard } from "./TweetCard";
import { Tweet } from "@/types/program";
import { PublicKey } from "@solana/web3.js";
import { useProgram } from "@/contexts/ProgramProvider";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface FeedProps {
  refreshTrigger?: number;
}

export const Feed = ({ refreshTrigger = 0 }: FeedProps) => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { program } = useProgram();

  const fetchTweets = async () => {
    if (!program) return;

    setIsLoading(true);
    try {
      // Get all tweet accounts
      const tweetAccounts = await program.account.tweet.all();

      // Convert to Tweet array and sort by timestamp (newest first)
      const fetchedTweets = tweetAccounts
        .map((account) => ({
          publicKey: account.publicKey,
          ...account.account,
        }))
        .sort((a, b) => b.timestamp.toNumber() - a.timestamp.toNumber());

      console.log("Fetched tweets:", fetchedTweets);
      setTweets(fetchedTweets as Tweet[]);
    } catch (error) {
      console.error("Error fetching tweets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, [program, refreshTrigger]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Latest Tweets</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTweets}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {tweets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No tweets yet. Be the first to post!
          </p>
        </div>
      ) : (
        tweets.map((tweet, index) => (
          <TweetCard
            key={`${tweet.author.toString()}-${index}`}
            tweet={tweet}
          />
        ))
      )}
    </div>
  );
};
