import browserSyncFactory from 'browser-sync';
import chokidar from 'chokidar';
import { context } from 'esbuild';
import { cp } from 'node:fs/promises';
import path from 'node:path';
import {
    copyStaticFiles,
    bundleDefinitions,
    sharedVendorPlugin,
    distRoot
} from './build-common.mjs';

const browserSync = browserSyncFactory.create();
const root = process.cwd();
const nodeModules = path.join(root, 'node_modules');
const userPages = path.join(root, '..', 'user', 'src', 'pages');
const todoPages = path.join(root, '..', 'todos', 'src', 'pages');
const fxPages = path.join(root, '..', 'fx-module', 'src', 'pages');

await copyStaticFiles();

const esbuildContexts = [];
for (const item of bundleDefinitions()) {
    const ctx = await context({
        entryPoints: [item.entry], bundle: true, platform: 'browser', format: 'iife',
        outfile: item.outfile, sourcemap: true, logLevel: 'info', nodePaths: [nodeModules],
        plugins: [
            sharedVendorPlugin(item.entry),
            {
                name: 'browser-reload',
                setup(build) {
                    build.onEnd((result) => {
                        if (result.errors.length === 0 && browserSync.active) browserSync.reload();
                    });
                }
            }
        ]
    });
    await ctx.watch();
    esbuildContexts.push(ctx);
}

browserSync.init({
    server: { baseDir: path.join(root, 'dist') },
    startPath: '/module-web/', port: 3000, open: false, notify: false, ui: false
});

/* Chokidar v4 no longer supports glob patterns. Watch real directories/files
   so local edits and files replaced by git pull are detected reliably. */
const copyWatch = chokidar.watch([
    path.join(root, 'src'),
    userPages,
    todoPages,
    fxPages
], {
    ignoreInitial: true,
    awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 25
    }
});

let staticRefreshQueue = Promise.resolve();

function isInside(filePath, directory) {
    const relative = path.relative(directory, filePath);
    return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

async function refreshStatic(filePath) {
    const normalized = path.resolve(filePath);

    if (normalized === path.join(root, 'src', 'module-web.css')
        || isInside(normalized, path.join(root, 'src', 'styles'))) {
        await copyStaticFiles();
    } else if (normalized === path.join(root, 'src', 'index.html')) {
        await cp(normalized, path.join(distRoot, 'index.html'));
    } else if (isInside(normalized, userPages) && normalized.endsWith('.html')) {
        await cp(normalized, path.join(distRoot, 'user', path.basename(normalized)));
    } else if (isInside(normalized, todoPages) && normalized.endsWith('.html')) {
        await cp(normalized, path.join(distRoot, 'todos', path.basename(normalized)));
    } else if (isInside(normalized, fxPages) && normalized.endsWith('.html')) {
        await cp(normalized, path.join(distRoot, 'fx', path.basename(normalized)));
    } else {
        return;
    }

    if (browserSync.active) browserSync.reload();
}

function queueStaticRefresh(filePath) {
    staticRefreshQueue = staticRefreshQueue
        .then(() => refreshStatic(filePath))
        .catch((error) => console.error('Static refresh failed:', error));
}

copyWatch.on('add', queueStaticRefresh);
copyWatch.on('change', queueStaticRefresh);

async function shutdown() {
    await copyWatch.close();
    for (const ctx of esbuildContexts) await ctx.dispose();
    browserSync.exit();
    process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
console.log('Development server: http://localhost:3000/module-web/');
console.log('Source changes rebuild/reload automatically.');
