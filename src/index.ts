import {DCMetroProxyApplication} from './application';
import {ApplicationConfig} from '@loopback/core';

export {DCMetroProxyApplication};

export async function main(options: ApplicationConfig = {}) {
  const app = new DCMetroProxyApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}
