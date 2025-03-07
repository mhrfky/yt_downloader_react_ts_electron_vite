import { useEffect, useRef, MutableRefObject } from "react";
import { PlayerState, YTPlayer } from "../../../types/youtube.ts";

interface UseYoutubePlayerProps {
  videoId: string;
  onStateChange: (isPlaying: boolean) => void;
  onPlayerReady: (duration: number) => void;
  externalRef: MutableRefObject<YTPlayer | null> | ((instance: YTPlayer | null) => void) | null;
}

/**
 * Custom hook to manage YouTube player logic
 */
export function useYoutubePlayer({
  videoId,
  onStateChange,
  onPlayerReady,
  externalRef
}: UseYoutubePlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const intervalRef = useRef<number | null>(null);

  /**
   * Start checking for video duration until it's available
   */
  const startDurationCheck = () => {
    // Clear existing interval if any
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = window.setInterval(() => {
      const duration = playerRef.current?.getDuration();
      if (duration && duration > 0) {
        console.log("duration has been detected", duration);
        onPlayerReady(duration);
        clearInterval(intervalRef.current!);
      }
    }, 500);
  };

  /**
   * Initialize YouTube Player API
   */
  useEffect(() => {
    // Check if API script is already loaded
    if (!document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = "https://www.youtube.com/iframe_api";

      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag?.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          showinfo: 0,
          ecver: 2
        },
        events: {
          onReady: (event: { target: YTPlayer }) => {
            // Set external ref to the player instance
            if (externalRef) {
              if (typeof externalRef === 'function') {
                externalRef(event.target);
              } else {
                externalRef.current = event.target;
              }
            }
            startDurationCheck();
          },
          onStateChange: (event: { data: number }) => {
            if (event.data === PlayerState.UNSTARTED) {
              onStateChange(false);
              startDurationCheck();
            } else if (event.data === PlayerState.PLAYING) {
              onStateChange(true);
            }
          }
        }
      });
    };

    // Cleanup function
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  /**
   * Handle video ID changes
   */
  useEffect(() => {
    console.log("videoId changed", videoId);
    if (playerRef.current) {
      playerRef.current.loadVideoById(videoId);
    }
  }, [videoId]);

  return {
    playerRef
  };
}