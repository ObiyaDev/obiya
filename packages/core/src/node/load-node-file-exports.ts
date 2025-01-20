import path from "path";
import { build } from "esbuild";
import vm from "vm";
import esbuildPluginTsc from 'esbuild-plugin-tsc';

export const loadNodeFileExports = async <T>(filePath: string): Promise<T> => {
  try {
    // Step 1: Resolve the absolute path of the file
    const absPath = path.resolve(filePath);

    // Step 2: Use esbuild to bundle the file and its dependencies
    const result = await build({
      entryPoints: [absPath],
      bundle: true,
      platform: "node",
      format: "cjs",
      target: ["es2020"],
      write: false, // Keep output in memory
      external: ["@motiadev/core"], // Add external dependencies to exclude if needed
      loader: { '.ts': 'ts' }, // Add this line to handle TypeScript files
      plugins: [esbuildPluginTsc()],
    });

    const bundledCode = result.outputFiles[0].text;

    // Step 3: Create a sandboxed environment
    const sandbox: Record<string, any> = {};
    const moduleExports: Record<string, any> = {};
    sandbox.process = process;
    sandbox.global = global;
    sandbox.require = require;
  
    for (const moduleName of require('module').builtinModules) {
      sandbox[moduleName] = require(moduleName);
    }

    sandbox.exports = moduleExports;
    sandbox.module = { exports: moduleExports };

    // Step 4: Execute the bundled code in the sandbox
    
    const script = new vm.Script(bundledCode);
    const context = vm.createContext(sandbox);
    script.runInContext(context);

    return sandbox as T;
  } catch (error) {
    console.error(`Failed to build node file in path ${filePath}:`, error);

    throw new Error(`Failed to build node file in path ${filePath}`)
  }
}
