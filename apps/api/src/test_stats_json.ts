import Dockerode from 'dockerode';
import { env } from './config/env.js';

function parseDockerHost(host: string): Dockerode.DockerOptions {
  if (host.startsWith('unix://')) {
    return { socketPath: host.replace('unix://', '') };
  }
  if (host.startsWith('npipe://')) {
    return { socketPath: host.replace('npipe://', '//') };
  }
  const url = new URL(host);
  const protocol = url.protocol === 'tcp:' ? 'http' : url.protocol.replace(':', '');
  return {
    host: url.hostname,
    port: Number(url.port),
    protocol: protocol as 'http' | 'https',
  };
}

function dockerOptions(): Dockerode.DockerOptions {
  if (env.DOCKER_HOST) {
    return parseDockerHost(env.DOCKER_HOST);
  }
  if (env.DOCKER_SOCKET_PATH) {
    return { socketPath: env.DOCKER_SOCKET_PATH };
  }
  if (process.platform === 'win32') {
    return { socketPath: '//./pipe/docker_engine' };
  }
  return { socketPath: '/var/run/docker.sock' };
}

const docker = new Dockerode(dockerOptions());

async function run() {
  const containers = await docker.listContainers({ all: false });
  const mc = containers.find(c => c.Names && c.Names[0] && c.Names[0].includes('SpawnCtl-minecraft'));
  if (!mc || !mc.Names || !mc.Names[0]) {
    console.log('No active SpawnCtl-minecraft container found');
    process.exit(1);
  }

  console.log('Subscribing to stats stream for container:', mc.Names[0]);
  const container = docker.getContainer(mc.Id);
  const statsStream = await container.stats({ stream: true }) as NodeJS.ReadableStream;

  statsStream.on('data', (chunk) => {
    const text = chunk.toString('utf-8');
    try {
      const raw = JSON.parse(text);
      console.log('RAW JSON STATS KEY STRUCTURE:', Object.keys(raw));
      console.log('memory_stats:', raw.memory_stats);
      console.log('cpu_stats:', raw.cpu_stats);
      console.log('precpu_stats:', raw.precpu_stats);
    } catch {
      console.log('Received chunk, but not valid single JSON line:', text.substring(0, 100));
    }
    process.exit(0);
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
