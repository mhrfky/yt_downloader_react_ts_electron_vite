import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { checkSystemRequirements } from './utils/systemCheck'
import { PythonService } from './utils/pythonBridge'
import { Axios, AxiosError } from 'axios'

// Setup logging function
function setupLogging() {
  const originalConsoleLog = console.log
  const originalConsoleError = console.error
  
  console.log = (...args) => {
    originalConsoleLog('[Main Process]', ...args)
    win?.webContents?.send('main-process-log', args)
  }
  
  console.error = (...args) => {
    originalConsoleError('[Main Process Error]', ...args)
    win?.webContents?.send('main-process-log', ['ERROR:', ...args])
  }
}

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('Main process starting...')
process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL 
  ? path.join(process.env.APP_ROOT, 'public') 
  : RENDERER_DIST

let win: BrowserWindow | null
let pythonService: PythonService
setupLogging()
function createWindow() {
  console.log('Creating main window...')

  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,  // Security: Enable context isolation
      nodeIntegration: false   // Security: Disable node integration
    },
  })

  if (VITE_DEV_SERVER_URL) {
    console.log('Opening in development mode')
    win.webContents.openDevTools()
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    console.log('Opening in production mode')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
  win.webContents.on('did-finish-load', () => {
    console.log('Window finished loading')
  })
}

// Set up IPC handlers
function setupIPCHandlers() {
  console.log('Setting up IPC handlers...')

  ipcMain.handle('check-system-requirements', async () => {
    console.log('Handling check-system-requirements request')
    try {
      const result = await checkSystemRequirements()
      console.log('System requirements check result:', result)
      return result
    } catch (error) {
      console.error('Error checking system requirements:', (error as AxiosError).message)
      throw error
    }
  })

  ipcMain.handle('process-video', async (event, { url, options }) => {
    const { start_time, end_time } = options || {};
  
    if (start_time === undefined || end_time === undefined) {
      throw new Error('Missing start_time or end_time in the options parameter.');
    }
  
    console.log('Handling process-video request:', { url, start_time, end_time });
    try {
      console.log(`Processing video: ${url} from ${start_time} to ${end_time}`);
      const result = await pythonService.processVideo(url, { start_time, end_time });
      console.log('Video processing result:', result);
      return result;
    } catch (error) {
      console.error('Error processing video:', (error as AxiosError).message)
      throw error;
    }
  });
  
  ipcMain.handle('get-status', async () => {
    console.log('Handling get-status request')
    try {
      const status = await pythonService.getStatus()
      console.log('Status result:', status)
      return status
    } catch (error) {
      console.error('Error getting status:', (error as AxiosError).message)
      throw error
    }
  })
  ipcMain.handle('create_clip', async (event, clip) => {
    console.log('Handling create-clip request', clip)
    try {
      const result = await pythonService.createClip(clip)
      console.log('Clip creation result:', result)
      return result
    } catch (error) {
      console.error('Error creating clip:', (error as AxiosError).message)
      throw error
    }
  })
  ipcMain.handle("get-video-clips", async (event, videoId) => {
    console.log('Handling get-video-clips request', videoId)
    try {
      const result = await pythonService.getVideoClips(videoId)
      console.log('Clip retrieval result:', result)
      return result
    } catch (error) {
      console.error('Error getting clips:', (error as AxiosError).message)
      throw error
    }
  })
  ipcMain.handle('get-videos', async (event) => {
    console.log('Handling get-videos request')
    try {
      const result = await pythonService.getVideos()
      console.log('Video retrieval result:', result)
      return result
    } catch (error) {
      console.error('Error getting videos:', (error as AxiosError).message)
      throw error
    }
  })
  ipcMain.handle('delete_clip', async (event, clipId) => {
    console.log('Handling delete-clip request', clipId)
    try {
      const result = await pythonService.deleteClip(clipId)
      console.log('Clip deletion result:', result)
      return result
    } catch (error) {
      console.error('Error deleting clip:', (error as AxiosError).message)
      throw error
    }
  })
  ipcMain.handle('update_clip', async (event, clipId, data) => {
    console.log('Handling update-clip request', data)
    try {
      const result = await pythonService.updateClip(clipId, data)
      console.log('Clip update result:', result)
      return result
    } catch (error) {
      console.error('Error updating clip:', (error as AxiosError).message)
        throw error
    }
  })
}

app.on('window-all-closed', () => {
  console.log('All windows closed, cleaning up...')
  pythonService.cleanup()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  console.log('App activated')
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  console.log('App activated')
  pythonService = new PythonService()
  console.log("PythonService has been initialized")
  setupIPCHandlers()
  createWindow()
  console.log('App initialization completed')

})
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error)
})

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error)
})