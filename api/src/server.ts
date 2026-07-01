import { config } from 'dotenv';

config();

import { App } from './app.js';

const app = new App();

await app.build();

await app.listen();