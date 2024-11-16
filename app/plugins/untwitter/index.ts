import { tool } from "@langchain/core/tools";
import { PluginMetadata } from "../types";
import axios from "axios";
import { sleep } from "../../utils/miscUtils";
import {
  extractSearchUserResponse,
  formatGetUserResponse,
  formatGetUserTweetsResponse,
  formatLatestSearchResponse,
} from "./helper/helper";
import { z } from "zod";

export const metadata: PluginMetadata = {
  name: "Twitter Tools",
  description:
    "A suite of tools for accessing and analyzing Twitter data, including tweets, user profiles, and user posts. These tools are ideal for social media analysts, marketers, and developers seeking detailed Twitter insights.",
  tools: [
    {
      id: "search_top_tweets",
      name: "Search Top Tweets",
      description: `Search for tweets based on relevance or popularity using a specific query.
      
      Key Features:
      - Retrieves tweets with details including text, creation time, engagement metrics (likes, retweets, replies, views), and user data.
      - Filters tweets to include only those posted after a specific Unix timestamp.
      - Supports pagination for extended queries.

      Use Cases:
      - Fetch tweets for trending topics or hashtags.
      - Analyze popular tweets related to a keyword.
      - Retrieve tweets posted within a specific timeframe.`,
    },
    {
      id: "search_latest_tweets",
      name: "Search Latest Tweets",
      description: `Search for the latest tweets based on a query. Retrieves tweets in chronological order.

      Key Features:
      - Provides tweet details such as text, creation time, and engagement metrics.
      - Filters tweets based on a specific Unix timestamp.
      - Supports pagination for extended queries.

      Use Cases:
      - Retrieve the most recent tweets for real-time monitoring.
      - Filter tweets to include only those posted after a specific time.
      - Fetch paginated results for deeper analysis.`,
    },
    {
      id: "get_user_posts",
      name: "Get User Posts",
      description: `Retrieve tweets from a specific user by their user ID.

      Key Features:
      - Provides tweet details, including text, engagement metrics, and creation time.
      - Supports pagination for fetching additional tweets.
      - Allows filtering tweets by a specific Unix timestamp.

      Use Cases:
      - Analyze tweets posted by a specific user.
      - Retrieve user-specific tweet data for content or trend analysis.
      - Filter tweets to focus on recent or relevant posts.`,
    },
    {
      id: "search_users",
      name: "Search Users",
      description: `Search for user profiles based on a query.

      Key Features:
      - Retrieves user details such as name, username, profile description, followers, and verification status.
      - Includes user metadata like account creation date and profile images.
      - Supports pagination for extended searches.

      Use Cases:
      - Discover users related to a keyword or topic.
      - Analyze user profiles for targeted social media campaigns.
      - Explore a list of users matching a specific query.`,
    },
    {
      id: "get_user",
      name: "Get User Details",
      description: `Fetch detailed information about a Twitter user by their user ID.

      Key Features:
      - Provides user details, including name, username, description, profile images, and verification status.
      - Includes metadata such as followers count, statuses count, and account creation date.

      Use Cases:
      - Retrieve detailed user information for analysis.
      - Validate user authenticity or profile attributes.
      - Fetch user-specific metrics for targeted interactions.`,
    },
  ],
};

const headers = {
  "x-rapidapi-host": "twttrapi.p.rapidapi.com",
  "x-rapidapi-key": process.env.RAPID_API_KEY,
};

export const searchTopTweetsTool = tool(
  async ({ query, cursor, untilUnixTimestamp }) => {
    try {
      console.log(
        `\n\n========== Calling Untwitter search top tweets with query: ${query} ==========\n\n`
      );

      const params = { query, cursor: cursor || undefined };
      let allTweets: any[] = [];
      let hasMoreTweets = true;

      while (hasMoreTweets) {
        const response = await axios.get(
          "https://twttrapi.p.rapidapi.com/search-top",
          {
            params: { query: params.query, cursor: params.cursor },
            headers,
          }
        );

        const restructuredData = formatLatestSearchResponse(response.data);

        if (!restructuredData.tweets.length) {
          hasMoreTweets = false;
          break;
        }

        allTweets = [...allTweets, ...restructuredData.tweets];

        const lastTweetTimestamp =
          restructuredData.tweets[restructuredData.tweets.length - 1].createdAt;

        if (
          untilUnixTimestamp > 0 &&
          lastTweetTimestamp <= untilUnixTimestamp
        ) {
          hasMoreTweets = false;
          break;
        }

        if (!params.cursor) {
          hasMoreTweets = false;
          break;
        }

        await sleep(1000);
      }

      const tweets = allTweets.filter(
        (tweet) => tweet.createdAt >= untilUnixTimestamp
      );

      return JSON.stringify(tweets, null, 2);
    } catch (error: any) {
      console.error("Error searching top tweets:", error);
      return JSON.stringify({ error: "Error searching top tweets" });
    }
  },
  {
    name: "search_top_tweets",
    description: `
      Searches for top tweets based on a query. Retrieves tweets matching the query, sorted by relevance or popularity.

      Features:
      - Filters tweets based on a required Unix timestamp.
      - Supports cursor-based pagination for retrieving additional tweets.
      - Processes raw data into a structured format for easy consumption.

      Use Cases:
      - Fetch trending tweets for a given keyword or hashtag.
      - Retrieve relevant tweets for analysis or content gathering.
      - Ensure only tweets posted after the specified timestamp are included.`,
    schema: z.object({
      query: z
        .string()
        .describe(
          "The text query to search for tweets (e.g., keywords or hashtags)."
        ),
      cursor: z
        .string()
        .optional()
        .describe("Pagination cursor for retrieving additional tweets."),
      untilUnixTimestamp: z
        .number()
        .describe("Filter tweets posted after this required Unix timestamp."),
    }),
    tags: ["Twitter", "Social Media", "Search Tweets", "Trending Content"],
  }
);

export const searchLatestTweetsTool = tool(
  async ({ query, cursor, untilUnixTimestamp }) => {
    try {
      console.log(
        `\n\n========== Calling Untwitter search latest tweets with query: ${query} ==========\n\n`
      );

      const params = { query, cursor: cursor || undefined };
      let allTweets: any[] = [];
      let hasMoreTweets = true;

      while (hasMoreTweets) {
        const response = await axios.get(
          "https://twttrapi.p.rapidapi.com/search-latest",
          {
            params: { query: params.query, cursor: params.cursor },
            headers,
          }
        );

        const restructuredData = formatLatestSearchResponse(response.data);

        if (!restructuredData.tweets.length) {
          hasMoreTweets = false;
          break;
        }

        allTweets = [...allTweets, ...restructuredData.tweets];
        const lastTweetTimestamp =
          restructuredData.tweets[restructuredData.tweets.length - 1].createdAt;

        if (lastTweetTimestamp <= untilUnixTimestamp) {
          hasMoreTweets = false;
          break;
        }

        if (!params.cursor) {
          hasMoreTweets = false;
          break;
        }

        await sleep(1000);
      }

      const tweets = allTweets.filter(
        (tweet) => tweet.createdAt >= untilUnixTimestamp
      );

      return JSON.stringify(tweets, null, 2);
    } catch (error: any) {
      console.error("Error searching latest tweets:", error);
      return JSON.stringify({ error: "Error searching latest tweets" });
    }
  },
  {
    name: "search_latest_tweets",
    description: `
      Searches for the latest tweets based on a query. Retrieves tweets sorted by recency and relevance, filtering those posted after a specific Unix timestamp.

      Features:
      - Supports cursor-based pagination for fetching additional tweets.
      - Filters tweets to include only those posted after a required Unix timestamp.
      - Processes raw response data into a structured format for easy usage.

      Use Cases:
      - Retrieve the latest tweets for a given keyword, hashtag, or topic.
      - Ensure that only tweets after a specified time are included.
      - Fetch paginated results for detailed analysis or display.`,
    schema: z.object({
      query: z
        .string()
        .describe(
          "The text query to search for tweets (e.g., keywords or hashtags)."
        ),
      cursor: z
        .string()
        .optional()
        .describe("Pagination cursor for retrieving additional tweets."),
      untilUnixTimestamp: z
        .number()
        .describe("Filter tweets posted after this Unix timestamp (required)."),
    }),
    tags: ["Twitter", "Social Media", "Search Tweets", "Latest Content"],
  }
);

export const getUserPostsTool = tool(
  async ({
    userId,
    cursor,
    untilUnixTimestamp,
    dontLimitWithTimestamp = false,
  }) => {
    try {
      console.log(
        `\n\n========== Calling Untwitter get user posts with userId: ${userId} ==========\n\n`
      );

      let allTweets: any[] = [];
      let hasMoreTweets = true;

      while (hasMoreTweets) {
        const response = await axios.get(
          "https://twttrapi.p.rapidapi.com/user-tweets",
          {
            params: { user_id: userId, cursor: cursor || undefined },
            headers,
          }
        );

        const restructuredData = formatGetUserTweetsResponse(response.data);

        if (!restructuredData.tweets.length) {
          // No more tweets available
          hasMoreTweets = false;
          break;
        }

        allTweets = [...allTweets, ...restructuredData.tweets];

        const lastTweetTimestamp =
          restructuredData.tweets[restructuredData.tweets.length - 1].createdAt;

        if (
          !dontLimitWithTimestamp &&
          untilUnixTimestamp > 0 &&
          lastTweetTimestamp <= untilUnixTimestamp
        ) {
          // Stop fetching when tweets are older than the given timestamp
          hasMoreTweets = false;
          break;
        }

        // Update cursor for the next API call
        cursor = restructuredData.bottomCursor || null;

        if (!cursor) {
          // End of pagination
          hasMoreTweets = false;
          break;
        }

        // Sleep for 1 second to avoid rate limit
        await sleep(1000);
      }

      // Apply timestamp filter if required
      let tweets = allTweets;

      if (!dontLimitWithTimestamp && untilUnixTimestamp > 0) {
        console.log({ untilUnixTimestamp });
        tweets = tweets.filter(
          (tweet) => tweet.createdAt >= untilUnixTimestamp
        );
      }

      const parsedData = {
        tweets,
        lastCursor: cursor ?? null,
      };

      return JSON.stringify(parsedData, null, 2);
    } catch (error: any) {
      console.error("Error fetching user posts:", error);
      return JSON.stringify({ error: "Error fetching user posts" });
    }
  },
  {
    name: "get_user_posts",
    description: `
      Retrieves tweets posted by a specific user based on their user ID. Supports cursor-based pagination and filtering tweets by a Unix timestamp.

      Features:
      - Fetches tweets for a user using their user ID.
      - Supports optional cursor for paginated results.
      - Allows filtering tweets based on a specific Unix timestamp.
      - Processes raw response data into a structured format for easy usage.

      Use Cases:
      - Analyze tweets posted by a user.
      - Fetch user-specific tweet data for display or content analysis.
      - Use timestamp filtering to retrieve recent tweets only.`,
    schema: z.object({
      userId: z
        .string()
        .describe("The unique identifier (user ID) of the Twitter user."),
      cursor: z
        .string()
        .optional()
        .nullable()
        .describe("Pagination cursor for retrieving additional tweets."),
      untilUnixTimestamp: z
        .number()
        .describe(
          "Filter tweets posted after this Unix timestamp. Required unless 'dontLimitWithTimestamp' is true."
        ),
      dontLimitWithTimestamp: z
        .boolean()
        .optional()
        .describe("If true, skips filtering tweets by timestamp."),
    }),
    tags: ["Twitter", "Social Media", "User Posts", "Tweets"],
  }
);

export const searchUsersTool = tool(
  async ({ query, cursor }) => {
    try {
      console.log(
        `\n\n========== Calling Untwitter search users with query: ${query} ==========\n\n`
      );

      const response = await axios.get(
        `https://twttrapi.p.rapidapi.com/search-users`,
        {
          params: { query, cursor: cursor || undefined },
          headers,
        }
      );

      const parsedData = extractSearchUserResponse(response.data);

      return JSON.stringify(parsedData, null, 2);
    } catch (error: any) {
      console.error("Error searching users:", error);
      return JSON.stringify({ error: "Error searching users" });
    }
  },
  {
    name: "search_users",
    description: `
      Searches for twitter users based on a query. Retrieves user profiles that match the query and supports pagination.

      Features:
      - Allows querying for user profiles using a keyword or name.
      - Supports cursor-based pagination for fetching additional users.
      - Processes raw data into a structured format for easy usage.

      Use Cases:
      - Retrieve user profiles matching a specific keyword or name.
      - Explore users for content analysis or social media interactions.
      - Paginate through user results for a comprehensive list.`,
    schema: z.object({
      query: z
        .string()
        .describe(
          "The text query to search for users (e.g., names or keywords)."
        ),
      cursor: z
        .string()
        .optional()
        .describe("Pagination cursor for retrieving additional users."),
    }),
    tags: ["Twitter", "Social Media", "Search Users", "User Profiles"],
  }
);

export const getUserTool = tool(
  async ({ userId }) => {
    try {
      console.log(
        `\n\n========== Calling Untwitter get user with userId: ${userId} ==========\n\n`
      );

      const response = await axios.get(
        `https://twttrapi.p.rapidapi.com/get-user-by-id`,
        {
          params: { user_id: userId },
          headers,
        }
      );

      const parsedData = formatGetUserResponse(response.data);

      return JSON.stringify(parsedData, null, 2);
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      return JSON.stringify({ error: "Error fetching user data" });
    }
  },
  {
    name: "get_user",
    description: `
      Fetches detailed information about a Twitter user by their user ID.

      Features:
      - Retrieves a single user's profile details using their unique user ID.
      - Processes raw user data into a structured format for easy consumption.

      Use Cases:
      - Retrieve user details for analysis or display.
      - Fetch user-specific data such as name, username, profile picture, followers, and more.
      - Use the user ID to get precise and reliable user information.`,
    schema: z.object({
      userId: z
        .string()
        .describe(
          "The unique identifier (user ID) of the Twitter user to retrieve."
        ),
    }),
    tags: ["Twitter", "Social Media", "User Details", "User Profiles"],
  }
);
