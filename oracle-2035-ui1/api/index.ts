import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const serverModule = require('../dist/server.cjs');

const app = serverModule.createApp();
export default app;
