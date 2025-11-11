// scripts/index.mjs
import { fixImports } from "./fix-extensions.mjs";
import { fixSharedPackage } from "./fix-shared-package.mjs";

console.log("🔧 Running post-build fixes...\n");
fixImports();
fixSharedPackage();
console.log("\n✅ All post-build fixes completed!");
