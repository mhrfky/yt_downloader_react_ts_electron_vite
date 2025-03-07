import { ClipEditor } from "./ClipEditor";
import { VideoClip } from "../../types/VideoClip.ts";
import { useState } from "react";
import './styles.css';

interface ClipEditorsContainerProps {
  clips: VideoClip[];
  selectedClipId: string | null;
  onClipSelect: (clipId: string) => void;
  onTimeChange: (clipId: string, currentFrame: number, start: number, end: number) => void;
  onDelete: (clipId: string) => void;
  onDownload: (clip: VideoClip) => void;
  duration: number;
}

export const ClipEditorsContainer: React.FC<ClipEditorsContainerProps> = ({
  clips,
  selectedClipId,
  onClipSelect,
  onTimeChange,
  onDelete,
  onDownload,
  duration,
}) => {
  // State for drag and drop functionality
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  // We'll implement these functions for drag and drop
  const handleDragStart = (clipId: string) => {
    setDraggedItemId(clipId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
  };

  // This will be implemented to handle clip reordering
  const handleDrop = (e: React.DragEvent, targetClipId: string) => {
    e.preventDefault();
    if (draggedItemId && draggedItemId !== targetClipId) {
      // We'll implement the reordering logic here
      console.log(`Reorder: drag ${draggedItemId} to ${targetClipId}`);
    }
    setDraggedItemId(null);
  };

  return (
    <div className="clip-editors-container">
      {clips.map((clip) => (
        <div
          key={clip.clip_id}
          className={`clip-item ${
            selectedClipId === clip.clip_id ? 'selected' : ''
          } ${draggedItemId === clip.clip_id ? 'dragging' : ''}`}
          onClick={() => onClipSelect(clip.clip_id)}
          draggable={true}
          onDragStart={() => handleDragStart(clip.clip_id)}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDrop={(e) => handleDrop(e, clip.clip_id)}
        >
          <ClipEditor
            id={clip.clip_id}
            duration={duration}
            isSelected={selectedClipId === clip.clip_id}
            onTimeChange={(currentFrame, start, end) => 
              onTimeChange(clip.clip_id, currentFrame, start, end)}
            handleDelete={() => onDelete(clip.clip_id)}
            handleDownload={() => onDownload(clip)}
            start={clip.start_time}
            end={clip.end_time}
          />
        </div>
      ))}
      {clips.length === 0 && (
        <div className="empty-state">
          No clips added yet
        </div>
      )}
    </div>
  );
};

export default ClipEditorsContainer;