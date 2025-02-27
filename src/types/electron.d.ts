export interface IElectronAPI {
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
  
  declare global {
    interface Window {
      electronAPI: IElectronAPI
    }
  }