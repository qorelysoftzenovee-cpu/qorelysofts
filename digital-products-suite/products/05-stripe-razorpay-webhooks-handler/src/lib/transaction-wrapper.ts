/**
 * @file Generic async transaction wrapper with commit/rollback pattern and error logging
 * @author QorelySofts
 */

import * as crypto from 'node:crypto';
import type {
  TransactionAdapter,
  TransactionClient,
  TransactionContext,
  WebhookLogger,
} from '../types/index.js';

/**
 * Default structured logger using standard console methods.
 */
export const defaultLogger: WebhookLogger = {
  debug(msg: string, meta?: Record<string, unknown>) {
    console.debug(`[DEBUG] [${new Date().toISOString()}] ${msg}`, meta ? JSON.stringify(meta) : '');
  },
  info(msg: string, meta?: Record<string, unknown>) {
    console.info(`[INFO]  [${new Date().toISOString()}] ${msg}`, meta ? JSON.stringify(meta) : '');
  },
  warn(msg: string, meta?: Record<string, unknown>) {
    console.warn(`[WARN]  [${new Date().toISOString()}] ${msg}`, meta ? JSON.stringify(meta) : '');
  },
  error(msg: string, error?: unknown, meta?: Record<string, unknown>) {
    console.error(
      `[ERROR] [${new Date().toISOString()}] ${msg}`,
      error instanceof Error ? { message: error.message, stack: error.stack } : error,
      meta ? JSON.stringify(meta) : ''
    );
  },
};

/**
 * Default in-memory / no-op transaction adapter when no database ORM adapter is supplied.
 */
export const defaultNoopAdapter: TransactionAdapter<TransactionClient> = {
  async beginTransaction(): Promise<TransactionClient> {
    return {
      name: 'NoopTransactionClient',
      query: async () => [],
    };
  },
  async commit(): Promise<void> {
    // No-op for in-memory / adapterless operation
  },
  async rollback(): Promise<void> {
    // No-op for in-memory / adapterless operation
  },
};

/**
 * Executes a callback within a managed transaction context.
 * Automatically commits on successful completion or rolls back if an error occurs.
 *
 * @param callback - Async function receiving the TransactionContext
 * @param adapter - Database transaction adapter implementation
 * @param logger - Optional custom logger
 * @returns Result of the callback
 */
export async function withTransaction<TResult, TClient = TransactionClient>(
  callback: (ctx: TransactionContext<TClient>) => Promise<TResult>,
  adapter: TransactionAdapter<TClient> = defaultNoopAdapter as unknown as TransactionAdapter<TClient>,
  logger: WebhookLogger = defaultLogger
): Promise<TResult> {
  const transactionId = crypto.randomUUID();
  let client: TClient;

  logger.debug(`[tx:${transactionId}] Beginning transaction`);

  try {
    client = await adapter.beginTransaction();
  } catch (beginErr) {
    logger.error(`[tx:${transactionId}] Failed to initialize transaction`, beginErr);
    throw beginErr;
  }

  let isCompleted = false;

  const commitFn = async () => {
    if (isCompleted) return;
    try {
      await adapter.commit(client);
      isCompleted = true;
      logger.debug(`[tx:${transactionId}] Transaction committed successfully`);
    } catch (commitErr) {
      logger.error(`[tx:${transactionId}] Failed during transaction commit`, commitErr);
      throw commitErr;
    }
  };

  const rollbackFn = async (err?: unknown) => {
    if (isCompleted) return;
    try {
      await adapter.rollback(client, err);
      isCompleted = true;
      logger.warn(`[tx:${transactionId}] Transaction rolled back`, { error: String(err) });
    } catch (rollbackErr) {
      logger.error(`[tx:${transactionId}] Failed during transaction rollback`, rollbackErr);
      throw rollbackErr;
    }
  };

  const context: TransactionContext<TClient> = {
    id: transactionId,
    client,
    commit: commitFn,
    rollback: rollbackFn,
    get isCompleted() {
      return isCompleted;
    },
    logger: {
      debug: (msg, meta) => logger.debug(`[tx:${transactionId}] ${msg}`, meta),
      info: (msg, meta) => logger.info(`[tx:${transactionId}] ${msg}`, meta),
      warn: (msg, meta) => logger.warn(`[tx:${transactionId}] ${msg}`, meta),
      error: (msg, err, meta) => logger.error(`[tx:${transactionId}] ${msg}`, err, meta),
    },
    metadata: {},
  };

  try {
    const result = await callback(context);

    if (!isCompleted) {
      await commitFn();
    }

    return result;
  } catch (error) {
    if (!isCompleted) {
      try {
        await rollbackFn(error);
      } catch (rbErr) {
        logger.error(`[tx:${transactionId}] Secondary failure during error rollback`, rbErr);
      }
    }
    logger.error(`[tx:${transactionId}] Transaction failed and aborted`, error);
    throw error;
  }
}
