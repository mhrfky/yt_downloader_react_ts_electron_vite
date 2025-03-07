/**
 * Represents a video
 * @interface Video
 * @property {string} downloadId - Download ID
 * @property {string} downloadedId -  ID of the downloaded
 * @property {Date} created_at - Date the video was created
 * @property {number} progress - Progress of the download
 * @property {string} status - Status of the download
 * @property {string} type - Type of the downloaded
 */
export interface Download {
    downloadId: string;
    downloadedId: string;
    created_at: number;
    progress:  number;
    status: string;
    type: string;
}