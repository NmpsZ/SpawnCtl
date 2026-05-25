import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '../..');

dotenv.config({
  path: path.join(workspaceRoot, '.env'),
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@deployquest/shared'],
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
