import { forwardRef, useEffect, useRef } from "react";
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import {usePlyrPlayer} from "./hooks/usePlyrPlayer";

// Simple interface for the player that only includes what we need
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

interface PlyrYoutubePlayerProps {
  videoId: string;
  onStateChange: (isPlaying: boolean) => void;
  onPlayerReady: (duration: number) => void;
  frameTime?: number; // Optional prop to control current frame position
}

/**
 * Pure Plyr YouTube player with simplified interface
 */
const PlyrYoutubePlayer = forwardRef<PlyrPlayer, PlyrYoutubePlayerProps>(
  ({ videoId, onStateChange, onPlayerReady, frameTime }, ref) => {
    // Local ref for the player instance
    usePlyrPlayer({ videoId, onStateChange, onPlayerReady, frameTime }, ref);
    return (
      <div className="youtube-container">
        <div id="youtube-player"></div>
      </div>
    );
  }
);

PlyrYoutubePlayer.displayName = 'PlyrYoutubePlayer';

export { PlyrYoutubePlayer };