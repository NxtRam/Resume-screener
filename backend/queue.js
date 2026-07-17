import Redis from "ioredis";
import {processResumeCore} from "./controllers/processResume.js";
import dotenv from 'dotenv';
dotenv.config();

class InMemoryQueue {
  constructor() {
    this.jobs = new Map();
    this.queue = [];
    this.processing = false;
    this.startProcessing();
  }

  async addJob(jobData) {
    const jobId = `job:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    const job = {
      status: "queued",
      jobData: JSON.stringify(jobData),
      createdAt: Date.now(),
    };
    this.jobs.set(jobId, job);
    this.queue.push(jobId);
    return jobId;
  }

  async removeStuckJobs() {
    console.log("In-memory queue: no stuck jobs to clean up.");
  }

  async startProcessing() {
    setInterval(async () => {
      if (this.processing) return;
      this.processing = true;

      try {
        const jobId = this.queue.shift();
        if (!jobId) {
          this.processing = false;
          return;
        }

        const job = this.jobs.get(jobId);
        if (!job) {
          this.processing = false;
          return;
        }

        job.status = "processing";
        job.startedAt = Date.now();
        const jobData = JSON.parse(job.jobData || '{}');

        try {
          console.log(`[InMemoryQueue] Processing job ${jobId} with data`, jobData);
          const result = await processResumeCore(jobData);
          console.log(`[InMemoryQueue] Finished processing job ${jobId}`);
          
          job.status = "completed";
          job.result = JSON.stringify(result);
          job.completedAt = Date.now();
        } catch (error) {
          console.log(`[InMemoryQueue] Error processing job ${jobId}:`, error);
          job.status = "failed";
          job.error = error.message;
          job.completedAt = Date.now();
        }
      } catch (error) {
        console.error("[InMemoryQueue] Processing error:", error);
      } finally {
        this.processing = false;
      }
    }, 1000);
  }

  async getJobStatus(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    return {
      id: jobId,
      status: job.status,
      jobData: job.jobData ? JSON.parse(job.jobData) : null,
      result: job.result ? JSON.parse(job.result) : null,
      error: job.error || null,
      createdAt: parseInt(job.createdAt),
    };
  }
}

class SimpleQueue {
  constructor(redisClient) {
    this.redis = redisClient;
    this.processing = false;
    this.removeStuckJobs();
    this.startProcessing();
  }

  async addJob(jobData) {
    const jobId = `job:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    await this.redis.hset(jobId, {
      status: "queued",
      jobData: JSON.stringify(jobData),
      createdAt: Date.now(),
    });
    await this.redis.lpush("queue", jobId);
    return jobId;
  }

  async removeStuckJobs() {
    try {
      console.log("Removing stuck jobs...");
      const jobKeys = await this.redis.keys("job:*");
      for (const key of jobKeys) {
        const job = await this.redis.hgetall(key);
        if (job.status === "processing") {
          console.log(`Removing stuck job: ${key}`);
          await this.redis.del(key);
        }
      }
      console.log("Stuck job removal completed");
    } catch (error) {
      console.error("Error removing stuck jobs:", error);
    }
  }

  async startProcessing() {
    setInterval(async () => {
      if (this.processing) return;
      this.processing = true;

      try {
        const jobId = await this.redis.rpop("queue");
        if (!jobId) {
          this.processing = false;
          return;
        }

        await this.redis.hset(jobId, { status: "processing", startedAt: Date.now() });
        const job = await this.redis.hgetall(jobId);
        const jobData = JSON.parse(job.jobData || '{}');

        try {
          console.log(`Processing job ${jobId} with data`, jobData);
          const result = await processResumeCore(jobData);

          console.log(`Finished processing job ${jobId}`);
          await this.redis.hset(jobId, {
            status: "completed",
            result: JSON.stringify(result),
            completedAt: Date.now(),
          });
        } catch (error) {
          console.log(`Error processing job ${jobId}:`, error);
          await this.redis.hset(jobId, {
            status: "failed",
            error: error.message,
            completedAt: Date.now(),
          });
        }
      } catch (error) {
        console.error("Processing error:", error);
      } finally {
        this.processing = false;
      }
    }, 1000);
  }

  async getJobStatus(jobId) {
    const job = await this.redis.hgetall(jobId);
    if (!job || Object.keys(job).length === 0) return null;

    return {
      id: jobId,
      status: job.status,
      jobData: job.jobData ? JSON.parse(job.jobData) : null,
      result: job.result ? JSON.parse(job.result) : null,
      error: job.error || null,
      createdAt: parseInt(job.createdAt),
    };
  }
}

let queueInstance;

if (process.env.REDIS_URL) {
  console.log("REDIS_URL found, initializing Redis-backed SimpleQueue...");
  try {
    const redis = new Redis(process.env.REDIS_URL, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redis.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    queueInstance = new SimpleQueue(redis);
  } catch (err) {
    console.error("Failed to construct Redis client, falling back to InMemoryQueue:", err);
    queueInstance = new InMemoryQueue();
  }
} else {
  console.log("No REDIS_URL environment variable found. Falling back to zero-dependency InMemoryQueue.");
  queueInstance = new InMemoryQueue();
}

export default queueInstance;
