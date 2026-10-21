const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const force = process.argv.includes("--force");

function git(args, capture = false) {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = capture ? result.stderr.trim() : "";
    throw new Error(
      `git ${args.join(" ")} failed${detail ? `: ${detail}` : ""}`
    );
  }

  return capture ? result.stdout.trim() : "";
}

function saveFile(name, directory) {
  const source = path.join(repoRoot, name);
  if (!fs.existsSync(source)) return null;

  const target = path.join(directory, name);
  fs.copyFileSync(source, target);
  fs.chmodSync(target, 0o600);
  return target;
}

function restoreFile(name, savedPath) {
  if (!savedPath) return;

  const target = path.join(repoRoot, name);
  fs.copyFileSync(savedPath, target);
  fs.chmodSync(target, 0o600);
}

function restoreTrackedFile(name) {
  try {
    git(["restore", "--source=HEAD", "--staged", "--worktree", "--", name]);
  } catch {
    // The file may be untracked; the update itself can still proceed.
  }
}

function runNode(script, args) {
  return spawnSync(process.execPath, [path.join(repoRoot, script), ...args], {
    cwd: repoRoot,
    stdio: "inherit",
  });
}

function main() {
  const branch = git(["rev-parse", "--abbrev-ref", "HEAD"], true);
  if (!branch || branch === "HEAD") {
    throw new Error(
      "Cannot update a detached HEAD. Check out main or dev first."
    );
  }

  const tempDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "catchtwo-update-")
  );
  fs.chmodSync(tempDirectory, 0o700);

  const configBackup = saveFile("config.js", tempDirectory);
  const tokensBackup = saveFile("tokens.txt", tempDirectory);

  try {
    console.log(`[update] Branch: ${branch}`);
    console.log("[update] Saving local config and tokens");

    restoreTrackedFile("config.js");
    restoreTrackedFile("tokens.txt");

    console.log("[update] Fetching origin");
    git(["fetch", "origin"]);

    if (force) {
      console.log(`[update] Resetting ${branch} to origin/${branch}`);
      git(["reset", "--hard", `origin/${branch}`]);
    } else {
      console.log(`[update] Updating ${branch}`);
      git(["pull", "--ff-only", "origin", branch]);
    }

    const upstreamConfig = path.join(tempDirectory, "config.upstream.js");
    const currentConfig = path.join(repoRoot, "config.js");
    if (fs.existsSync(currentConfig)) {
      fs.copyFileSync(currentConfig, upstreamConfig);
      fs.chmodSync(upstreamConfig, 0o600);
    }

    console.log("[update] Restoring local config and tokens");
    restoreFile("config.js", configBackup);
    restoreFile("tokens.txt", tokensBackup);

    if (fs.existsSync(upstreamConfig) && fs.existsSync(currentConfig)) {
      console.log("[update] Merging new config defaults");
      const merge = runNode("scripts/mergeConfig.js", [
        upstreamConfig,
        currentConfig,
      ]);
      if (merge.status !== 0) {
        throw new Error(
          "Config merge failed; local config was left unchanged."
        );
      }
    }

    console.log("[update] Installing dependencies");
    const npm = process.platform === "win32" ? "npm.cmd" : "npm";
    const install = spawnSync(npm, ["install"], {
      cwd: repoRoot,
      stdio: "inherit",
    });
    if (install.status !== 0) throw new Error("npm install failed.");

    console.log("[update] Done.");
  } catch (error) {
    restoreFile("config.js", configBackup);
    restoreFile("tokens.txt", tokensBackup);
    throw error;
  } finally {
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  }
}

try {
  main();
} catch (error) {
  console.error(`[update] ${error.message || error}`);
  process.exitCode = 1;
}
