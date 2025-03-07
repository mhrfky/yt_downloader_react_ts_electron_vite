/**
 * Utility functions for YouTube player
 */

/**
 * Check if YouTube API is loaded
 */
export function isYouTubeApiLoaded(): boolean {
    return typeof window.YT !== 'undefined';
  }
  
  /**
   * Load YouTube iframe API script if not already loaded
   */
  export function loadYouTubeApi(): Promise<void> {
    return new Promise((resolve) => {
      // If API is already loaded, resolve immediately
      if (isYouTubeApiLoaded()) {
        resolve();
        return;
      }
  
      // Create script tag if it doesn't exist
      if (!document.getElementById('youtube-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = "https://www.youtube.com/iframe_api";
  
        // Add event listener to know when script is loaded
        window.onYouTubeIframeAPIReady = () => {
          resolve();
        };
  
        // Insert script tag
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag?.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
      } else {
        // Script tag exists but API not yet ready
        window.onYouTubeIframeAPIReady = () => {
          resolve();
        };
      }
    });
  }
  
  /**
   * Format duration in seconds to MM:SS format
   */
  export function formatDuration(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * Extract YouTube video ID from URL
   */
  export function extractVideoId(url: string): string | null {
    // Handle different YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    
    return match && match[2].length === 11 ? match[2] : null;
  }