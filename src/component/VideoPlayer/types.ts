// types.ts
export interface PlyrPlayer {
    play(): void;
    pause(): void;
    stop(): void;
    currentTime: number;
    duration: number;
    paused: boolean;
    ended: boolean;
    destroy(): void;
  }
  
  export interface PlyrYoutubePlayerProps {
    videoId: string;
    onStateChange: (isPlaying: boolean) => void;
    onPlayerReady: (duration: number) => void;
    frameTime?: number; // Optional prop to control current frame position
  }