import fs from "fs";
import path from "path";

const distDir = path.resolve("dist");

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  content = content.replace(
    /((?:from\s+|import\s*\(\s*)["'])(\.{1,2}\/[^"']+)(["'])/g,
    (match, prefix, importPath, suffix) => {
      // Ignore if path already has .js, .json, etc.
      if (/\.(js|json|mjs|cjs)$/.test(importPath)) return match;

      // Compute resolved file/folder path
      const resolvedPath = path.resolve(path.dirname(filePath), importPath);
      const indexFile = `${resolvedPath}/index.js`;

      // If there's an index.js inside the folder, point to it explicitly
      if (fs.existsSync(indexFile)) {
        return `${prefix}${importPath}/index.js${suffix}`;
      }

      // Otherwise, assume it’s a direct file import
      return `${prefix}${importPath}.js${suffix}`;
    }
  );

  fs.writeFileSync(filePath, content, "utf8");
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && fullPath.endsWith(".js")) {
      fixImportsInFile(fullPath);
    }
  }
}
export function fixImports(){
  return walkDir(distDir);
}
console.log("✅ Fixed all import statements (.js + index.js) in dist/");
