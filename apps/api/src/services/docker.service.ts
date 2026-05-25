import Dockerode from 'dockerode';
import type { ContainerCreateOptions, DockerOptions } from 'dockerode';

import { env } from '../config/env.js';
import { HttpError } from '../lib/http-error.js';

const appLabel = 'SpawnCtl';

function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage = 'Docker operation timed out'): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(errorMessage));
    }, ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}


type StartMinecraftInput = {
  eula: 'TRUE';
  image: string;
  memory: string;
  version?: string;
  gameMode?: string;
  difficulty?: string;
  seed?: string | null;
  serverId: string;
  userId: string;
};

type StartTerrariaInput = {
  serverId: string;
  userId: string;
  name: string;
  memory: string;
  version?: string;
  difficulty?: string;
  seed?: string | null;
};

type RuntimeInfo = {
  containerId: string;
  hostPort: number | null;
};

function parseDockerHost(host: string): DockerOptions {
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
    protocol: protocol as DockerOptions['protocol'],
  };
}

function dockerOptions(): DockerOptions {
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

function containerName(serverId: string, game: 'minecraft' | 'terraria' = 'minecraft') {
  return `SpawnCtl-${game}-${serverId}`;
}

function volumeName(serverId: string, game: 'minecraft' | 'terraria' = 'minecraft') {
  return `SpawnCtl-${game}-${serverId}-data`;
}

function getHostPort(container: Dockerode.ContainerInspectInfo, port = '25565/tcp') {
  const mapping = container.NetworkSettings.Ports?.[port]?.[0]?.HostPort;
  return mapping ? Number(mapping) : null;
}

function isManagedContainer(container: Dockerode.ContainerInspectInfo, expectedServerId: string) {
  const labels = container.Config.Labels ?? {};

  const isAppMatch =
    labels['com.SpawnCtl.app'] === appLabel ||
    labels['com.deployquest.app'] === 'DeployQuest';

  const isServerMatch =
    labels['com.SpawnCtl.serverId'] === expectedServerId ||
    labels['com.deployquest.serverId'] === expectedServerId;

  return isAppMatch && isServerMatch;
}

async function followPullStream(docker: Dockerode, stream: NodeJS.ReadableStream) {
  await new Promise<void>((resolve, reject) => {
    docker.modem.followProgress(stream, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

class DockerService {
  private readonly docker = new Dockerode(dockerOptions());

  async startMinecraftServer(input: StartMinecraftInput): Promise<RuntimeInfo> {
    await this.ensureImage(input.image);
    await this.ensureVolume({
      name: volumeName(input.serverId),
      serverId: input.serverId,
      userId: input.userId,
    });

    const cName = containerName(input.serverId);
    const existingContainer = this.docker.getContainer(cName);
    try {
      await existingContainer.inspect();
      await existingContainer.remove({ force: true });
    } catch {
      // Container doesn't exist, proceed
    }

    const envs = [
      `EULA=${input.eula}`,
      `MEMORY=${input.memory}`,
      'TYPE=PAPER',
      'ENABLE_RCON=false',
      'CREATE_CONSOLE_IN_PIPE=true',
      ...(input.version && input.version !== 'LATEST' ? [`VERSION=${input.version}`] : []),
      ...(input.gameMode ? [`MODE=${input.gameMode}`] : []),
      ...(input.difficulty ? [`DIFFICULTY=${input.difficulty}`] : []),
      ...(input.seed ? [`SEED=${input.seed}`] : []),
    ];

    const createOptions: ContainerCreateOptions = {
      Env: envs,
      ExposedPorts: {
        '25565/tcp': {},
      },
      HostConfig: {
        AutoRemove: false,
        Mounts: [
          {
            Source: volumeName(input.serverId),
            Target: '/data',
            Type: 'volume',
          },
        ],
        PortBindings: {
          '25565/tcp': [{ HostPort: '' }],
        },
        Privileged: false,
        PublishAllPorts: true,
        RestartPolicy: {
          Name: 'no',
        },
      },
      Image: input.image,
      Labels: {
        'com.SpawnCtl.app': appLabel,
        'com.SpawnCtl.game': 'minecraft',
        'com.SpawnCtl.serverId': input.serverId,
        'com.SpawnCtl.userId': input.userId,
      },
      name: cName,
    };

    const container = await this.docker.createContainer(createOptions);
    await container.start();

    const inspected = await container.inspect();

    return {
      containerId: container.id,
      hostPort: getHostPort(inspected),
    };
  }

  async startTerrariaServer(input: StartTerrariaInput): Promise<RuntimeInfo> {
    const game = 'terraria';
    const image = env.TERRARIA_IMAGE || 'beardedio/terraria:latest';
    await this.ensureImage(image);
    await this.ensureVolume({
      name: volumeName(input.serverId, game),
      serverId: input.serverId,
      userId: input.userId,
      game,
    });

    const cName = containerName(input.serverId, game);
    const existingContainer = this.docker.getContainer(cName);
    try {
      await existingContainer.inspect();
      await existingContainer.remove({ force: true });
    } catch {
      // Doesn't exist
    }

    let diffVal = '0';
    if (input.difficulty === 'expert' || input.difficulty === 'normal') diffVal = '1';
    else if (input.difficulty === 'master' || input.difficulty === 'hard') diffVal = '2';
    else if (input.difficulty === 'journey' || input.difficulty === 'peaceful') diffVal = '3';

    const cmd = [
      '-autocreate', '2',
      '-world', `/world/${input.name}.wld`,
      '-difficulty', diffVal,
      '-maxplayers', '8',
      '-port', '7777',
      '-rest',
      '-restport', '7878',
      '-restip', '0.0.0.0',
      ...(input.seed ? ['-seed', input.seed] : []),
    ];

    const createOptions: ContainerCreateOptions = {
      ExposedPorts: {
        '7777/tcp': {},
        '7878/tcp': {},
      },
      HostConfig: {
        AutoRemove: false,
        Mounts: [
          {
            Source: volumeName(input.serverId, game),
            Target: '/world',
            Type: 'volume',
          },
        ],
        PortBindings: {
          '7777/tcp': [{ HostPort: '' }],
          '7878/tcp': [{ HostPort: '' }],
        },
        Privileged: false,
        PublishAllPorts: true,
        RestartPolicy: {
          Name: 'no',
        },
      },
      Image: image,
      Cmd: cmd,
      OpenStdin: true,
      Tty: true,
      Labels: {
        'com.SpawnCtl.app': appLabel,
        'com.SpawnCtl.game': game,
        'com.SpawnCtl.serverId': input.serverId,
        'com.SpawnCtl.userId': input.userId,
      },
      name: cName,
    };

    const container = await this.docker.createContainer(createOptions);
    await container.start();

    const inspected = await container.inspect();

    return {
      containerId: container.id,
      hostPort: getHostPort(inspected, '7777/tcp'),
    };
  }

  async startPlayitContainer(serverId: string, userId: string, secretKey: string, game: 'minecraft' | 'terraria' = 'minecraft') {
    const mcContainerName = containerName(serverId, game);
    const cName = `playit-${mcContainerName}`;

    const existingContainer = this.docker.getContainer(cName);
    try {
      await existingContainer.inspect();
      await existingContainer.remove({ force: true });
    } catch {
      // Doesn't exist
    }

    await this.ensureImage('ghcr.io/playit-cloud/playit-agent:0.15');

    const envs: string[] = [];
    if (secretKey) {
      envs.push(`SECRET_KEY=${secretKey}`);
    }

    const volumeName = `playit-config-${serverId}`;

    const createOptions: Dockerode.ContainerCreateOptions = {
      Env: envs,
      HostConfig: {
        AutoRemove: false,
        NetworkMode: `container:${mcContainerName}`,
        RestartPolicy: { Name: 'no' },
        Binds: [`${volumeName}:/etc/playit`],
      },
      Image: 'ghcr.io/playit-cloud/playit-agent:0.15',
      Labels: {
        'com.SpawnCtl.app': appLabel,
        'com.SpawnCtl.game': 'playit',
        'com.SpawnCtl.serverId': serverId,
        'com.SpawnCtl.userId': userId,
      },
      name: cName,
    };

    const container = await this.docker.createContainer(createOptions);
    await container.start();

    return container.id;
  }

  async stopManagedContainer(containerId: string, serverId: string) {
    const container = this.docker.getContainer(containerId);

    let inspected: Dockerode.ContainerInspectInfo;
    try {
      inspected = await withTimeout(container.inspect(), 4000, 'Docker inspect timed out');
    } catch (error) {
      const err = error as { statusCode?: number };
      if (err.statusCode === 404) {
        return;
      }
      throw error;
    }

    if (!isManagedContainer(inspected, serverId)) {
      throw new HttpError(
        403,
        'unmanaged_container',
        'Refusing to stop a container not managed by SpawnCtl.',
      );
    }

    if (inspected.State.Running) {
      try {
        await withTimeout(container.stop({ t: 15 }), 18000, 'Docker stop timed out');
      } catch (error) {
        const err = error as { statusCode?: number };
        if (err.statusCode !== 304) {
          await withTimeout(container.kill(), 4000, 'Docker kill timed out').catch(() => { });
        }
      }
    }

    const game = (inspected.Config.Labels['com.SpawnCtl.game'] || 'minecraft') as 'minecraft' | 'terraria';
    // Attempt to stop associated playit container
    const playitContainerName = `playit-${containerName(serverId, game)}`;
    try {
      const playitContainer = this.docker.getContainer(playitContainerName);
      const playitInspected = await withTimeout(playitContainer.inspect(), 4000, 'Playit inspect timed out');
      if (playitInspected.State.Running) {
        await withTimeout(playitContainer.stop({ t: 5 }), 8000, 'Playit stop timed out').catch(() =>
          withTimeout(playitContainer.kill(), 4000, 'Playit kill timed out').catch(() => { })
        );
      }
    } catch {
      // Playit container might not exist, ignore
    }
  }

  /**
   * Full cleanup: stop + remove containers + remove volumes.
   * Used when a server is permanently deleted.
   */
  async deleteManagedContainer(containerId: string, serverId: string) {
    let game: 'minecraft' | 'terraria' = 'minecraft';
    try {
      const container = this.docker.getContainer(containerId);
      const inspected = await withTimeout(container.inspect(), 4000).catch(() => null);
      if (inspected && inspected.Config.Labels['com.SpawnCtl.game']) {
        game = inspected.Config.Labels['com.SpawnCtl.game'] as 'minecraft' | 'terraria';
      }
    } catch {
      // Ignore
    }

    // Stop everything first
    await this.stopManagedContainer(containerId, serverId);

    // Remove game container
    try {
      const container = this.docker.getContainer(containerId);
      await withTimeout(container.remove({ force: true }), 8000, 'Docker remove timed out');
    } catch (error) {
      const err = error as { statusCode?: number };
      if (err.statusCode !== 404) throw error;
    }

    // Remove playit container
    const playitContainerName = `playit-${containerName(serverId, game)}`;
    try {
      const playitContainer = this.docker.getContainer(playitContainerName);
      await withTimeout(playitContainer.remove({ force: true }), 8000, 'Playit remove timed out');
    } catch {
      // Playit container might not exist, ignore
    }

    // Remove game data volume
    try {
      const vol = this.docker.getVolume(volumeName(serverId, game));
      await withTimeout(vol.remove(), 8000, 'Volume remove timed out');
    } catch {
      // Volume might not exist, ignore
    }

    // Remove playit config volume
    try {
      const playitVol = this.docker.getVolume(`playit-config-${serverId}`);
      await withTimeout(playitVol.remove(), 8000, 'Playit volume remove timed out');
    } catch {
      // Playit volume might not exist, ignore
    }
  }

  async inspectManagedContainer(containerId: string, serverId: string, port = '25565/tcp') {
    const container = this.docker.getContainer(containerId);

    let inspected: Dockerode.ContainerInspectInfo;
    try {
      inspected = await withTimeout(container.inspect(), 4000, 'Docker inspect timed out');
    } catch (error) {
      const err = error as { statusCode?: number };
      if (err.statusCode === 404) {
        return {
          containerState: null,
          hostPort: null,
        };
      }
      throw error;
    }

    if (!isManagedContainer(inspected, serverId)) {
      throw new HttpError(
        403,
        'unmanaged_container',
        'Refusing to inspect a container not managed by SpawnCtl.',
      );
    }

    return {
      containerState: inspected.State.Status,
      hostPort: getHostPort(inspected, port),
    };
  }

  async sendCommand(containerId: string, serverId: string, command: string) {
    const container = this.docker.getContainer(containerId);

    let inspected: Dockerode.ContainerInspectInfo;
    try {
      inspected = await withTimeout(container.inspect(), 4000, 'Docker inspect timed out');
    } catch (error) {
      const err = error as { statusCode?: number };
      if (err.statusCode === 404) {
        throw new HttpError(404, 'container_not_found', 'Container not found.');
      }
      throw error;
    }

    if (!isManagedContainer(inspected, serverId)) {
      throw new HttpError(
        403,
        'unmanaged_container',
        'Refusing to send command to a container not managed by SpawnCtl.',
      );
    }

    if (inspected.State.Status !== 'running') {
      throw new HttpError(400, 'container_not_running', 'Server is not running.');
    }

    const game = inspected.Config.Labels['com.SpawnCtl.game'];

    try {
      if (game === 'minecraft') {
        const exec = await container.exec({
          Cmd: ['mc-send-to-console', command],
          User: '1000',
          AttachStdin: false,
          AttachStdout: true,
          AttachStderr: true,
        });
        const stream = await exec.start({});
        await new Promise((resolve) => {
           stream.on('end', resolve);
           stream.resume(); // Drain the stream
        });
      } else {
        // For Terraria (or others), we try attaching to STDIN
        const stream = await container.attach({
          stream: true,
          stdin: true,
          stdout: false,
          stderr: false,
          hijack: true,
        });
        
        // dockerode sends the attach options as a JSON body due to a bug, which appears as garbage in the console.
        // We send a newline first to flush the garbage, then send our actual command.
        stream.write('\n' + command + '\n');
        
        // We don't end the stream because it will close the container's STDIN.
      }
    } catch (err) {
      throw new HttpError(500, 'command_failed', 'Failed to send command to server.');
    }
  }

  async getContainerLogsStream(containerId: string, serverId: string) {
    const container = this.docker.getContainer(containerId);

    let inspected: Dockerode.ContainerInspectInfo;
    try {
      inspected = await withTimeout(container.inspect(), 4000, 'Docker inspect timed out');
    } catch (error) {
      const err = error as { statusCode?: number };
      if (err.statusCode === 404) {
        throw new HttpError(404, 'container_not_found', 'Container not found.');
      }
      throw error;
    }

    if (!isManagedContainer(inspected, serverId)) {
      throw new HttpError(
        403,
        'unmanaged_container',
        'Refusing to get logs from a container not managed by SpawnCtl.',
      );
    }

    return container.logs({
      follow: true,
      stdout: true,
      stderr: true,
      tail: 100,
    });
  }

  demuxStream(
    stream: NodeJS.ReadableStream,
    stdout: NodeJS.WritableStream,
    stderr: NodeJS.WritableStream,
  ) {
    this.docker.modem.demuxStream(stream, stdout, stderr);
  }

  async getContainerStatsStream(containerId: string, serverId: string) {
    const container = this.docker.getContainer(containerId);

    let inspected: Dockerode.ContainerInspectInfo;
    try {
      inspected = await withTimeout(container.inspect(), 4000, 'Docker inspect timed out');
    } catch (error) {
      const err = error as { statusCode?: number };
      if (err.statusCode === 404) {
        throw new HttpError(404, 'container_not_found', 'Container not found.');
      }
      throw error;
    }

    if (!isManagedContainer(inspected, serverId)) {
      throw new HttpError(
        403,
        'unmanaged_container',
        'Refusing to get stats from a container not managed by SpawnCtl.',
      );
    }

    return container.stats({ stream: true }) as Promise<NodeJS.ReadableStream>;
  }

  async getAllManagedContainers() {
    return this.docker.listContainers({
      all: true,
      filters: {
        label: [`com.SpawnCtl.app=${appLabel}`]
      }
    });
  }

  async getContainerStats(containerId: string) {
    const container = this.docker.getContainer(containerId);
    return container.stats({ stream: false }) as Promise<any>;
  }

  private async ensureImage(image: string) {
    try {
      await this.docker.getImage(image).inspect();
    } catch {
      const stream = await this.docker.pull(image);
      await followPullStream(this.docker, stream);
    }
  }

  private async ensureVolume({
    name,
    serverId,
    userId,
    game = 'minecraft',
  }: {
    name: string;
    serverId: string;
    userId: string;
    game?: 'minecraft' | 'terraria';
  }) {
    const volume = this.docker.getVolume(name);

    try {
      await volume.inspect();
    } catch {
      await this.docker.createVolume({
        Labels: {
          'com.SpawnCtl.app': appLabel,
          'com.SpawnCtl.game': game,
          'com.SpawnCtl.serverId': serverId,
          'com.SpawnCtl.userId': userId,
        },
        Name: name,
      });
    }
  }
  /**
   * Get Docker daemon system info for the System Health dashboard.
   */
  async getSystemInfo() {
    const info = await this.docker.info();
    const version = await this.docker.version();

    return {
      dockerVersion: version.Version,
      cpus: info.NCPU,
      totalMemoryBytes: info.MemTotal,
      containersRunning: info.ContainersRunning,
      containersStopped: info.ContainersStopped,
      containersTotal: info.Containers,
      storageDriver: info.Driver,
      operatingSystem: info.OperatingSystem,
    };
  }

  /**
   * Get all managed containers with port mapping info for the Active Container Registry.
   */
  async getActiveContainerRegistry() {
    const containers = await this.docker.listContainers({
      all: true,
      filters: {
        label: [`com.SpawnCtl.app=${appLabel}`],
      },
    });

    return containers.map((c) => {
      const game = c.Labels['com.SpawnCtl.game'] || 'unknown';
      const serverId = c.Labels['com.SpawnCtl.serverId'] || '';
      const userId = c.Labels['com.SpawnCtl.userId'] || '';

      // Extract port mappings
      const ports = (c.Ports || [])
        .filter((p) => p.PublicPort)
        .map((p) => ({
          hostPort: p.PublicPort,
          containerPort: p.PrivatePort,
          protocol: p.Type,
        }));

      return {
        containerId: c.Id.substring(0, 12),
        name: c.Names?.[0]?.replace(/^\//, '') || 'unknown',
        image: c.Image,
        state: c.State,
        status: c.Status,
        game,
        serverId,
        userId,
        ports,
        created: c.Created,
      };
    });
  }
}

export const dockerService = new DockerService();
