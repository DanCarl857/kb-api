import { getRabbitChannel } from "../rabbitmq";
import { DuplicateArticleWarningEvent, QUEUES } from "../eventTypes";

export async function emitDuplicateWarning(event: DuplicateArticleWarningEvent) {
  const channel = await getRabbitChannel();

  await channel.assertQueue(QUEUES.DUPLICATE_WARNING, { durable: true });

  channel.sendToQueue(
    QUEUES.DUPLICATE_WARNING,
    Buffer.from(JSON.stringify(event)),
    { persistent: true }
  );

  console.log(`[EVENT] duplicate_article_warning emitted`, event);
}