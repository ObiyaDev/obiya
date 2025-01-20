import { StepConfig } from "../types";
import path from 'path';
import * as tsconfigPaths from 'tsconfig-paths';

const tsConfigPath = path.resolve(process.cwd(), 'tsconfig.json');
const result = tsconfigPaths.loadConfig(tsConfigPath);

if (result.resultType !== 'success') {
  throw Error('Failed to load tsconfig.json');
}

const {absoluteBaseUrl, paths} = result;

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs', baseUrl: absoluteBaseUrl, paths },
})

export const getNodeFileConfig = async (filePath: string): Promise<StepConfig> => {
  try {
    const resolvedFilePath = require.resolve(filePath);
    const module = require(resolvedFilePath);

    return module.config;
  } catch (error) {
    console.error(`Failed to extract config from ${filePath}:`, error);

    throw new Error(`No config found in step ${filePath}`)
  }
}
