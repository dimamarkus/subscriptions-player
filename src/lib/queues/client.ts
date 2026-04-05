import "server-only";
import { QueueClient } from "@vercel/queue";

const queueClient = new QueueClient({
  region: process.env.VERCEL_REGION ?? "iad1",
});

export const { send, handleCallback } = queueClient;
