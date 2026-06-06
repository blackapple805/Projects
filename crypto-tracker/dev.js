// Runs the API server and the React dev server together with one command.
// Uses only Node built-ins — nothing to install.
// Spawns `node` directly (no npm.cmd, no shell) so it works cleanly on
// Windows with modern Node versions.

const { spawn } = require('child_process');

const tasks = [
  { name: 'SERVER', color: '\x1b[34m', args: ['--watch', 'server.js'] },                                  // blue
  { name: 'CLIENT', color: '\x1b[32m', args: ['node_modules/react-scripts/bin/react-scripts.js', 'start'] }, // green
];

const RESET = '\x1b[0m';
let shuttingDown = false;

const children = tasks.map((t) => {
  const child = spawn(process.execPath, t.args, { env: process.env });
  const prefix = `${t.color}[${t.name}]${RESET} `;

  const pipe = (stream, out) =>
    stream.on('data', (buf) => {
      const lines = buf.toString().split(/\r?\n/).filter(Boolean);
      out.write(lines.map((l) => prefix + l).join('\n') + '\n');
    });

  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);

  child.on('exit', (code) => {
    process.stdout.write(`${prefix}exited (code ${code ?? 0})\n`);
    shutdown();
  });

  return child;
});

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const c of children) {
    try { c.kill(); } catch (_) {}
  }
  process.exit();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
