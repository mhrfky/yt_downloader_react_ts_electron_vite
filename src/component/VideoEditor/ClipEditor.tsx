import VideoTimePicker from "../VideoTimePicker/VideoTimePicker.tsx";
import * as Slider from "@radix-ui/react-slider";
import { useEffect, useState } from "react";
import './styles.css';

interface ClipEditorProps {
    id: string;
    duration: number;
    onTimeChange: (current_frame: number, start: number, end: number) => void;
    handleDelete: () => void;
    handleDownload: () => void;
    start: number;
    end: number;
    isSelected: boolean;
    title?: string; // Optional title for the clip
}

const ClipEditor: React.FC<ClipEditorProps> = ({
    id,
    duration,
    onTimeChange,
    handleDelete,
    handleDownload,
    start,
    end,
    isSelected,
    title = `Clip ${id}` // Default title if none provided
}) => {
    const [values, setValues] = useState([start, end]); // Start and end values
    
    useEffect(() => {
        setValues([start, end]);
    }, [start, end]);
    
    const onSliderValueChange = ([left, right]: number[]): void => {
        if (values[0] === left) {
            onTimeChange(right, left, right);
        } else {
            onTimeChange(left, left, right);
        }
        setValues([left, right]);
    };

    return (
        <div className="clip-card">
            <div className="clip-card-content">
                {/* Left Column - Main content */}
                <div className="clip-main-content">
                    <h3 className="clip-title">{title}</h3>
                    
                    <div className="video-slider-container">
                        <Slider.Root
                            className="slider-root"
                            value={values}
                            onValueChange={onSliderValueChange}
                            min={0}
                            max={duration}
                            step={0.001}
                            aria-label="Video Slider"
                            disabled={!isSelected}
                        >
                            <Slider.Track className="slider-track">
                                <Slider.Range className="slider-range" />
                            </Slider.Track>
                            {isSelected && <Slider.Thumb className="slider-thumb" />}
                            {isSelected && <Slider.Thumb className="slider-thumb" />}
                        </Slider.Root>
                    </div>
                    
                    <div className="time-pickers-container">
                        <div className="time-picker-wrapper">
                            <span className="time-label">Start:</span>
                            <VideoTimePicker
                                value={values[0]}
                                onChange={(e: number) => onSliderValueChange([e, values[1]])}
                                maxDuration={duration}
                            />
                        </div>
                        
                        <div className="time-picker-wrapper">
                            <span className="time-label">End:</span>
                            <VideoTimePicker
                                value={values[1]}
                                onChange={(e: number) => onSliderValueChange([values[0], e])}
                                maxDuration={duration}
                            />
                        </div>
                    </div>
                </div>
                
                {/* Right Column - Buttons */}
                <div className="clip-actions">
                    <button 
                        type="button"
                        className="clip-button add-button"
                        disabled={!isSelected}
                    >
                        Add
                    </button>
                    
                    <button
                        onClick={handleDownload}
                        type="button"
                        className="clip-button download-button"
                        disabled={!isSelected}
                    >
                        Download
                    </button>
                    
                    <button
                        onClick={handleDelete}
                        type="button"
                        className="clip-button delete-button"
                        disabled={!isSelected}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export { ClipEditor };