/**
 * Represents a video
 * @interface Video
 * @property {string} videoId - Video ID
 * @property {number} clips - Number of clips
 * @property {number} duration - Duration of the video in seconds
 * @property {string} title - Title of the video
 * @property {string} thumbnail - Thumbnail URL of the video
 * @property {Date} created_at - Date the video was created
 * @property {Date} updated_at - Date the video was last updated
 */
export interface Video {
    videoId: string;
    clips: number;
    duration: number;
    title: string;
    thumbnail: string;
    created_at: Date;
    updated_at: Date;
}