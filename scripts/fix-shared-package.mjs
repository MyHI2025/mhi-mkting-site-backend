import fs from "fs";
import path from "path";

const sharedPath = path.resolve(
  "./node_modules/@myhi2025/shared/dist/esm/index.js"
);

export function fixSharedPackage() {
  if (!fs.existsSync(sharedPath)) {
    console.warn("⚠️ Shared package index.js not found, skipping...");
    return;
  }

  let content = fs.readFileSync(sharedPath, "utf8");

  // Replace any import missing .js (like './schema' → './schema.js')
  content = content.replace(
    /(from\s+['"])(\.\/[^'"]+)(['"])/g,
    (m, before, file, after) =>
      file.endsWith(".js") ? m : `${before}${file}.js${after}`
  );

  fs.writeFileSync(sharedPath, content);
  console.log("✅ Fixed imports in @myhi2025/shared/dist/esm/index.js");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  fixSharedPackage();
}
