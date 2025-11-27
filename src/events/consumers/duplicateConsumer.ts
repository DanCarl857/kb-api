import { getRabbitChannel } from "../rabbitmq";
import { QUEUES, DuplicateArticleWarningEvent } from "../eventTypes";
import logger from "../../logger";
import { AppDataSource } from "../../data-source";
import { DuplicateRecord } from "../../entities/DuplicateRecord";

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

      const repo = AppDataSource.getRepository(DuplicateRecord);
      await repo.save({
        newArticleId: event.newArticleId,
        existingArticleId: event.existingArticleId,
        tenantId: event.tenantId,
        reason: event.reason,
        timestamp: event.timestamp,
      });
      channel.ack(msg);
    },
    { noAck: false }
  );
}