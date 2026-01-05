
import { YouTubeChannel, YouTubeVideo, YouTubeComment } from '../types';

export class YouTubeService {
  private apiKey: string;
  private accessToken: string | null = null;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async fetchFromApi(endpoint: string, params: Record<string, string>, method = 'GET', body?: any) {
    const queryParams = new URLSearchParams({ ...params });
    if (!this.accessToken) {
        queryParams.append('key', this.apiKey);
    }
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    
    if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const url = `${this.baseUrl}/${endpoint}?${queryParams.toString()}`;
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Failed to fetch from YouTube API: ${response.statusText}`);
    }
    
    if (response.status === 204) return null;
    return response.json();
  }

  async searchChannel(query: string): Promise<string | null> {
    if (query.startsWith('UC')) return query;
    const data = await this.fetchFromApi('search', {
      part: 'snippet',
      q: query,
      type: 'channel',
      maxResults: '1',
    });
    return data.items?.[0]?.id?.channelId || null;
  }

  async getChannelDetails(channelId: string): Promise<YouTubeChannel> {
    const data = await this.fetchFromApi('channels', {
      part: 'snippet,statistics,brandingSettings',
      id: channelId,
    });

    const item = data.items?.[0];
    if (!item) throw new Error('Channel not found');

    return {
      id: item.id,
      title: item.snippet.title,
      handle: item.snippet.customUrl || `@${item.snippet.title.replace(/\s+/g, '').toLowerCase()}`,
      description: item.snippet.description,
      customUrl: item.snippet.customUrl,
      publishedAt: item.snippet.publishedAt,
      thumbnails: item.snippet.thumbnails,
      bannerImageUrl: item.brandingSettings?.image?.bannerExternalUrl,
      statistics: item.statistics,
    };
  }

  async getVideos(channelId: string, maxResults = 20): Promise<YouTubeVideo[]> {
    const channelData = await this.fetchFromApi('channels', {
      part: 'contentDetails',
      id: channelId,
    });
    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    const playlistItems = await this.fetchFromApi('playlistItems', {
      part: 'snippet,contentDetails',
      playlistId: uploadsPlaylistId,
      maxResults: maxResults.toString(),
    });

    const videoIds = playlistItems.items.map((item: any) => item.contentDetails.videoId).join(',');
    
    const videoDetails = await this.fetchFromApi('videos', {
      part: 'snippet,statistics,contentDetails',
      id: videoIds,
    });

    return videoDetails.items.map((item: any) => {
      const duration = item.contentDetails.duration;
      const isShort = duration.includes('S') && !duration.includes('M') && !duration.includes('H');
      
      return {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        publishedAt: item.snippet.publishedAt,
        viewCount: item.statistics.viewCount,
        likeCount: item.statistics.likeCount,
        commentCount: item.statistics.commentCount,
        duration: duration,
        isShort: isShort,
      };
    });
  }

  async getVideoComments(videoId: string): Promise<YouTubeComment[]> {
    try {
      const data = await this.fetchFromApi('commentThreads', {
        part: 'snippet',
        videoId: videoId,
        maxResults: '20',
        order: 'relevance',
      });

      return data.items.map((item: any) => ({
        id: item.id,
        authorName: item.snippet.topLevelComment.snippet.authorDisplayName,
        authorProfileImageUrl: item.snippet.topLevelComment.snippet.authorProfileImageUrl,
        textDisplay: item.snippet.topLevelComment.snippet.textDisplay,
        likeCount: item.snippet.topLevelComment.snippet.likeCount,
        publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
      }));
    } catch (e) {
      return [];
    }
  }

  // --- Real Interaction Methods ---

  async rateVideo(videoId: string, rating: 'like' | 'none' | 'dislike') {
    return this.fetchFromApi('videos/rate', { id: videoId, rating }, 'POST');
  }

  async subscribe(channelId: string) {
    return this.fetchFromApi('subscriptions', { part: 'snippet' }, 'POST', {
      snippet: {
        resourceId: {
          kind: 'youtube#channel',
          channelId: channelId,
        },
      },
    });
  }

  async postComment(videoId: string, text: string) {
    return this.fetchFromApi('commentThreads', { part: 'snippet' }, 'POST', {
      snippet: {
        videoId: videoId,
        topLevelComment: {
          snippet: {
            textOriginal: text,
          },
        },
      },
    });
  }
}
