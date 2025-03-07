import { forwardRef } from "react";
import { YTPlayer } from "../../types/youtube";
import { useYoutubePlayer } from "./hooks/useYoutubePlayer.ts";
import "./YoutubePlayer.css";

interface YoutubePlayerProps {
  videoId: string;
  onStateChange: (isPlaying: boolean) => void;
  onPlayerReady: (duration: number) => void;
}

/**
 * YouTube Player component that embeds a YouTube iframe
 */
const YoutubePlayer = forwardRef<YTPlayer, YoutubePlayerProps>(
  ({ videoId, onStateChange, onPlayerReady }, ref) => {
    // Use the logic hook
    useYoutubePlayer({
      videoId,
      onStateChange,
      onPlayerReady,
      externalRef: ref
    });

    return (
      <div className="youtube-container">
        <div id="youtube-player"></div>
      </div>
    );
  }
);

YoutubePlayer.displayName = 'YoutubePlayer';

export { YoutubePlayer };