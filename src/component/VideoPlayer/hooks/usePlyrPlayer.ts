// usePlyrPlayer.ts
import { useEffect, useRef } from "react";
import Plyr from 'plyr';
import { PlyrPlayer } from './types';

interface UsePlyrPlayerProps {
  videoId: string;
  onStateChange: (isPlaying: boolean) => void;
  onPlayerReady: (duration: number) => void;
  frameTime?: number;
}

export const usePlyrPlayer = (
  { videoId, onStateChange, onPlayerReady, frameTime }: UsePlyrPlayerProps,
  ref: React.ForwardedRef<PlyrPlayer>
) => {
  // Local ref for the player instance
  const plyrRef = useRef<Plyr | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const durationCheckIntervalRef = useRef<number | null>(null);
  
  // Initialize Plyr
  useEffect(() => {
    // Create the player container if it doesn't exist yet
    if (!containerRef.current) {
      const container = document.getElementById('youtube-player');
      if (container) {
        containerRef.current = container;
      } else {
        console.error("YouTube player container not found");
        return;
      }
    }

    // Set up the HTML structure for Plyr
    containerRef.current.innerHTML = `
      <div class="plyr__video-embed" id="plyr-youtube">
        <iframe
          src="https://www.youtube.com/embed/${videoId}?origin=${window.location.origin}&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1"
          allowfullscreen
          allowtransparency
          allow="autoplay"
        ></iframe>
      </div>
    `;

    // Initialize Plyr
    plyrRef.current = new Plyr('#plyr-youtube', {
      controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
      youtube: {
        noCookie: false,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1
      }
    });

    // Expose the player instance through ref
    if (ref) {
      // This is safe because forwardRef guarantees ref will have current property
      (ref as React.MutableRefObject<PlyrPlayer>).current = plyrRef.current as unknown as PlyrPlayer;
    }

    // Set up duration check interval
    const startDurationCheck = () => {
      if (durationCheckIntervalRef.current) {
        clearInterval(durationCheckIntervalRef.current);
      }

      durationCheckIntervalRef.current = window.setInterval(() => {
        if (plyrRef.current && plyrRef.current.duration) {
          const duration = plyrRef.current.duration;
          if (duration && duration > 0) {
            console.log("Duration detected:", duration);
            onPlayerReady(duration);
            clearInterval(durationCheckIntervalRef.current!);
          }
        }
      }, 500);
    };

    // Set up events
    plyrRef.current.on('ready', () => {
      console.log("Plyr is ready");
      startDurationCheck();
    });

    plyrRef.current.on('play', () => {
      console.log("Plyr play event");
      onStateChange(true);
    });

    plyrRef.current.on('pause', () => {
      console.log("Plyr pause event");
      onStateChange(false);
    });

    plyrRef.current.on('ended', () => {
      console.log("Plyr ended event");
      onStateChange(false);
    });

    // Cleanup
    return () => {
      if (plyrRef.current) {
        plyrRef.current.destroy();
      }
      if (durationCheckIntervalRef.current) {
        clearInterval(durationCheckIntervalRef.current);
      }
    };
  }, [videoId]); // Re-initialize when videoId changes

  // Handle external frameTime changes
  useEffect(() => {
    if (frameTime !== undefined && frameTime !== lastFrameTimeRef.current && plyrRef.current) {
      console.log(`Setting frame time to ${frameTime}`);
      lastFrameTimeRef.current = frameTime;
      plyrRef.current.currentTime = frameTime;
    }
  }, [frameTime]);
};