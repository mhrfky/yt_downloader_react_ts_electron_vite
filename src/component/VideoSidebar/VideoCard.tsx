import React from 'react';
import './VideoSidebar.css';

export interface VideoCardProps {
    videoId: string;
    duration: number;
    title: string;
    numberOfClips: number;
    thumbnail: string;
    onVideoSelect: (videoId: string) => void;
  }
  
export const VideoCard: React.FC<VideoCardProps> = ({
    videoId, 
    duration, 
    title, 
    numberOfClips, 
    thumbnail, 
    onVideoSelect
  }) => {   
    return (
      <div className="video-card" onClick={() => onVideoSelect(videoId)}>
        <img src={thumbnail} alt={title} />
        <div className="video-info">
          <h3>{title}</h3>
          <p>{duration} seconds</p>
          <p>{numberOfClips} clips</p>
        </div>
      </div>
    );
  };