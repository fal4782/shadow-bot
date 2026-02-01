import { createClient } from "redis";
import type { JoinMeetingPayload } from "@repo/types";
import { DockerService } from "./dockerService";

const redisClient = createClient();
const dockerService = new DockerService();

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Redis connection error:", err);
    process.exit(1);
  }
})();

const QUEUE = "join_meet_queue";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Continuously listens for items on the queue using BLPOP and logs them.
 * This assumes producers use RPUSH (FIFO).
 */
export async function listenQueue() {
  console.log(`Starting queue listener for "${QUEUE}"`);
  while (true) {
    try {
      const res = await redisClient.blPop(QUEUE, 0);
      if (!res) continue;

      // redis v4 may return array [key, element] or object { key, element }
      let item: string;
      if (Array.isArray(res)) {
        item = res[1];
      } else if (typeof res === "object" && res && "element" in res) {
        item = (res as any).element;
      } else {
        item = String(res);
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(item);
      } catch {
        parsed = item;
      }

      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "userId" in parsed &&
        "link" in parsed
      ) {
        const payload = parsed as JoinMeetingPayload;
        console.log("Dequeued JoinMeetingPayload:", payload);

        const MAX_RETRIES = 3;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          try {
            await dockerService.startRecorder(payload);
            break; // Success, exit retry loop
          } catch (err) {
            console.error(`Attempt ${attempt} failed to start recorder for user ${payload.userId}:`, err);
            if (attempt === MAX_RETRIES) {
              console.error(`All ${MAX_RETRIES} attempts failed for payload:`, payload);
              // TODO: handle re-queuing or alerting if necessary
            } else {
              await sleep(1000);
            }
          }
        }
      } else {
        console.log("Dequeued item:", parsed);
      }
    } catch (err) {
      console.error("Queue listener error:", err);
      await sleep(1000);
    }
  }
}

// start listener when module is loaded
listenQueue().catch((err) => console.error("listenQueue failed:", err));
