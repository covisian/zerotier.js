import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import fs from 'fs';
import os from 'os';

export async function generateSignature(secret: string, networks: string[]): Promise<string> {
  const tmpTimestampFile = os.tmpdir() + '/' + randomUUID();
  const tmpSecretFile = os.tmpdir() + '/' + randomUUID();

  try {
    return await new Promise((resolve, reject) => {
      try {
        if (!secret) {
          throw new Error('Missing VPN secret');
        }

        const timestamp = Date.now().toString(16);
        const networksString = networks.join(',');
        fs.writeFileSync(tmpTimestampFile, `${timestamp}:${networksString}`);
        fs.writeFileSync(tmpSecretFile, secret);

        const idtool = spawn('zerotier-idtool', ['sign', tmpSecretFile, tmpTimestampFile]);
        let signature = '';
        let errorMessages = '';

        idtool.stdout.on('data', (data: string) => {
          signature += data;
        });

        idtool.stderr.on('data', (data: string) => {
          errorMessages += data;
        });

        idtool.on('exit', (code: number) => {
          if (code === 0) {
            resolve(`${timestamp}:${networksString}:${signature}`);
          } else {
            reject(new Error(`child process exited with code ${code}`));
          }
        });

        idtool.on('error', (err: Error) => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  } finally {
    try {
      fs.unlinkSync(tmpTimestampFile);
      fs.unlinkSync(tmpSecretFile);
    } catch (err) {}
  }
}
