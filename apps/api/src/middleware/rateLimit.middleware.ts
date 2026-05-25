import { env } from '../config/env.js';

export const startServerRateLimit = {
  errorResponseBuilder: () => ({
    error: {
      code: 'rate_limit_exceeded',
      message: 'Too many start requests. Try again shortly.',
    },
  }),
  max: env.START_RATE_LIMIT_MAX,
  timeWindow: env.START_RATE_LIMIT_WINDOW_MS,
};
