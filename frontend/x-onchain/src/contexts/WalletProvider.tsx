import { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { DEVNET_ENDPOINT } from "@/lib/anchor";

import "@solana/wallet-adapter-react-ui/styles.css";
import { ProgramProvider } from "./ProgramProvider";

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={DEVNET_ENDPOINT}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <ProgramProvider>
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </ProgramProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};
