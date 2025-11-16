# Project Description

**Deployed Frontend URL:** *[To be added after frontend deployment]*

**Solana Program ID:** `4se6A74JXwE467VyoVpB9DcitWk9jd7Mf68XsbZ1r31T`

## Project Overview

### Description
A decentralized Twitter/X clone built entirely on-chain using Solana. Users can create profiles, post tweets, like content, and follow other users. All social interactions are stored directly on the Solana blockchain, creating a truly decentralized social media platform where users own their data and relationships.

### Key Features
- **User Profiles**: Create unique profiles with handle and display name
- **Tweet Publishing**: Post 280-character messages to the blockchain
- **Social Interactions**: Like tweets and follow other users
- **On-Chain Events**: Real-time notifications for social actions
- **Data Ownership**: Users maintain full control over their content and social graph

### How to Use the dApp
1. **Connect Wallet** - Connect your Solana wallet (Phantom, Backpack, etc.)
2. **Create Profile** - Set up your profile with a unique handle and display name
3. **Post Tweets** - Share your thoughts in 280-character messages stored on-chain
4. **Engage Socially** - Like tweets from other users and follow interesting accounts
5. **Build Network** - Grow your follower base and follow other creators

## Program Architecture
X-OnChain implements a comprehensive social media platform with user profiles, content publishing, and social interactions. The program uses PDAs extensively to create deterministic accounts for users and their content, ensuring data integrity and proper access control.

### PDA Usage
The program uses Program Derived Addresses to create unique, deterministic accounts for each user and their content.

**PDAs Used:**
- **Profile PDA**: Derived from seeds `["profile", user_wallet_pubkey]` - ensures each user has exactly one profile
- **Tweet PDA**: Derived from seeds `["tweet", user_wallet_pubkey, tweet_index]` - creates unique tweet accounts with proper ordering

### Program Instructions
**Instructions Implemented:**
- **create_profile**: Initialize a user profile with handle and display name
- **send_tweet**: Post a new tweet with 280-character content limit
- **like_tweet**: Like a tweet (increases like count)
- **follow_user**: Follow another user (updates follower/following counts)

### Account Structure
```rust
#[account]
pub struct Profile {
    pub authority: Pubkey,    // The wallet that owns this profile
    pub handle: String,       // Unique user handle (@username)
    pub name: String,         // Display name
    pub tweet_count: u64,     // Total tweets posted
    pub followers: u64,       // Number of followers
    pub following: u64,       // Number of users followed
}

#[account]
pub struct Tweet {
    pub author: Pubkey,       // The wallet that created this tweet
    pub timestamp: i64,       // Unix timestamp when tweet was posted
    pub content: String,      // Tweet content (max 280 chars)
    pub likes: u64,           // Number of likes received
    pub comments: u64,        // Number of comments (future feature)
}

## Testing

### Test Coverage
Comprehensive test suite covering all instructions with both successful operations and error conditions to ensure program security and reliability.

**Happy Path Tests:**
- **Create Profile:** Successfully creates user profile with correct initial values

- **Send Tweet:** Properly posts tweet with content and tracks tweet count

- **Like Tweet:** Increases like count and emits event

- **Follow User:** Updates follower/following counts for both users

- **Multiple Tweets:** Handles sequential tweet posting correctly

- **Event Emission:** Verifies on-chain events are properly emitted

**Unhappy Path Tests:**
- **Duplicate Profile:** Fails when trying to create multiple profiles for same user

- **Long Handle:** Fails when profile handle exceeds maximum length

- **Long Tweet:** Fails when tweet content exceeds 280 characters

- **No Profile:** Fails when tweeting without a profile

- **Non-existent Tweet:** Fails when trying to like non-existent tweet

- **Non-existent User:** Fails when trying to follow non-existent user

### Running Tests
```bash
cd anchor_project
cd x-onchain
yarn install    # install dependencies
anchor test     # run tests
```

### Additional Notes for Evaluators

This project represents a complete on-chain social media implementation. The biggest challenges were:

Account Relationships: Managing the complex relationships between profiles, tweets, and social interactions while maintaining proper ownership and access control.

PDA Management: Implementing proper PDA derivation for both profiles and tweets, especially handling the tweet indexing system.

Event System: Setting up and testing the on-chain event emission for real-time social interactions.

Test Isolation: Creating robust tests that properly isolate user accounts and avoid conflicts between test cases.

The project successfully demonstrates core Solana concepts including PDAs, account management, program-derived addressing, cross-program invocation patterns, and on-chain event systems. The architecture is designed to be extensible for future features like comments, retweets, and direct messaging.