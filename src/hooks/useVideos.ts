import { useState, useEffect } from 'react';
import { Video } from '../types/Video.ts';

// No need for async here
function mapVideos(videos: Video[]) {
    return videos.map(video => {
        video.created_at = new Date(video.created_at);
        video.updated_at = new Date(video.updated_at);
        return video;
    });
}

// No need for async here either
function sortVideos(videos: Video[]) {
    return videos.sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime());
}

export function useVideos() {
    const [videos, setVideos] = useState<Video[]>([]);

    const fetchVideos = async () => {
        try {
            console.log("Fetching videos");
            // This is the only truly async operation
            let fetchedVideos = await window.electronAPI.getVideos();
            
            // Convert date strings to Date objects
            fetchedVideos = mapVideos(fetchedVideos);
            
            // Sort videos (this is synchronous)
            fetchedVideos = sortVideos(fetchedVideos);
            console.log("Sorted videos:", fetchedVideos);

            setVideos(fetchedVideos);
            console.log("new videos are set");
        } catch (error) {
            // This doesn't actually change anything in the state
            setVideos(prev => ({
                ...prev
            }));

            throw error;
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    return {
        fetchVideos,
        videos
    };
}