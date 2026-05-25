import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

import { HttpError } from '../lib/http-error.js';
import { logger } from '../lib/logger.js';

export function errorHandler(
  error: FastifyError | Error,
  _req: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof HttpError) {
    reply.code(error.statusCode).send({
      error: {
        code: error.code,
        details: error.details,
        message: error.message,
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    reply.code(400).send({
      error: {
        code: 'validation_error',
        details: error.flatten(),
        message: 'Request validation failed.',
      },
    });
    return;
  }

  logger.error({ error }, 'Unhandled request error');
  reply.code(500).send({
    error: {
      code: 'internal_server_error',
      message: 'Unexpected server error.',
    },
  });
}
