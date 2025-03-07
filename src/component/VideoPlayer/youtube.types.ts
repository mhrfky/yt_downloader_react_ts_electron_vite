/**
 * YouTube Player API types
 */

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
  }
  
  export interface YT {
    Player: new (
      elementId: string,
      options: {
        videoId: string;
        playerVars?: {
          autoplay?: 0 | 1;
          controls?: 0 | 1;
          disablekb?: 0 | 1;
          fs?: 0 | 1;
          modestbranding?: 0 | 1;
          playsinline?: 0 | 1;
          rel?: 0 | 1;
          start?: number;
          end?: number;
        };
        events?: {
          onReady?: (event: { target: YTPlayer }) => void;
          onStateChange?: (event: { data: PlayerState }) => void;
          onError?: (event: { data: number }) => void;
        };
      }
    ) => YTPlayer;
  }
  
  declare global {
    interface Window {
      YT: YT;
      onYouTubeIframeAPIReady: () => void;
    }
  }