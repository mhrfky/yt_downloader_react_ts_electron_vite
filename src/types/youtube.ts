/**
 * YouTube Player API types
 */

import Plyr from 'plyr';

export enum PlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5
}

export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  loadVideoById(videoId: string, startSeconds?: number): void;
  cueVideoById(videoId: string, startSeconds?: number): void;
  getPlayerState(): PlayerState;
  getCurrentTime(): number;
  getDuration(): number;
  getVideoUrl(): string;
  getVideoData(): { video_id: string; title: string; author: string };
  destroy(): void;
  getIframe(): HTMLIFrameElement;
}

export interface YT {
  Player: new (
    elementOrId: string | HTMLIFrameElement,
    options: {
      videoId?: string;
      playerVars?: {
        autoplay?: 0 | 1;
        controls?: 0 | 1;
        disablekb?: 0 | 1;
        fs?: 0 | 1;
        modestbranding?: 0 | 1;
        playsinline?: 0 | 1;
        rel?: 0 | 1;
        showinfo?: 0 | 1;
        start?: number;
        end?: number;
        origin?: string;
        iv_load_policy?: 1 | 3;
        ecver?: number;
      };
      events?: {
        onReady?: (event: { target: YTPlayer }) => void;
        onStateChange?: (event: { data: PlayerState }) => void;
        onError?: (event: { data: number }) => void;
      };
    }
  ) => YTPlayer;
}

export interface PlyrWithYT extends Plyr {
  embed?: {
    getIframe(): HTMLIFrameElement;
  };
}

declare global {
  interface Window {
    YT: YT;
    onYouTubeIframeAPIReady: () => void;
  }
}