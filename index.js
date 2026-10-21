const {
  createCatchers,
  readTokens,
} = require("./src/services/createCatchers.js");
const { sendLog, sendWebhook } = require("./src/services/logging.js");
const { logMemoryUsage } = require("./src/services/system.js");
const { assertValidConfig } = require("./src/services/validateConfig.js");

const chalk = require("chalk");

const pkg = require("./package.json");

// Invalid configuration is fatal and gets its own exit code so a launcher can stop instead of restarting in a loop
const CONFIG_EXIT_CODE = 2;

function loadConfig() {
  try {
    return require("./config.js");
  } catch (error) {
    console.error(
      `[CONFIG] Failed to load config.js: ${error.message || error}`
    );
    process.exit(CONFIG_EXIT_CODE);
  }
}

const config = loadConfig();

async function main() {
  // Clear before validating so config warnings are actually visible
  console.clear();

  try {
    assertValidConfig(config);
    readTokens();
  } catch (error) {
    console.error(`[CONFIG] ${error.message || error}`);
    process.exit(CONFIG_EXIT_CODE);
  }

  const figlet = require("figlet");
  const gradient = await import("gradient-string").then(
    ({ default: gradient }) => gradient
  );

  figlet.text(
    "CatchTwo",
    {
      font: "Standard",
      horizontalLayout: "fitted",
      verticalLayout: "default",
    },
    (err, data) => {
      if (err) return console.log(err);
      console.log(gradient.atlas.multiline(data));
      console.log("");
    }
  );

  await new Promise((r) => setTimeout(r, 400));

  const version = pkg.version;
  const startTime = Date.now();
  const mem = process.memoryUsage();

  const separator = chalk.hex("#4a4a4a")("═".repeat(68));

  console.log(separator);

  console.log(chalk.gray("   v") + chalk.bold.cyan(version));

  console.log(separator);
  console.log("");

  console.log(chalk.bold.hex("#00d4ff")("▶ SYSTEM"));
  console.log(
    chalk.gray("   Node      ") +
      chalk.white(process.version.padEnd(12)) +
      chalk.gray("   PID       ") +
      chalk.white(process.pid)
  );
  console.log(
    chalk.gray("   Platform  ") +
      chalk.white(process.platform.toUpperCase().padEnd(12)) +
      chalk.gray("   Env       ") +
      chalk.white((process.env.NODE_ENV || "development").toUpperCase())
  );

  console.log("");

  console.log(chalk.bold.hex("#00d4ff")("▶ STATUS"));
  console.log(
    chalk.green("   ✓") + chalk.white(" Application initialized successfully")
  );

  console.log(
    chalk.green("   ✓") +
      chalk.white(" Heap Used: ") +
      chalk.yellow((mem.heapUsed / 1024 / 1024).toFixed(1)) +
      chalk.gray(" MB")
  );

  const startupTime = Date.now() - startTime;

  console.log(
    chalk.bold.green("   ✓ Ready") + chalk.gray(` in ${startupTime}ms`)
  );

  console.log("");
  console.log(separator);

  console.log(
    chalk.gray("   Made with") +
      chalk.red(" ❤️ ") +
      chalk.gray("by ") +
      chalk.bold.magenta("@kyan0045") +
      chalk.gray(" • kyanbosman.com")
  );
  console.log("");

  sendWebhook(null, {
    title: "Welcome to CatchTwo!",
    description:
      "If you need any help, please join our [Discord](https://discord.gg/RtnQavFVRq).",
    color: "#fecd06",
    url: "https://github.com/kyan0045/CatchTwo",
    footer: {
      text: "CatchTwo by @kyan0045, version " + version,
      icon_url:
        "https://res.cloudinary.com/dppthk8lt/image/upload/ar_1.0,c_lpad/v1719331169/catchtwo_bjvlqi.png",
    },
    thumbnail: {
      url: "https://res.cloudinary.com/dppthk8lt/image/upload/c_scale,h_50,w_64/v1719331169/catchtwo_bjvlqi.png",
    },
  });
  // Delayed execution to create catchers and log memory usage
  setTimeout(() => {
    createCatchers().catch((error) => {
      console.error(
        `[FATAL] Failed to create catchers: ${error.message || error}`
      );
      process.exit(1);
    });
    logMemoryUsage();
  }, 500);
}
process.on("unhandledRejection", (reason) => {
  const ignoreErrors = [
    "MESSAGE_ID_NOT_FOUND",
    "INTERACTION_TIMEOUT",
    "BUTTON_NOT_FOUND",
  ];
  if (ignoreErrors.includes(reason?.code || reason?.message)) return;
  const detail = reason?.stack || reason?.message || String(reason);
  sendLog(undefined, `Unhandled Rejection: ${detail}`, "error");
});

process.on("uncaughtException", (error) => {
  const detail = error?.stack || error?.message || String(error);
  sendLog(undefined, `Uncaught Exception: ${detail}`, "error");
});

main().catch((error) => {
  const detail = error?.stack || error?.message || String(error);
  console.error(chalk.bold.red("[FATAL] ") + detail);
  process.exit(1);
});
