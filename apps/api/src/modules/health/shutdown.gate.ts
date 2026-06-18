import { type BeforeApplicationShutdown, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { type Environment } from "../../config/environment.js";

/**
 * Coordinates ordered, graceful shutdown (blueprint/20). On SIGTERM, this flips
 * `isShuttingDown` FIRST so the readiness probe immediately reports `down`/503
 * and the load balancer drains this instance, THEN waits a bounded drain window
 * for in-flight requests before Nest closes backing resources (pool/redis).
 */
@Injectable()
export class ShutdownGate implements BeforeApplicationShutdown {
  private readonly logger = new Logger(ShutdownGate.name);
  private shuttingDown = false;
  private readonly drainMs: number;

  constructor(config: ConfigService<Environment, true>) {
    this.drainMs = config.get("SHUTDOWN_DRAIN_MS", { infer: true });
  }

  get isShuttingDown(): boolean {
    return this.shuttingDown;
  }

  async beforeApplicationShutdown(): Promise<void> {
    if (this.shuttingDown) {
      return;
    }
    this.shuttingDown = true;
    this.logger.log(`Draining for ${this.drainMs}ms before closing resources`);
    await delay(this.drainMs);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
