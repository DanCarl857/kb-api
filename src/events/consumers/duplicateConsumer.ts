import { getRabbitChannel } from "../rabbitmq";
import { QUEUES, DuplicateArticleWarningEvent } from "../eventTypes";
import logger from "../../logger";

export async function startDuplicateConsumer() {
  const channel = await getRabbitChannel();

  await channel.assertQueue(QUEUES.DUPLICATE_WARNING, { durable: true });

  logger.info("[WORKER] Listening for duplicate_article_warning events...");

  channel.consume(
    QUEUES.DUPLICATE_WARNING,
    async (msg) => {
      if (!msg) return;

      const event: DuplicateArticleWarningEvent = JSON.parse(msg.content.toString());

      logger.info(
        `[DUPLICATE WARNING] Possible duplicate detected for tenant ${event.tenantId}`,
        event
      );
      channel.ack(msg);
    },
    { noAck: false }
  );
}