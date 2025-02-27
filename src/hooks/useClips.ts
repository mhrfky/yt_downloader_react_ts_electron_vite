import { useState, useEffect, useMemo } from 'react';
import { ClipsState } from '../types/clips';
import { VideoClip } from '../component/VideoEditor/CookieVideoStorage';
import { debounce } from 'lodash';

interface UseVideoClipsProps {
    videoId: string;
    duration: number;
}

export function useClips({ videoId, duration }: UseVideoClipsProps) {
    const [state, setState] = useState<ClipsState>({
        data: [],
        isLoading: true,
        error: null
    });

    // Debounced update function remains the same.
    const update = useMemo(
        () =>
            debounce((clipId: string, updates: Partial<VideoClip>) => {
                console.log("Clip ID:", clipId, "Updates:", updates);
                window.electronAPI.update_clip(clipId, updates);
            }, 1000),
        []
    );

    // Cleanup the debounced function on unmount.
    useEffect(() => {
        return () => update.cancel();
    }, [update]);

    // Now fetchClips is a normal async function that accepts an optional videoId.
    const fetchClips = async (vid: string = videoId) => {
        setState(prev => ({ ...prev, isLoading: true }));
        try {
            console.log("Fetching clips for videoId:", vid);
            const clips = await window.electronAPI.getVideosClips(vid);
            console.log("Clips from Electron:", clips);
            setState({ data: clips, isLoading: false, error: null });
            return clips;
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error : new Error('Failed to fetch clips'),
                isLoading: false
            }));
            throw error;
        }
    };
    const addClip = async () => {
        setState(prev => ({ ...prev, isLoading: true }));
        try {
            // Create a new clip using the hook's videoId.
            const newClip = await window.electronAPI.createClip({
                video_id: videoId,
                clip_id: String(Date.now()),
                start_time: 0,
                end_time: duration,
            });

            // Re-fetch clips; note that we can optionally pass a videoId if needed.
            const updatedClips = await fetchClips();
            // Update the state using the 'data' key.
            setState(prev => ({
                ...prev,
                data: updatedClips,
                isLoading: false
            }));
            console.log("New clip added:", newClip);
            return newClip;
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error : new Error('Failed to add clip'),
                isLoading: false
            }));
            throw error;
        }
    };

    const deleteClip = async (clipId: string) => {
        setState(prev => ({ ...prev, isLoading: true }));
        try {
            await window.electronAPI.delete_clip(clipId);
            const updatedClips = await fetchClips();
            setState(prev => ({
                ...prev,
                data: updatedClips,
                isLoading: false
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error : new Error('Failed to delete clip'),
                isLoading: false
            }));
            throw error;
        }
    };

    useEffect(() => {
        console.log("Video ID changed:", videoId)
        fetchClips(videoId);
    }, [videoId]);
    return {
        clips: state.data,
        isLoading: state.isLoading,
        error: state.error,
        fetchClips, // Now accepts a videoId parameter if needed
        addClip,
        deleteClip,
        updateClip: update,
    };
}
