const convertTwitterDateToUnixTimestamp = (dateString: string): number => {
  return Math.floor(new Date(dateString).getTime() / 1000);
};

export function extractTweetSearchData(
  entry: any
): { tweet: any; user: any } | null {
  const tweetResult = entry.content.content.tweetResult.result;
  const userResult = tweetResult?.core?.user_result?.result;
  const community = tweetResult?.tweet?.community;

  if (!tweetResult) {
    console.error("Error extracting tweet data:", { tweetResult, userResult });
    return null;
  }

  let data: { tweet: any; user: any };
  if (userResult) {
    data = {
      tweet: {
        idStr: tweetResult.rest_id,
        createdAt: convertTwitterDateToUnixTimestamp(
          tweetResult.legacy.created_at
        ),
        fullText: tweetResult.legacy.full_text,
        bookmarkCount:
          tweetResult.legacy.bookmark_count !== undefined
            ? parseInt(tweetResult.legacy.bookmark_count)
            : null,
        favoriteCount:
          tweetResult.legacy.favorite_count !== undefined
            ? parseInt(tweetResult.legacy.favorite_count)
            : null,
        quoteCount:
          tweetResult.legacy.quote_count !== undefined
            ? parseInt(tweetResult.legacy.quote_count)
            : null,
        replyCount:
          tweetResult.legacy.reply_count !== undefined
            ? parseInt(tweetResult.legacy.reply_count)
            : null,
        retweetCount:
          tweetResult.legacy.retweet_count !== undefined
            ? parseInt(tweetResult.legacy.retweet_count)
            : null,
        viewCount:
          tweetResult.view_count_info?.count !== undefined
            ? parseInt(tweetResult.view_count_info.count)
            : null,
      },
      user: {
        idStr: userResult.rest_id,
        name: userResult.legacy.name,
        description: userResult.legacy.description,
        profileBackgroundColor: `#${userResult.legacy.profile_background_color}`,
        profileImageUrlHttps: userResult.legacy.profile_image_url_https,
        protected: userResult.legacy.protected,
        screenName: userResult.legacy.screen_name,
        verified: userResult.legacy.verified,
        followersCount:
          userResult.legacy.followers_count !== undefined
            ? parseInt(userResult.legacy.followers_count)
            : null,
      },
    };
  } else if (community && community.creator_results) {
    const communityTweet = tweetResult.tweet;
    data = {
      tweet: {
        idStr: communityTweet.rest_id,
        createdAt: convertTwitterDateToUnixTimestamp(
          communityTweet.legacy.created_at
        ),
        fullText: communityTweet.legacy.full_text,
        bookmarkCount:
          communityTweet.legacy.bookmark_count !== undefined
            ? parseInt(communityTweet.legacy.bookmark_count)
            : null,
        favoriteCount:
          communityTweet.legacy.favorite_count !== undefined
            ? parseInt(communityTweet.legacy.favorite_count)
            : null,
        quoteCount:
          communityTweet.legacy.quote_count !== undefined
            ? parseInt(communityTweet.legacy.quote_count)
            : null,
        replyCount:
          communityTweet.legacy.reply_count !== undefined
            ? parseInt(communityTweet.legacy.reply_count)
            : null,
        retweetCount:
          communityTweet.legacy.retweet_count !== undefined
            ? parseInt(communityTweet.legacy.retweet_count)
            : null,
        viewCount: null,
      },
      user: {
        idStr: community.creator_results.result.rest_id,
        name: community.creator_results.result.legacy.name,
        description: community.creator_results.result.legacy.description,
        profileBackgroundColor: `#${community.creator_results.result.legacy.profile_background_color}`,
        profileImageUrlHttps:
          community.creator_results.result.legacy.profile_image_url_https,
        protected: community.creator_results.result.legacy.protected,
        screenName: community.creator_results.result.legacy.screen_name,
        verified: community.creator_results.result.legacy.verified,
        followersCount:
          community.creator_results.result.legacy.followers_count !== undefined
            ? parseInt(community.creator_results.result.legacy.followers_count)
            : null,
      },
    };
  } else {
    console.error("Error extracting tweet data:", {
      tweetResult,
      userResult,
      community,
    });
    return null;
  }

  return data;
}

export function formatLatestSearchResponse(response: any): {
  tweets: any[];
  topCursor: string | null;
  bottomCursor: string | null;
} {
  try {
    const instructions =
      response.data.search.timeline_response.timeline.instructions;
    const tweets: any[] = [];
    let topCursor: string | null = null;
    let bottomCursor: string | null = null;

    instructions.forEach((instruction: any) => {
      if (instruction.__typename === "TimelineAddEntries") {
        instruction.entries.forEach((entry: any) => {
          if (
            entry.content.__typename === "TimelineTimelineItem" &&
            entry.content.content.__typename === "TimelineTweet"
          ) {
            const extractedTweetData = extractTweetSearchData(entry);
            if (extractedTweetData) {
              tweets.push(extractedTweetData.tweet);
            }
          }
          if (entry.content.__typename === "TimelineTimelineCursor") {
            if (entry.content.cursorType === "Top") {
              topCursor = entry.content.value;
            } else if (entry.content.cursorType === "Bottom") {
              bottomCursor = entry.content.value;
            }
          }
        });
      } else if (instruction.__typename === "TimelineReplaceEntry") {
        const cursor = instruction.entry.content;
        if (cursor.__typename === "TimelineTimelineCursor") {
          if (cursor.cursorType === "Top") {
            topCursor = cursor.value;
          } else if (cursor.cursorType === "Bottom") {
            bottomCursor = cursor.value;
          }
        }
      }
    });

    return { tweets, topCursor, bottomCursor };
  } catch (error) {
    console.error("Error formatting latest search response:", error);
    return { tweets: [], topCursor: null, bottomCursor: null };
  }
}

export function formatGetUserTweetsResponse(response: any): {
  tweets: any[];
  topCursor: string | null;
  bottomCursor: string | null;
} {
  try {
    const instructions =
      response.data.user_result.result.timeline_response.timeline.instructions;
    const tweets: any[] = [];
    let topCursor: string | null = null;
    let bottomCursor: string | null = null;

    instructions.forEach((instruction: any) => {
      if (instruction.__typename === "TimelineAddEntries") {
        instruction.entries.forEach((entry: any) => {
          if (
            entry.content.__typename === "TimelineTimelineItem" &&
            entry.content.content.__typename === "TimelineTweet"
          ) {
            const extractedTweetData = extractTweetSearchData(entry);
            if (extractedTweetData) {
              tweets.push(extractedTweetData.tweet);
            }
          }
          if (entry.content.__typename === "TimelineTimelineCursor") {
            if (entry.content.cursorType === "Top") {
              topCursor = entry.content.value;
            } else if (entry.content.cursorType === "Bottom") {
              bottomCursor = entry.content.value;
            }
          }
        });
      } else if (instruction.__typename === "TimelineReplaceEntry") {
        const cursor = instruction.entry.content;
        if (cursor.__typename === "TimelineTimelineCursor") {
          if (cursor.cursorType === "Top") {
            topCursor = cursor.value;
          } else if (cursor.cursorType === "Bottom") {
            bottomCursor = cursor.value;
          }
        }
      }
    });

    return { tweets, topCursor, bottomCursor };
  } catch (error) {
    console.error("Error formatting user tweets response:", error);
    return { tweets: [], topCursor: null, bottomCursor: null };
  }
}

export function formatGetUserResponse(response: any): any {
  const userResult = response.data.user_result.result;

  if (!userResult) {
    console.error("Error extracting user data:", { userResult });
    return null;
  }

  const userData = {
    idStr: userResult.rest_id,
    name: userResult.legacy.name,
    description: userResult.legacy.description,
    profileBackgroundColor: `#${userResult.legacy.profile_background_color}`,
    profileImageUrlHttps: userResult.legacy.profile_image_url_https,
    protected: userResult.legacy.protected,
    screenName: userResult.legacy.screen_name,
    verified: userResult.legacy.verified,
    followersCount:
      userResult.legacy.followers_count !== undefined
        ? parseInt(userResult.legacy.followers_count)
        : null,
    friendsCount:
      userResult.legacy.friends_count !== undefined
        ? parseInt(userResult.legacy.friends_count)
        : null,
    statusesCount:
      userResult.legacy.statuses_count !== undefined
        ? parseInt(userResult.legacy.statuses_count)
        : null,
    createdAt: convertTwitterDateToUnixTimestamp(userResult.legacy.created_at),
    location: userResult.legacy.location,
  };

  return userData;
}

export function extractSearchUserResponse(response: any): any[] {
  const users: any[] = [];

  const entries =
    response?.data?.search?.timeline_response?.timeline?.instructions?.find(
      (instruction: any) => instruction.__typename === "TimelineAddEntries"
    )?.entries;

  if (!entries) return users;

  for (const entry of entries) {
    const userResult = entry.content?.content?.userResult?.result;
    if (userResult) {
      users.push({
        idStr: userResult.legacy?.id_str || "",
        name: userResult.legacy?.name || "",
        description: userResult.legacy?.description || "",
        profileBackgroundColor:
          userResult.legacy?.profile_background_color || "",
        profileImageUrlHttps: userResult.legacy?.profile_image_url_https || "",
        protected: userResult.legacy?.protected || false,
        screenName: userResult.legacy?.screen_name || "",
        verified: userResult.legacy?.verified || false,
        followersCount: userResult.legacy?.followers_count || null,
        friendsCount: userResult.legacy?.friends_count || null,
        statusesCount: userResult.legacy?.statuses_count || null,
        createdAt: userResult.legacy?.created_at
          ? new Date(userResult.legacy.created_at).getTime()
          : undefined,
        location: userResult.legacy?.location || "",
      });
    }
  }

  return users;
}
