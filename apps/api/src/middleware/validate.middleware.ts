import type { FastifyRequest } from 'fastify';
import type { ZodTypeAny } from 'zod';

export function validateBody(schema: ZodTypeAny) {
  return async (req: FastifyRequest) => {
    schema.parse(req.body ?? {});
  };
}

export function validateParams(schema: ZodTypeAny) {
  return async (req: FastifyRequest) => {
    schema.parse(req.params);
  };
}
