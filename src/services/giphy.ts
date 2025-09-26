import axios from "axios";

// Giphy API types
export interface Gif {
  id: string;
  title: string;
  url: string;
  width: number;
  height: number;
}

export interface GiphyGif {
  type: string;
  id: string;
  url: string;
  slug: string;
  bitly_gif_url: string;
  bitly_url: string;
  embed_url: string;
  username: string;
  source: string;
  title: string;
  rating: string;
  content_url: string;
  source_tld: string;
  source_post_url: string;
  is_sticker: number;
  import_datetime: string;
  trending_datetime: string;
  images: {
    original: {
      url: string;
      width: string;
      height: string;
    };
  };
  analytics_response_payload: string;
  analytics: any;
  alt_text: string;
  is_low_contrast: boolean;
  source_caption?: string;
  user?: any;
}

export interface GiphyResponse {
  data: GiphyGif[];
  pagination: {
    total_count: number;
    count: number;
    offset: number;
  };
  meta: {
    status: number;
    msg: string;
    response_id: string;
  };
}

// Giphy API service
export const giphyApi = axios.create({
  baseURL: 'https://api.giphy.com/v1/gifs',
  params: {
    lang: 'es',
    api_key: '0xHZlcVt5F906rpnJ1xEsVEk4THqtMGB'
  }
});

export async function getGifsByQuery(query: string): Promise<Gif[]> {
  try {
    const response = await giphyApi.get<GiphyResponse>(
      `/search`, {
      params: {
        q: query,
        limit: 10,
      }
    });

    return response.data.data.map((gif) => ({
      id: gif.id,
      title: gif.title,
      url: gif.images.original.url,
      width: Number(gif.images.original.width),
      height: Number(gif.images.original.height)
    }));
  } catch (error) {
    console.error('Error fetching GIFs:', error);
    return [];
  }
}
