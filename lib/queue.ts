import { Queue, QueueEvents, Worker, Job } from "bullmq";
import IORedis from "ioredis";

let connection: IORedis | null = null;

export function redisQueueConfigured(): boolean {
  return Boolean(process.env.REDIS_URL);
}

function getConnection(): IORedis {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL is not configured; Redis queue is disabled.");
  }

  if (!connection) {
    connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false
    });
    connection.on("error", (err) => {
      console.warn("[queue] redis connection error:", err instanceof Error ? err.message : String(err));
    });
  }

  return connection;
}

export const QUEUE_NAMES = {
  intake: "scholaria.intake",
  scope: "scholaria.scope",
  review: "scholaria.review",
  qa: "scholaria.qa",
  delivery: "scholaria.delivery",
  notify: "scholaria.notify"
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

const queues = new Map<QueueName, Queue>();

export function queue(name: QueueName): Queue {
  let q = queues.get(name);
  if (!q) {
    q = new Queue(name, {
      connection: getConnection(),
      defaultJobOptions: {
        removeOnComplete: { age: 86400, count: 5000 },
        removeOnFail: { age: 604800 },
        attempts: 4,
        backoff: { type: "exponential", delay: 5000 }
      }
    });
    queues.set(name, q);
  }
  return q;
}

export async function enqueueOptional(
  name: QueueName,
  jobName: string,
  data: Record<string, unknown>
): Promise<{ ok: true } | { ok: false; skipped?: boolean; error: string }> {
  if (!redisQueueConfigured()) {
    return { ok: false, skipped: true, error: "REDIS_URL not configured" };
  }

  try {
    await queue(name).add(jobName, data);
    return { ok: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.warn(`[queue] failed to enqueue ${name}/${jobName}:`, error);
    return { ok: false, error };
  }
}

export function events(name: QueueName) {
  return new QueueEvents(name, { connection: getConnection() });
}

export function worker<T>(name: QueueName, fn: (job: Job<T>) => Promise<unknown>) {
  return new Worker<T>(name, fn, { connection: getConnection(), concurrency: 4 });
}
