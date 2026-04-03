import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');

/**
 * Collect declaration files recursively.
 * @param {string} dir
 * @returns {string[]}
 */
function collectDeclarationFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectDeclarationFiles(entryPath));
      continue;
    }
    if (entry.name.endsWith('.d.ts') || entry.name.endsWith('.d.cts')) {
      files.push(entryPath);
    }
  }

  return files;
}

/**
 * Rewrite a relative declaration import to a Node16-compatible ESM specifier.
 * @param {string} currentFile
 * @param {string} specifier
 * @returns {string}
 */
function rewriteSpecifier(currentFile, specifier) {
  if (!specifier.startsWith('./') && !specifier.startsWith('../')) {
    return specifier;
  }

  if (specifier.endsWith('.js') || specifier.endsWith('.mjs') || specifier.endsWith('.cjs')) {
    return specifier;
  }

  const basePath = path.resolve(path.dirname(currentFile), specifier);

  if (fs.existsSync(`${basePath}.d.ts`) || fs.existsSync(`${basePath}.d.cts`)) {
    return `${specifier}.js`;
  }

  if (fs.existsSync(basePath) && fs.statSync(basePath).isDirectory()) {
    if (
      fs.existsSync(path.join(basePath, 'index.d.ts')) ||
      fs.existsSync(path.join(basePath, 'index.d.cts'))
    ) {
      return `${specifier.replace(/\/$/, '')}/index.js`;
    }
  }

  return specifier;
}

/**
 * Rewrite all relative import/export specifiers in a declaration file.
 * @param {string} filePath
 */
function rewriteDeclarationFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const replaced = source.replace(
    /((?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?["'])(\.{1,2}\/[^"']+)(["'])/g,
    (full, prefix, specifier, suffix) => {
      const next = rewriteSpecifier(filePath, specifier);
      if (next !== specifier) {
        changed = true;
      }
      return `${prefix}${next}${suffix}`;
    },
  );

  if (changed) {
    fs.writeFileSync(filePath, replaced, 'utf8');
  }
}

for (const file of collectDeclarationFiles(distDir)) {
  rewriteDeclarationFile(file);
}
