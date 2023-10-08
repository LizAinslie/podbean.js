/**
 * Podbean API wrapper for NodeJS.
 * 
 * @author LizAinslie
 */

import { version as WRAPPER_VERSION } from '../package.json';
import { AppleEpisodeTypeEnum, EpisodeExplicitContentEnum, EpisodeObject, EpisodeStatusEnum, EpisodeTypeEnum, FetchMultipleEpisodesResponseSuccess, FetchPodcastResponseSuccess, FetchSingleEpisodeResponseSuccess, LoginResponseInvalidGrantType, LoginResponseSuccess, PodcastObject, PodcastStatusEnum, ResponseInvalidToken } from './apiTypes';
import qs from 'qs';

/**
 * Initialization options for the Podbean Wrapper
 */
export type PodbeanOptions = {
  clientId: string;
  clientSecret: string;
  userAgent?: string;
}

class Cache {
  private episodes: Map<string, Episode>;
  private podcasts: Map<string, Podcast>;
  private accessToken: string;
  private userAgent: string;

  /**
   *
   */
  constructor(accessToken: string, userAgent: string) {
    this.accessToken = accessToken;
    this.userAgent = userAgent;
    this.episodes = new Map();
    this.podcasts = new Map();

    Cache.INSTANCE = this;
  }

  async getOrPutPodcast(id?: string): Promise<Podcast> {
    if (id) {
      if (this.podcasts.has(id)) return this.podcasts.get(id)!;
      
      throw 'TODO: otherwise fetch a podcast by id, add it and return it'
    } else {
      if (!this.accessToken) throw new Error('Please call PodbeanAPI.login() before requesting podcast data.');
      
      const res = await fetch(`${PODBEAN_V1_API_BASE}/podcast?${qs.stringify({
        access_token: this.accessToken,
      })}`, {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
        },
      });

      if (res.status !== 200) throw await res.json();
      else {
        const responseData: FetchPodcastResponseSuccess = await res.json()
        const podcast = new Podcast(responseData.podcast);
        this.podcasts.set(podcast.id, podcast);
        return podcast;
      }
    }
  }

  putEpisode(episode: Episode) {
    this.episodes.set(episode.id, episode);
  }

  async getOrPutEpisode(id: string): Promise<Episode> {
    if (!this.accessToken) throw new Error('Please call PodbeanAPI.login() before requesting podcast data.');

    if (this.episodes.has(id)) return this.episodes.get(id)!;
    else {
      const res = await fetch(`${PODBEAN_V1_API_BASE}/episodes/${id}?${qs.stringify({
        access_token: this.accessToken,
      })}`, {
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent,
        },
      });

      if (!res.ok) throw await res.json();
      else {
        const responseData: FetchSingleEpisodeResponseSuccess = await res.json();
        const episode = new Episode(responseData.episode);
        this.episodes.set(episode.id, episode);
        return episode;
      }
    }
  }

  clear() {
    this.episodes.clear();
    this.podcasts.clear();
  }

  static INSTANCE: Cache;
}

export const PODBEAN_V1_API_BASE = 'https://api.podbean.com/v1';

export class Podcast {
  id: string;
  title: string;
  description: string;
  website: string;
  status: PodcastStatusEnum;
  logo: string;
  category: string;
  allowEpisodeType: EpisodeTypeEnum[];

  constructor(data: PodcastObject) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.desc;
    this.website = data.website;
    this.status = data.status;
    this.logo = data.logo;
    this.category = data.category_name;
    this.allowEpisodeType = data.allow_episode_type
  }
}

export class Episode {
  id: string;
  podcastId: string;
  title: string;
  content: string;
  logo: string;
  mediaUrl: string;
  playerUrl: string;
  permalinkUrl: string;
  publishTime: Date;
  duration: number | null;
  status: EpisodeStatusEnum;
  type: EpisodeTypeEnum;
  seasonNumber: number;
  episodeNumber: number;
  appleEpisodeType: AppleEpisodeTypeEnum;
  transcriptsUrl: string;
  contentExplicit: EpisodeExplicitContentEnum;
  
  constructor(data: EpisodeObject) {
    this.id = data.id;
    this.podcastId = data.podcast_id;
    this.title = data.title;
    this.content = data.content;
    this.logo = data.logo;
    this.mediaUrl = data.media_url;
    this.playerUrl = data.player_url;
    this.permalinkUrl = data.permalink_url;
    this.publishTime = new Date(data.publish_time);
    this.duration = data.duration;
    this.status = data.status;
    this.type = data.type;
    this.seasonNumber = data.season_number;
    this.episodeNumber = data.episode_number;
    this.appleEpisodeType = data.apple_episode_type;
    this.transcriptsUrl = data.transcripts_url;
    this.contentExplicit = data.content_explicit;
  }

  async getPodcast(): Promise<Podcast> {
    return Cache.INSTANCE.getOrPutPodcast(this.podcastId);
  }
}

/**
 * Wrapper for the Podbean API.
 */
export default class PodbeanAPI {
  private accessToken?: string;
  private clientId: string;
  private clientSecret: string;
  private userAgent: string;
  private cache?: Cache;

  /**
   * Create a new Podbean API client.
   * @param options The options to initialize with 
   */
  constructor({ clientId, clientSecret, userAgent = `Podbean.js/${WRAPPER_VERSION}` }: PodbeanOptions) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.userAgent = userAgent;
  }

  /**
   * Complete the OAuth Client Credentials Authorization flow and store the
   * access token. This method MUST be called before calling any other endpoints
   * 
   * @param podcastId The id of the podcast to auth for (Optional)
   * 
   * @see https://developers.podbean.com/podbean-api-docs/#api-Authentication-Get_Access_Token_By_Client_ID_and_Client_Secret
   */
  async login(podcastId?: string) {
    try {
      // Encode a basic auth header value with client id/secret
      const authBasic = btoa(`${this.clientId}:${this.clientSecret}`);

      const res = await fetch(`${PODBEAN_V1_API_BASE}/oauth/token`, {
        method: 'POST',
        body: qs.stringify({ // Request body
          grant_type: 'client_credentials',
  
          // If the consumer specifies a podcast id, send it with the auth request.
          // Otherwise, let the API decide.
          ...(podcastId ? { podcast_id: podcastId } : {})
        }),
        headers: {
          'Authorization': `Basic ${authBasic}`,
          'Content-Type': 'application/x-www-form-urlencoded', // OAuth requires urlencoded :/
        },
      })

      if (!res.ok) throw await res.json();
      
      const responseData: LoginResponseSuccess = await res.json();
      this.accessToken = responseData.access_token;
      this.cache = new Cache(this.accessToken, this.userAgent);
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * Fetch data about the authorized podcast.
   *  
   * @returns A podcast object for the authorized podcast.
   */
  async podcast(): Promise<Podcast> {
    return Cache.INSTANCE.getOrPutPodcast();
  }

  /**
   * Fetch episodes belonging to the authorized podcast.
   * 
   * @param offset Offset to start from when fetching from the api
   * @param limit Number of episodes to fetch, range of 0-100
   * @returns [episodes, number of episodes, whether the api has more episodes]
   */
  async fetchEpisodes(offset: number = 0, limit: number = 20): Promise<[episodes: Episode[], count: number, hasMore: boolean]> {

    const res = await fetch(`${PODBEAN_V1_API_BASE}/episodes?${qs.stringify({
      access_token: this.accessToken,
      offset,
      limit,
    })}`)

    if (!res.ok) throw await res.json();
    const responseData: FetchMultipleEpisodesResponseSuccess = await res.json();

    const episodes = responseData.episodes.map(it => new Episode(it)); // construct episode objects
    episodes.forEach(it => Cache.INSTANCE.putEpisode(it)); // push all fetched episodes to cache

    return [episodes, responseData.count, responseData.has_more]; // return values
  }
}