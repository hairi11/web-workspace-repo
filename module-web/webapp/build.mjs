import { build } from 'esbuild';
import path from 'node:path';
import { copyStaticFiles, bundleDefinitions } from './build-common.mjs';

const nodeModules = path.join(process.cwd(), 'node_modules');

await copyStaticFiles();

for (const item of bundleDefinitions()) {
    await build({
        entryPoints: [item.entry],
        bundle: true,
        platform: 'browser',
        format: 'iife',
        outfile: item.outfile,
        sourcemap: true,
        logLevel: 'info',
        nodePaths: [nodeModules]
    });
}

console.log('Built module-web for WAR/static serving.');
