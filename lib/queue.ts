import { Queue, QueueEvents, Worker, Job } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

export const QUEUE_NAMES = {
  intake: "scholaria.intake",
  scope: "scholaria.scope",
  review: "scholaria.review",
  qa: "scholaria.qa",
  delivery: "scholaria.delivery",
  notify: "scholaria.notify"
} as const;

type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

const queues = new Map<QueueName, Queue>();

export function queue(name: QueueName): Queue {
  let q = queues.get(name);
  if (!q) {
    q = new Queue(name, {
      connection,
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

export function events(name: QueueName) {
  return new QueueEvents(name, { connection });
}

export function worker<T>(name: QueueName, fn: (job: Job<T>) => Promise<unknown>) {
  return new Worker<T>(name, fn, { connection, concurrency: 4 });
}
