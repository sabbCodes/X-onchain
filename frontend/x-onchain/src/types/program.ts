import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export interface Profile {
  author: PublicKey;
  handle: string;
  name: string;
  tweetCount: BN;
  followers: BN;
  following: BN;
}

export interface Tweet {
  author: PublicKey;
  timestamp: BN;
  content: string;
  likes: BN;
  comments: BN;
  publicKey?: PublicKey;
}

export interface Follow {
  follower: PublicKey;
  following: PublicKey;
}

export interface Like {
  user: PublicKey;
  tweet: PublicKey;
}
