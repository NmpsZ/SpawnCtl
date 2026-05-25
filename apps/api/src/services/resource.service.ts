import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { dockerService } from './docker.service.js';

export type ContainerStats = {
  cpuPercentage: number;
  memoryUsageBytes: number;
  memoryLimitBytes: number;
};

export class ResourceService {
  /**
   * Evaluates if we have enough memory limit headroom to spawn another server.
   * Assumes each Minecraft server takes `MINECRAFT_MEMORY` (default 1G -> 1024MB).
   */
  async canAllocateMemory(requestedMb: number = 1024): Promise<boolean> {
    const runningServers = await dockerService.getAllManagedContainers();

    let totalAllocatedMb = 0;
    for (const container of runningServers) {
      if (container.State === 'running' && container.Labels['com.SpawnCtl.game'] === 'minecraft') {
        // In a real app we'd parse the MEMORY env var from inspect, 
        // but since we hardcode MINECRAFT_MEMORY in env, we'll use that or default 1024.
        const memStr = env.MINECRAFT_MEMORY.toUpperCase();
        let memMb = 1024;
        if (memStr.endsWith('G')) {
          memMb = parseInt(memStr.replace('G', ''), 10) * 1024;
        } else if (memStr.endsWith('M')) {
          memMb = parseInt(memStr.replace('M', ''), 10);
        }
        totalAllocatedMb += memMb;
      }
    }

    const availableMb = env.MAX_ALLOCATED_MEMORY_MB - totalAllocatedMb;
    logger.info({ totalAllocatedMb, requestedMb, availableMb }, 'Memory allocation check');

    return availableMb >= requestedMb;
  }

  /**
   * Fetches real-time CPU and Memory stats from Docker Engine.
   */
  async getContainerStats(containerId: string): Promise<ContainerStats | null> {
    try {
      const stats = await dockerService.getContainerStats(containerId);
      
      // Calculate CPU percentage (Docker API format)
      let cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
      let systemCpuDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
      let numberCpus = stats.cpu_stats.online_cpus || stats.cpu_stats.cpu_usage.percpu_usage?.length || 1;
      
      let cpuPercentage = 0;
      if (systemCpuDelta > 0.0 && cpuDelta > 0.0) {
        // Calculate relative to the entire host system (0-100% max)
        cpuPercentage = (cpuDelta / systemCpuDelta) * 100.0;
      }

      const memoryUsageBytes = stats.memory_stats.usage || 0;
      const memoryLimitBytes = stats.memory_stats.limit || 0;

      return {
        cpuPercentage,
        memoryUsageBytes,
        memoryLimitBytes,
      };
    } catch (err) {
      logger.error({ err, containerId }, 'Failed to fetch container stats');
      return null;
    }
  }
}

export const resourceService = new ResourceService();
