import { Navigation } from "@/components/Navigation";
import { TweetComposer } from "@/components/TweetComposer";
import { Feed } from "@/components/Feed";
import { ProfileCard } from "@/components/ProfileCard";
import { WalletProvider } from "@/contexts/WalletProvider";
import { useState } from "react";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleProfileUpdate = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleTweetPosted = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <WalletProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <TweetComposer onTweetPosted={handleTweetPosted} />
              <Feed refreshTrigger={refreshTrigger} />
            </div>
            <div className="space-y-6">
              <ProfileCard
                profile={null}
                onProfileUpdate={handleProfileUpdate}
              />
            </div>
          </div>
        </main>
      </div>
    </WalletProvider>
  );
};

export default Index;
