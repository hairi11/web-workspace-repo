import browserSyncFactory from 'browser-sync';
import chokidar from 'chokidar';
import { context } from 'esbuild';
import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import {
    copyStaticFiles,
    bundleDefinitions,
    sharedVendorPlugin,
    renderModulePage,
    renderModulePages,
    distRoot
} from './build-common.mjs';

const browserSync = browserSyncFactory.create();
const nodeModules = path.join(process.cwd(), 'node_modules');

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
    server: { baseDir: path.join(process.cwd(), 'dist') },
    startPath: '/module-web/', port: 3000, open: false, notify: false, ui: false
});

const copyWatch = chokidar.watch([
    path.join(process.cwd(), 'src', '**/*'),
    path.join(process.cwd(), '..', 'user', 'src', 'pages', '**/*.html'),
    path.join(process.cwd(), '..', 'todos', 'src', 'pages', '**/*.html')
], { ignoreInitial: true });

async function refreshStatic(filePath) {
    if (filePath.endsWith('module-web.css')) {
        await cp(filePath, path.join(distRoot, 'assets', 'module-web.css'));
    } else if (filePath.includes(path.join('src', 'styles'))) {
        const relativeStyle = path.relative(path.join(process.cwd(), 'src', 'styles'), filePath);
        const target = path.join(distRoot, 'assets', 'styles', relativeStyle);
        await mkdir(path.dirname(target), { recursive: true });
        await cp(filePath, target);
    } else if (filePath.endsWith('index.html')) {
        await cp(filePath, path.join(distRoot, 'index.html'));
    } else if (filePath.includes(path.join('src', 'templates'))) {
        await renderModulePages();
    } else if (filePath.includes(path.join('user', 'src', 'pages'))) {
        await renderModulePage('user', path.basename(filePath, '.html'));
    } else if (filePath.includes(path.join('todos', 'src', 'pages'))) {
        await renderModulePage('todos', path.basename(filePath, '.html'));
    } else {
        return;
    }
    browserSync.reload();
}

copyWatch.on('add', refreshStatic);
copyWatch.on('change', refreshStatic);

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
