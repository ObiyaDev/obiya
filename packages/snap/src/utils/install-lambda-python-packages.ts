import { spawn } from 'child_process';
import * as path from 'path';

export interface VenvConfig {
  baseDir: string;
  isVerbose?: boolean;
}

export async function installLambdaPythonPackages({
  baseDir,
  isVerbose = false
}: VenvConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    // Validate and sanitize baseDir
    const sanitizedBaseDir = path.resolve(baseDir);
    
    // Use spawn instead of exec to prevent command injection
    const args = ['install', '-r', 'requirements.txt'];
    
    const child = spawn('pip', args, {
      cwd: sanitizedBaseDir,
      stdio: isVerbose ? 'inherit' : 'pipe'
    });

    let stderr = '';
    
    if (!isVerbose) {
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
    }

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`pip install failed with code ${code}${stderr ? ': ' + stderr : ''}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to start pip install: ${error.message}`));
    });
  });
}
