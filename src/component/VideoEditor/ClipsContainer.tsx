import { VideoClip } from "./CookieVideoStorage";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { VideoEditor } from "./VideoEditor";

interface ClipsContainerProps {
    clips: VideoClip[];
    isLoading: boolean;
    error: Error | null;
    selectedClipId: string | null;
    onClipSelect: (clipId: string) => void;
    onTimeChange: (clipId: string, currentFrame: number, start: number, end: number) => void;
    onDelete: (clipId: string) => void;
    onDownload: (clip : VideoClip) => void;
    duration: number;
  }
  
  export const ClipsContainer: React.FC<ClipsContainerProps> = ({
    clips,
    isLoading,
    error,
    selectedClipId,
    onClipSelect,
    onTimeChange,
    onDelete,
    onDownload,
    duration,
  }) => {
    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
  
    return (
      <div className="h-72 overflow-y-auto border border-gray-200 rounded-lg p-4">
        {clips.map((clip) => (
          <div
            key={clip.clip_id}
            className={`mb-4 p-3 rounded cursor-pointer transition-colors duration-200 ${
              selectedClipId === clip.clip_id
                ? 'bg-blue-100 border-2 border-blue-500'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onClipSelect(clip.clip_id)}
          >
            <VideoEditor
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
      </div>
    );
  };