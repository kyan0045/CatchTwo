const fs = require("fs");
const path = require("path");

function loadConfig(filePath) {
  const resolved = path.resolve(filePath);
  delete require.cache[resolved];
  return require(resolved);
}

function getMissingPaths(source, target, prefix = "") {
  const paths = [];

  for (const key of Object.keys(source)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;

    if (!(key in target)) {
      paths.push(fullPath);
      continue;
    }

    if (
      typeof source[key] === "object" &&
      source[key] !== null &&
      !Array.isArray(source[key]) &&
      typeof target[key] === "object" &&
      target[key] !== null &&
      !Array.isArray(target[key])
    ) {
      paths.push(...getMissingPaths(source[key], target[key], fullPath));
    }
  }

  return paths;
}

function extractTopLevelBlock(text, key) {
  const patterns = [
    new RegExp(`(\\n  \\/\\/[^\\n]*\\n  ${key}: \\{[\\s\\S]*?\\n  \\},)`, "m"),
    new RegExp(`(\\n  ${key}: \\{[\\s\\S]*?\\n  \\},)`, "m"),
    new RegExp(`(\\n  \\/\\/[^\\n]*\\n  ${key}: [^,\\n]+)`, "m"),
    new RegExp(`(\\n  ${key}: [^,\\n]+)`, "m"),
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }

  return null;
}

function extractSectionBody(text, sectionKey) {
  const match = text.match(
    new RegExp(`  ${sectionKey}: \\{([\\s\\S]*?)\\n  \\},`, "m")
  );
  return match ? match[1] : null;
}

function extractNestedProperty(sectionBody, propKey) {
  const match = sectionBody.match(new RegExp(`\\n    ${propKey}: [^\\n]+`));
  return match ? match[0] : null;
}

function findLineCommentIndex(line) {
  let quote = null;
  let escaped = false;

  for (let index = 0; index < line.length - 1; index++) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (quote && char === "\\") {
      escaped = true;
      continue;
    }

    if (quote) {
      if (char === quote) quote = null;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "/" && nextChar === "/") {
      return index;
    }
  }

  return -1;
}

function insertTopLevelBlock(userText, block) {
  if (userText.includes(block.trim())) return userText;

  const debugAnchor = userText.match(/\n {2}\/\/ Debug mode/);
  if (debugAnchor) {
    return userText.replace(
      /\n {2}\/\/ Debug mode/,
      `${block}\n  // Debug mode`
    );
  }

  return userText.replace(
    /\n};(?=\s*(?:\/\/ Export|module\.exports))/,
    `${block}\n};`
  );
}

function addCommaToLastProperty(body) {
  const lines = body.split("\n");

  for (let index = lines.length - 1; index >= 0; index--) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("//") || trimmed.endsWith("{")) {
      continue;
    }

    const commentIndex = findLineCommentIndex(line);
    const value = (
      commentIndex === -1 ? line : line.slice(0, commentIndex)
    ).trimEnd();

    if (value.endsWith(",")) {
      return body;
    }

    if (commentIndex === -1) {
      lines[index] = `${line},`;
    } else {
      const comment = line.slice(commentIndex);
      lines[index] = `${value}, ${comment}`;
    }

    return lines.join("\n");
  }

  return body;
}

function insertNestedProperty(userText, sectionKey, propLine) {
  if (userText.includes(propLine.trim())) return userText;

  const pattern = new RegExp(
    `(  ${sectionKey}: \\{[\\s\\S]*?)(\\n  \\},)`,
    "m"
  );
  return userText.replace(pattern, (match, body, closing) => {
    return `${addCommaToLastProperty(body)}${propLine}${closing}`;
  });
}

function mergeConfigFiles(upstreamPath, userPath) {
  const upstream = loadConfig(upstreamPath);
  const user = loadConfig(userPath);
  const missingPaths = getMissingPaths(upstream, user);

  if (missingPaths.length === 0) return false;

  let userText = fs.readFileSync(userPath, "utf8");
  const upstreamText = fs.readFileSync(upstreamPath, "utf8");

  for (const fullPath of missingPaths) {
    const parts = fullPath.split(".");

    if (parts.length === 1) {
      const block = extractTopLevelBlock(upstreamText, parts[0]);
      if (block) userText = insertTopLevelBlock(userText, block);
      continue;
    }

    const sectionKey = parts[0];
    const propKey = parts[parts.length - 1];
    const sectionBody = extractSectionBody(upstreamText, sectionKey);

    if (!sectionBody) continue;

    const propLine = extractNestedProperty(sectionBody, propKey);
    if (propLine)
      userText = insertNestedProperty(userText, sectionKey, propLine);
  }

  const resolvedUserPath = path.resolve(userPath);
  const temporaryPath = path.join(
    path.dirname(resolvedUserPath),
    `.${path.basename(resolvedUserPath)}.${process.pid}.tmp.js`
  );
  const backupPath = `${resolvedUserPath}.${process.pid}.merge-backup`;

  try {
    fs.writeFileSync(temporaryPath, userText, { encoding: "utf8", flag: "wx" });
    const merged = loadConfig(temporaryPath);
    const stillMissing = getMissingPaths(upstream, merged);
    if (stillMissing.length > 0) {
      throw new Error(
        `Could not merge configuration values: ${stillMissing.join(", ")}`
      );
    }
    fs.renameSync(resolvedUserPath, backupPath);
    fs.renameSync(temporaryPath, resolvedUserPath);
    fs.rmSync(backupPath, { force: true });
  } catch (error) {
    fs.rmSync(temporaryPath, { force: true });
    if (fs.existsSync(backupPath) && !fs.existsSync(resolvedUserPath)) {
      fs.renameSync(backupPath, resolvedUserPath);
    }
    throw error;
  }

  return true;
}

if (require.main === module) {
  const upstreamPath = process.argv[2];
  const userPath = process.argv[3];

  if (!upstreamPath || !userPath) {
    console.error("Usage: node mergeConfig.js <upstream-config> <user-config>");
    process.exit(1);
  }

  if (!fs.existsSync(upstreamPath) || !fs.existsSync(userPath)) {
    console.error("Both upstream and user configuration files must exist.");
    process.exit(1);
  }

  try {
    mergeConfigFiles(upstreamPath, userPath);
  } catch (error) {
    console.error(`Configuration merge failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { getMissingPaths, mergeConfigFiles };
