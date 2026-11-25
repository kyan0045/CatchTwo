const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

const env = { ...process.env };

if (process.platform === "linux") {
  try {
    const report = process.report.getReport();
    if (report.header?.glibcVersionRuntime) {
      const cpus = os.availableParallelism?.() ?? os.cpus().length;
      env.MALLOC_ARENA_MAX ||= cpus <= 1 ? "1" : "2";
      env.MALLOC_TRIM_THRESHOLD_ ||= "131072";
    }
  } catch {}
}

const child = spawn(
  process.execPath,
  ["--no-deprecation", "--max-old-space-size=256", "index.js"],
  {
    cwd: path.resolve(__dirname, ".."),
    env,
    stdio: "inherit",
  }
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill(signal);
    }
  });
}

child.on("error", (error) => {
  console.error(`Failed to start CatchTwo: ${error.message || error}`);
  process.exit(1);
});
child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`CatchTwo exited due to signal ${signal}`);
    const sigNum = os.constants.signals[signal];
    process.exit(sigNum ? 128 + sigNum : 1);
  }
  process.exit(code ?? 1);
});
