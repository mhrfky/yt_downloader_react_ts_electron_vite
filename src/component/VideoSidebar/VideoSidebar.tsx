import React from 'react';
import './VideoSidebar.css';
import {VideoCard, VideoCardProps } from './VideoCard.tsx';
import ReloadButton  from '../ReloadButton/ReloadButton.tsx';
// Reusing the same interface for consistency

interface VideoSidebarProps {
  videos: Omit<Video, 'onVideoSelect'>[];
  onVideoSelect: (videoId: string) => void;
  onReload: () => Promise<void> | void;
}
interface Video {
  videoId: string;
  title: string;
  duration: number;
  clips: number[];
  thumbnail: string;
}

export const VideoSidebar: React.FC<VideoSidebarProps> = ({ videos, onVideoSelect, onReload }) => {
  return (
    <div className="video-sidebar">
      <div className="sidebar-header">
        <h2>Your Videos</h2>
        <ReloadButton onReload={onReload} />
      </div>
      <div className="video-list">
        {videos.map((video) => (
          <VideoCard
            key={video.videoId}
            videoId={video.videoId}
            duration={video.duration}
            title={video.title}
            numberOfClips={video.clips.length}
            thumbnail={video.thumbnail}
            onVideoSelect={onVideoSelect}
          />
        ))}
      </div>
    </div>
  );
};
export default VideoSidebar;
