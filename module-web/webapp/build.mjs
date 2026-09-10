import { build } from 'esbuild';
import { copyStaticFiles, bundleDefinitions } from './build-common.mjs';

await copyStaticFiles();

for (const item of bundleDefinitions()) {
    await build({
        entryPoints: [item.entry],
        bundle: true,
        platform: 'browser',
        format: 'iife',
        outfile: item.outfile,
        sourcemap: true,
        logLevel: 'info'
    });
}

console.log('Built module-web for WAR/static serving.');
