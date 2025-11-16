use anchor_lang::prelude::*;

declare_id!("4se6A74JXwE467VyoVpB9DcitWk9jd7Mf68XsbZ1r31T");

#[program]
pub mod x_onchain {
    use super::*;

    // Create user profile
    pub fn create_profile(ctx: Context<CreateProfile>, handle: String, name: String) -> Result<()> {
        let profile = &mut ctx.accounts.profile;
        let user = &ctx.accounts.user;
        
        profile.author = user.key();
        profile.handle = handle;
        profile.name = name;
        profile.tweet_count = 0;
        profile.followers = 0;
        profile.following = 0;
        
        msg!("Profile created for: {}", user.key());
        Ok(())
    }

    // Post a tweet
    pub fn send_tweet(ctx: Context<SendTweet>, content: String) -> Result<()> {
        require!(content.len() <= 280, ErrorCode::ContentTooLong);
        
        let tweet = &mut ctx.accounts.tweet;
        let profile = &mut ctx.accounts.profile;
        let author = &ctx.accounts.author;
        
        tweet.author = author.key();
        tweet.timestamp = Clock::get()?.unix_timestamp;
        tweet.content = content;
        tweet.likes = 0;
        tweet.comments = 0;
        
        profile.tweet_count += 1;
        
        msg!("Tweet posted by: {}", author.key());
        Ok(())
    }

    // Like a tweet
    pub fn like_tweet(ctx: Context<LikeTweet>) -> Result<()> {
        let tweet = &mut ctx.accounts.tweet;
        tweet.likes += 1;
        
        emit!(TweetLiked {
            tweet: tweet.key(),
            user: ctx.accounts.user.key(),
            timestamp: Clock::get()?.unix_timestamp
        });
        
        Ok(())
    }

    // Follow a user
    pub fn follow_user(ctx: Context<FollowUser>) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        let target_profile = &mut ctx.accounts.target_profile;
        
        user_profile.following += 1;
        target_profile.followers += 1;
        
        emit!(UserFollowed {
            follower: user_profile.author,
            following: target_profile.author,
            timestamp: Clock::get()?.unix_timestamp
        });
        
        Ok(())
    }
}

// Accounts
#[derive(Accounts)]
#[instruction(handle: String)]
pub struct CreateProfile<'info> {
    #[account(
        init,
        payer = user,
        space = Profile::INIT_SPACE,
        seeds = [b"profile", user.key().as_ref()],
        bump
    )]
    pub profile: Account<'info, Profile>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SendTweet<'info> {
    #[account(
        init,
        payer = author,
        space = Tweet::INIT_SPACE,
        seeds = [b"tweet", author.key().as_ref(), &[profile.tweet_count as u8]],
        bump
    )]
    pub tweet: Account<'info, Tweet>,
    
    #[account(
        mut,
        seeds = [b"profile", author.key().as_ref()],
        bump,
        has_one = author
    )]
    pub profile: Account<'info, Profile>,
    
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LikeTweet<'info> {
    #[account(mut)]
    pub tweet: Account<'info, Tweet>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct FollowUser<'info> {
    #[account(
        mut,
        seeds = [b"profile", user.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, Profile>,
    
    #[account(
        mut,
        seeds = [b"profile", target.key().as_ref()],
        bump
    )]
    pub target_profile: Account<'info, Profile>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    pub target: SystemAccount<'info>,
}

// Data Structures
#[account]
#[derive(InitSpace)]
pub struct Profile {
    pub author: Pubkey,
    #[max_len(15)]
    pub handle: String,
    #[max_len(50)]
    pub name: String,
    pub tweet_count: u64,
    pub followers: u64,
    pub following: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Tweet {
    pub author: Pubkey,
    pub timestamp: i64,
    #[max_len(280)]
    pub content: String,
    pub likes: u64,
    pub comments: u64,
}

// Events
#[event]
pub struct TweetLiked {
    pub tweet: Pubkey,
    pub user: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct UserFollowed {
    pub follower: Pubkey,
    pub following: Pubkey,
    pub timestamp: i64,
}

// Error Codes
#[error_code]
pub enum ErrorCode {
    #[msg("Tweet content too long")]
    ContentTooLong,
}