import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    authUser: {
      email: string | null;
      id: string;
    };
  }
}
