/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/x_onchain.json`.
 */
export type XOnchain = {
  "address": "4se6A74JXwE467VyoVpB9DcitWk9jd7Mf68XsbZ1r31T",
  "metadata": {
    "name": "xOnchain",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createProfile",
      "discriminator": [
        225,
        205,
        234,
        143,
        17,
        186,
        50,
        220
      ],
      "accounts": [
        {
          "name": "profile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "handle",
          "type": "string"
        },
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "followUser",
      "discriminator": [
        126,
        176,
        97,
        36,
        63,
        145,
        4,
        134
      ],
      "accounts": [
        {
          "name": "userProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "targetProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "target"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "target"
        }
      ],
      "args": []
    },
    {
      "name": "likeTweet",
      "discriminator": [
        248,
        27,
        137,
        254,
        228,
        130,
        141,
        149
      ],
      "accounts": [
        {
          "name": "tweet",
          "writable": true
        },
        {
          "name": "user",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "sendTweet",
      "discriminator": [
        179,
        213,
        79,
        165,
        123,
        247,
        82,
        109
      ],
      "accounts": [
        {
          "name": "tweet",
          "writable": true
        },
        {
          "name": "profile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "author"
              }
            ]
          }
        },
        {
          "name": "author",
          "writable": true,
          "signer": true,
          "relations": [
            "profile"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "content",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "profile",
      "discriminator": [
        184,
        101,
        165,
        188,
        95,
        63,
        127,
        188
      ]
    },
    {
      "name": "tweet",
      "discriminator": [
        229,
        13,
        110,
        58,
        118,
        6,
        20,
        79
      ]
    }
  ],
  "events": [
    {
      "name": "tweetLiked",
      "discriminator": [
        77,
        140,
        67,
        248,
        123,
        46,
        242,
        156
      ]
    },
    {
      "name": "userFollowed",
      "discriminator": [
        202,
        223,
        169,
        156,
        158,
        234,
        167,
        17
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "contentTooLong",
      "msg": "Tweet content too long"
    }
  ],
  "types": [
    {
      "name": "profile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "pubkey"
          },
          {
            "name": "handle",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "tweetCount",
            "type": "u64"
          },
          {
            "name": "followers",
            "type": "u64"
          },
          {
            "name": "following",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tweet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "content",
            "type": "string"
          },
          {
            "name": "likes",
            "type": "u64"
          },
          {
            "name": "comments",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tweetLiked",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tweet",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "userFollowed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "follower",
            "type": "pubkey"
          },
          {
            "name": "following",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
