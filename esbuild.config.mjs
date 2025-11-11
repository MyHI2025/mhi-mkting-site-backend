import { build } from "esbuild";
import fs from "fs";
import path from "path";

/**
 * A small plugin that adds `.js` extension to local imports.
 */
const addJsExtensionPlugin = {
  name: "add-js-extension",
  setup(build) {
    build.onResolve({ filter: /^\.\// }, args => {
      let file = path.join(args.resolveDir, args.path);
      // Try .ts, .tsx, or .js
      const extensions = [".ts", ".tsx", ".js"];
      for (const ext of extensions) {
        if (fs.existsSync(file + ext)) {
          return { path: args.path + ".js" };
        }
      }
      return;
    });
  },
};

await build({
  entryPoints: ["src/index.ts"],
  outdir: "dist",
  platform: "node",
  format: "esm",
  bundle: false,
  packages: "external",
  plugins: [addJsExtensionPlugin],
  sourcemap: true,
});
