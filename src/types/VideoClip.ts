/**
 * Represents a clip segment from a video
 * @interface VideoClip
 * @property {number} start - Start time of the clip in seconds
 * @property {number} end - End time of the clip in seconds
 * @property {string} clip_id - Unique identifier for the clip
 */
export interface VideoClip {
    start_time: number;
    end_time: number;
    clip_id: string;
    video_id: string;
    created_at: Date;
    updated_at: Date;

}