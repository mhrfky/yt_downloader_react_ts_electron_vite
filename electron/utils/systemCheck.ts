import { exec } from 'child_process';
import { platform } from 'os';

const checkDependency = (command: string): Promise<boolean> => {
  const whichCommand = platform() === 'win32' ? 'where' : 'which';
  
  return new Promise((resolve) => {
    exec(`${whichCommand} ${command}`, (error) => {
      resolve(!error);
    });
  });
};

export const checkSystemRequirements = async () => {
  const results = {
    ytdlp: await checkDependency('yt-dlp'),
    ffmpeg: await checkDependency('ffmpeg'),
    platformSupported: ['win32', 'darwin', 'linux'].includes(platform())
  };
  
  return results;
};