import { contextBridge, ipcRenderer } from 'electron'

interface IElectronAPI {
  checkSystemRequirements: () => Promise<any>
  processVideo: (params: { url: string, options: any }) => Promise<any>
  getStatus: () => Promise<any>
  onMainProcessLog: (callback: (args: any[]) => void) => void  // Add this
  getClip: (clipId: string) => Promise<any>
  getClips: () => Promise<any>
  getVideosClips: (videoId: string) => Promise<any>
  getVideos: () => Promise<any>
  createClip: (clip_data: any) => Promise<any>
  delete_video: (videoId: string) => Promise<any>
  delete_clip: (clipId: string) => Promise<any>
  update_clip: (clipId: string, clip_data: any) => Promise<any>
  download_clip: (clipId: string) => Promise<any>
}

// Log when preload script starts
console.log('Preload script is initializing...')

// Expose the typed API to the renderer
const electronAPI: IElectronAPI = {
  checkSystemRequirements: async () => {
    console.log('Invoking checkSystemRequirements from preload');
    return await ipcRenderer.invoke('check-system-requirements');
  },
  processVideo: async (params: { url: string, options: { start_time: number, end_time: number } }) => {
    console.log('Invoking processVideo from preload with params:', params);
    return await ipcRenderer.invoke('process-video', params);
  },
  getStatus: async () => {
    console.log('Invoking getStatus from preload');
    return await ipcRenderer.invoke('get-status');
  },
  getClip: async (clipId: string) => {
    console.log('Invoking getClip from preload');
    return await ipcRenderer.invoke('get-clip', clipId);
  },
  getClips: async () => {
    console.log('Invoking getClips from preload');
    return await ipcRenderer.invoke('get-clips');
  },
  getVideosClips: async (videoId: string) => {
    console.log('Invoking getVideoClips from preload');
    return await ipcRenderer.invoke('get-video-clips', videoId);
  },
  getVideos: async () => {
    console.log('Invoking getVideos from preload');
    return await ipcRenderer.invoke('get-videos');
  },
  createClip: async (clip_data: any) => {
    console.log('Invoking create_clip from preload');
    return await ipcRenderer.invoke('create_clip', clip_data);
  },
  delete_video: async (videoId: string) => {
    console.log('Invoking delete_video from preload');
    return await ipcRenderer.invoke('delete_video', videoId);
  },
  delete_clip: async (clipId: string) => {
    console.log('Invoking delete_clip from preload');
    return await ipcRenderer.invoke('delete_clip', clipId);
  },
  update_clip: async (clipId: string, data: any) => {
    console.log('Invoking update_clip from preload');
    return await ipcRenderer.invoke('update_clip', clipId, data);
  },
  download_clip: async (clipId: string) => {
    console.log('Invoking download_clip from preload');
    return await ipcRenderer.invoke('download_clip', clipId);
  },
  onMainProcessLog: (callback: (args: any[]) => void) => {
    ipcRenderer.on('main-process-log', (_event, args) => callback(args));
  }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

console.log('Preload script initialized')