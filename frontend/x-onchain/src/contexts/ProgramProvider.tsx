import { createContext, useContext, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, web3, BN } from "@coral-xyz/anchor";
import { XOnchain } from "@/components/x_onchain";
// import { PublicKey } from "@solana/web3.js";
import idl from "@/components/x_onchain.json";

interface ProgramContextType {
  program: Program<XOnchain> | null;
  isInitialized: boolean;
}

const ProgramContext = createContext<ProgramContextType>({
  program: null,
  isInitialized: false,
});

export const ProgramProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [program, setProgram] = useState<Program<XOnchain> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (wallet.connected && connection && wallet.publicKey) {
      const provider = new AnchorProvider(connection, wallet as any, {
        preflightCommitment: "confirmed",
        commitment: "confirmed",
      });

      const program = new Program(idl as any, provider);
      setProgram(program);
      setIsInitialized(true);
    } else {
      setProgram(null);
      setIsInitialized(false);
    }
  }, [wallet, connection]);

  return (
    <ProgramContext.Provider value={{ program, isInitialized }}>
      {children}
    </ProgramContext.Provider>
  );
};

export const useProgram = () => useContext(ProgramContext);
