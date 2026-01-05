
export interface YouTubeChannel {
  id: string;
  title: string;
  handle: string;
  description: string;
  customUrl: string;
  publishedAt: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
  bannerImageUrl?: string;
  statistics: {
    viewCount: string;
    subscriberCount: string;
    videoCount: string;
  };
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
  duration?: string;
  isShort: boolean;
}

export interface YouTubeComment {
  id: string;
  authorName: string;
  authorProfileImageUrl: string;
  textDisplay: string;
  likeCount: number;
  publishedAt: string;
}

export type TabType = 'home' | 'videos' | 'shorts' | 'about';
