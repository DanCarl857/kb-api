import amqp from "amqplib";

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

export const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

export async function getRabbitChannel(): Promise<amqp.Channel> {
  if (channel) return channel;

  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  return channel;
}
