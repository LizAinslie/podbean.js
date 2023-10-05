export type LoginResponseSuccess = {
  access_token: string;
  token_type: 'Bearer';
  scope: string;
  expires_in: number;
};

export type LoginResponseInvalidGrantType = {
  error: 'invalid_grant';
  error_description: string;
};

export type ResponseInvalidToken = {
  error: 'invalid_token';
  error_description: string;
};

export type FetchPodcastResponseSuccess = {
  podcast: PodcastObject;
}

export type FetchSingleEpisodeResponseSuccess = {
  episode: EpisodeObject;
}

export type FetchMultipleEpisodesResponseSuccess = {
  episodes: EpisodeObject[];
  offset: number;
  limit: number;
  count: number;
  has_more: boolean;
}

export type EpisodeTypeEnum = 'public' | 'premium' | 'private';
export type EpisodeStatusEnum = 'draft' | 'publish';
export type AppleEpisodeTypeEnum = 'full' | 'trailer' | 'bonus';
export type EpisodeExplicitContentEnum = 'clean' | 'explicit';
export type PodcastStatusEnum = 'release' | 'draft';

export type PodcastObject = {
  id: string;
  title: string;
  desc: string;
  website: string;
  status: PodcastStatusEnum;
  logo: string;
  category_name: string;
  allow_episode_type: EpisodeTypeEnum[];
  object: 'Podcast';
};

export type EpisodeObject = {
  id: string;
  podcast_id: string;
  title: string;
  content: string;
  logo: string;
  media_url: string;
  player_url: string;
  permalink_url: string;
  publish_time: number; // DON'T USE THIS RAW - WRAP WITH DATETIME OBJECT
  duration: number | null;
  status: EpisodeStatusEnum;
  type: EpisodeTypeEnum;
  season_number: number;
  episode_number: number;
  apple_episode_type: AppleEpisodeTypeEnum;
  transcripts_url: string;
  content_explicit: EpisodeExplicitContentEnum;
  object: 'Episode';
};