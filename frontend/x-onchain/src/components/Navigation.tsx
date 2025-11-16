import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Twitter } from "lucide-react";

export const Navigation = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Twitter className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">X-OnChain</h1>
        </div>
        <WalletMultiButton className="!bg-primary !rounded-full !h-10 !px-6 !font-medium hover:!bg-primary/90 transition-colors" />
      </div>
    </nav>
  );
};
