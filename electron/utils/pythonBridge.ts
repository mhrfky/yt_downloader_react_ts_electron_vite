import { spawn } from 'child_process';
import axios from 'axios';
import path from 'path';
import { app } from 'electron';

export class PythonService {
    private pythonProcess: any;
    private serverUrl = 'http://localhost:5000/api/v1';
    private isReady: boolean = true;

    constructor() {
        this.startPythonServer();
    }

    private startPythonServer() {
        // Get the path to your video_processor.py
        const scriptPath = app.isPackaged 
            ? path.join(process.resourcesPath, 'python', 'run.py')
            : path.join(app.getAppPath(), 'python', 'run.py');

        this.pythonProcess = spawn('python', [scriptPath], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        // Monitor server startup
        this.pythonProcess.stdout.on('data', (data: Buffer) => {
            console.info(`Python output: ${data}`);
            if (data.toString().includes('Running on http://')) {
                this.isReady = true;
            }
        });

        this.pythonProcess.stderr.on('data', (data: Buffer) => {
            console.error(`Python error: ${data}`);
        });
    }

    public async processVideo(url: string, options: { start_time: number, end_time: number }): Promise<any> {
        if (!this.isReady) {
            throw new Error('Python server is not ready');
        }
        console.log(`Processing video: ${url} from ${options.start_time} to ${options.end_time}`)
        try {
            const response = await axios.post(
                `${this.serverUrl}/clips/download`,
                { 
                  video_id : url, 
                  start_time: options.start_time, 
                  end_time: options.end_time 
                },
                { headers: { 'Content-Type': 'application/json' } }
            );
            return response.data;
        } catch (error) {
            console.error('Error processing video:', error);
            throw error;
        }
    }
    public async getClip(clipId : string): Promise<any> {
        try {
            const response = await axios.get(`${this.serverUrl}/clips/${clipId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting clip:', error);
            throw error;
        }
    }
    public async getClips() : Promise<any> {
        try {
            const response = await axios.get(`${this.serverUrl}/clips`);
            return response.data;
        } catch (error) {
            console.error('Error getting clips:', error);
            throw error;
        }
    }

    public async createClip(clip: any): Promise<any> {
        try {
            const response = await axios.post(`${this.serverUrl}/clips`, clip);
            return response.data;
        } catch (error) {
            console.error('Error creating clip:', error);
            throw error;
        }
    }
    public async deleteClip(clipId : string): Promise<any> {
        try {
            const response = await axios.delete(`${this.serverUrl}/clips/${clipId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting clip:', error);
            throw error;
        }
    }
    public async getStatus(): Promise<any> {
        try {
            const response = await axios.get(`${this.serverUrl}/status`);
            return response.data;
        } catch (error) {
            console.error('Error getting status:', error);
            throw error;
        }
    }
    public async updateClip(clipId : string, data : any): Promise<any> {
        console.log("Updating clip invoked, clip_id: ", clipId);
        try {
            const response = await axios.patch(`${this.serverUrl}/clips/${clipId}`, data);
            return response.data;
        } catch (error) {
            console.error('Error updating clip:', error);
            throw error;
        }
    }
    public async getVideoClips(videoId : string): Promise<any> {
        try {
            const response = await axios.get(`${this.serverUrl}/videos/${videoId}/clips`);
            return response.data;
        } catch (error) {
            console.error('Error getting clips:', error);
            throw error;
        }
    }
    public cleanup() {
        if (this.pythonProcess) {
            this.pythonProcess.kill();
        }
    }
    public async getVideos(){
        try {
            const response = await axios.get(`${this.serverUrl}/videos`);
            return response.data;
        } catch (error) {
            console.error('Error getting videos:', error);
            throw error;
        }
    }
}