import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { copyStaticFiles, bundleDefinitions } from './build-common.mjs';

const nodeModules = path.join(process.cwd(), 'node_modules');
const vendorEntry = path.join(process.cwd(), 'src', 'js', 'vendor.js');

function sharedVendorPlugin(entryFile) {
    const normalizedEntry = path.resolve(entryFile);

    return {
        name: 'shared-vendor-bootstrap',
        setup(buildContext) {
            buildContext.onLoad({ filter: /\.js$/ }, async (args) => {
                if (path.resolve(args.path) !== normalizedEntry) return null;

                const source = await readFile(args.path, 'utf8');
                return {
                    contents: `import ${JSON.stringify(vendorEntry)};\n${source}`,
                    loader: 'js'
                };
            });
        }
    };
}

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
        nodePaths: [nodeModules],
        plugins: [sharedVendorPlugin(item.entry)]
    });
}

console.log('Built module-web for WAR/static serving.');
