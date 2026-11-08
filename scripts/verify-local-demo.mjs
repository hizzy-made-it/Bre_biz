import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { once } from 'node:events';
import { access, mkdtemp, realpath, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

// Run after npm run build. All data and credentials are temporary and local.
await access(resolve('.next/BUILD_ID'));
const tempRoot = await realpath(tmpdir());
const testDirectory = await mkdtemp(join(tempRoot, 'breanna-demo-qa-'));
const reservation = createServer();
reservation.listen(0, '127.0.0.1');
await once(reservation, 'listening');
const port = reservation.address().port;
await new Promise((done) => reservation.close(done));
const origin = `http://127.0.0.1:${port}`;
const env = {
  ...process.env,
  NODE_ENV: 'production',
  NEXT_TELEMETRY_DISABLED: '1',
  APP_ORIGIN: origin,
  DEMO_TEST_ORIGIN: origin,
  DEMO_ACCESS_CODE: randomBytes(16).toString('hex'),
  DEMO_SESSION_SECRET: randomBytes(48).toString('base64'),
  DATABASE_PATH: join(testDirectory, 'demo.sqlite'),
};
delete env.DEMO_INSECURE_COOKIES;
const server = spawn(process.execPath, [resolve('node_modules/next/dist/bin/next'), 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
  env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
});
let serverOutput = '';
let serverExited = false;
server.once('exit', () => { serverExited = true; });
server.stdout.on('data', (chunk) => { serverOutput = (serverOutput + chunk).slice(-6000); });
server.stderr.on('data', (chunk) => { serverOutput = (serverOutput + chunk).slice(-6000); });
let test;
let timedOut = false;
const deadline = setTimeout(() => {
  timedOut = true;
  test?.kill();
  server.kill();
}, 120_000);

try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (serverExited || timedOut) throw new Error(`Local QA server exited before readiness.\n${serverOutput}`);
    try {
      const response = await fetch(`${origin}/api/health`, { signal: AbortSignal.timeout(1000) });
      if (response.ok) { ready = true; break; }
    } catch { /* Readiness is bounded by the loop and overall deadline. */ }
    await delay(200);
  }
  assert.ok(ready, 'Local QA server did not become ready');
  console.log('Running production API checks on loopback with a disposable SQLite database.');
  test = spawn(process.execPath, [resolve('scripts/verify-demo-api.mjs')], { env, windowsHide: true, stdio: 'inherit' });
  const [code] = await once(test, 'exit');
  assert.equal(timedOut, false, 'Local QA exceeded its two-minute limit');
  assert.equal(code, 0, 'Demo API verification failed');
} finally {
  clearTimeout(deadline);
  if (test && test.exitCode === null) test.kill();
  if (!serverExited) {
    const stopped = once(server, 'exit');
    server.kill();
    await stopped;
  }
  // Verify the exact generated target before a recursive Windows cleanup.
  const cleanupTarget = await realpath(testDirectory);
  assert.equal(dirname(cleanupTarget), tempRoot);
  assert.ok(basename(cleanupTarget).startsWith('breanna-demo-qa-'));
  await rm(cleanupTarget, { recursive: true, force: true });
  console.log('Local QA server stopped and temporary database removed.');
}
