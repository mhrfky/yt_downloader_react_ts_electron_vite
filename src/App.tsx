import { useState, useEffect, useRef } from 'react';
import './App.css';
import { PlyrYoutubePlayer, PlyrPlayer } from './component/VideoPlayer/index.ts';
import { validateYouTubeVideo } from './youtube_utils.ts';
import { useClips } from './hooks/useClips.ts';
import { useVideos } from './hooks/useVideos.ts';

import { ClipEditorsContainer } from './component/VideoEditor/ClipEditorsContainer.tsx';
import { VideoSidebar } from './component/VideoSidebar/VideoSidebar.tsx';
import { VideoClip } from './types/VideoClip.ts';

function App(): JSX.Element {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(100);
  const [videoId, setVideoId] = useState<string>("dQw4w9WgXcQ");
  const [newUrl, setNewUrl] = useState<string>('');
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [frameTime, setFrameTime] = useState<number | undefined>(undefined);

  const playerRef = useRef<PlyrPlayer>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    clips,
    isLoading,
    error,
    fetchClips,
    addClip,
    deleteClip,
    updateClip
  } = useClips({
    videoId,
    duration
  });

  const { fetchVideos, videos } = useVideos();

  const handlePlayerReady = (newDuration: number): void => {
    console.log('Player is ready with duration:', newDuration);
    setDuration(newDuration);
  };

  const toggleActive = (): void => {
    const player = playerRef.current;
    if (!player) return;

    if (!isActive) {
      player.play();
    } else {
      player.pause();
    }
  };

  const handleNewUrl = async (): Promise<void> => {
    if (!newUrl) return;

    const result = await validateYouTubeVideo(newUrl);
    if (result.valid && result.videoId) {
      console.log(`Valid video ID: ${result.videoId}`);
      setVideoId(result.videoId);
      setNewUrl(result.videoId);
    } else {
      console.log(`Error: ${result.error}`);
    }
  };

  const handleDownloadClip = (clip: VideoClip) => {
    console.log('Download attempted on clip ID:', clip.clip_id);
    if (window.electronAPI) {
      window.electronAPI.processVideo({
        url: videoId,
        options: { start_time: clip.start_time, end_time: clip.end_time }
      });
    }
  };

  // Simplified time change handler for Plyr
  const handleTimeChange = (clipId: string, newFrameTime: number, start: number, end: number): void => {
    if (clipId === null || clipId === undefined || clipId !== selectedClipId) return;

    // Set the frame time to update the player position
    setFrameTime(newFrameTime);

    // Update clip with new start/end times
    updateClip(clipId, { start_time: start, end_time: end }, () => {
      fetchVideos();
    });

    console.log("frame has been changed to", newFrameTime, "with range", start, end);
  };

  // Get current frame time on demand from Plyr
  const getCurrentFrameTime = (): number => {
    return playerRef.current?.currentTime || 0;
  };

  const handleVideoSelect = (newVideoId: string) => {
    setVideoId(newVideoId);
    setNewUrl(newVideoId);
    setSelectedClipId(null);
  };

  useEffect(() => {
    console.log("videos has been fetched when clips are updated")
    fetchVideos();
  }, [clips, updateClip]);

  return (
    <div className="app-container">
      <VideoSidebar
        videos={videos}
        onVideoSelect={handleVideoSelect}
        onReload={fetchVideos}
      />

      <div className="main-content">
        <div className="video-input">
          <input
            ref={inputRef}
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
          <button
            onClick={handleNewUrl}
            type="button"
            className="play-button"
          >
            Change
          </button>
        </div>

        <div className="video-controls">
          <button
            onClick={toggleActive}
            className="play-button"
            type="button"
            aria-label={isActive ? 'Pause video' : 'Play video'}
          >
            {isActive ? 'Pause' : 'Play'}
          </button>

          
        </div>

        <div className="video-player">
          <PlyrYoutubePlayer
            ref={playerRef}
            videoId={videoId}
            onPlayerReady={handlePlayerReady}
            onStateChange={setIsActive}
            frameTime={frameTime}
          />
        </div>

        <div className="clip-controls">
          <button
            onClick={addClip}
            type="button"
            className="play-button"
          >
            Add Clip
          </button>
        </div>

        <div className="clips-container">
          <ClipEditorsContainer
            clips={clips}
            selectedClipId={selectedClipId}
            onClipSelect={setSelectedClipId}
            onTimeChange={handleTimeChange}
            onDelete={deleteClip}
            onDownload={handleDownloadClip}
            duration={duration}
          />
        </div>
      </div>
    </div>
  );
}

export default App;