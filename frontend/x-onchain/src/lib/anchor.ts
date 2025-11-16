import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";

export const PROGRAM_ID = new PublicKey("4se6A74JXwE467VyoVpB9DcitWk9jd7Mf68XsbZ1r31T");
export const DEVNET_ENDPOINT = "https://api.devnet.solana.com";

export function getProvider(wallet: AnchorWallet) {
  const connection = new Connection(DEVNET_ENDPOINT, "confirmed");
  return new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
}

export function getProgram(provider: AnchorProvider) {
  // In a real app, you'd fetch and use the actual IDL
  // For now, we'll return the provider for direct program calls
  return provider;
}

export async function findProfilePDA(authority: PublicKey) {
  const [pda] = await PublicKey.findProgramAddress(
    [Buffer.from("profile"), authority.toBuffer()],
    PROGRAM_ID
  );
  return pda;
}

export async function findTweetPDA(author: PublicKey, timestamp: number) {
  const [pda] = await PublicKey.findProgramAddress(
    [
      Buffer.from("tweet"),
      author.toBuffer(),
      Buffer.from(timestamp.toString()),
    ],
    PROGRAM_ID
  );
  return pda;
}
