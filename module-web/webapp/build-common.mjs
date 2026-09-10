import { mkdir, cp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const distRoot = path.join(root, 'dist', 'module-web');
const vendorEntry = path.join(root, 'src', 'js', 'vendor.js');
const templateFile = path.join(root, 'src', 'templates', 'base.html');

const pageConfig = {
    user: {
        script: 'user.js',
        source: path.join(root, '..', 'user', 'src', 'pages'),
        nav: [
            ['../index.html', 'Modules'],
            ['./enquiry.html', 'User Enquiry'],
            ['./create.html', 'Create User'],
            ['../todos/enquiry.html', 'Todos']
        ],
        pages: {
            enquiry: { title: 'User Enquiry' },
            create: { title: 'Create User' },
            update: { title: 'Update User' },
            view: { title: 'View User' }
        }
    },
    todos: {
        script: 'todos.js',
        source: path.join(root, '..', 'todos', 'src', 'pages'),
        nav: [
            ['../index.html', 'Modules'],
            ['./enquiry.html', 'Todo Enquiry'],
            ['./create.html', 'Create Todo'],
            ['../user/enquiry.html', 'Users']
        ],
        pages: {
            enquiry: { title: 'Todo Enquiry' },
            create: { title: 'Create Todo', extraStyles: '<link rel="stylesheet" href="../assets/select2.min.css">' },
            update: { title: 'Update Todo', extraStyles: '<link rel="stylesheet" href="../assets/select2.min.css">' },
            view: { title: 'View Todo' }
        }
    }
};

function renderTemplate(template, values) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] || '');
}

function renderNav(items) {
    return items.map(([href, text]) => `        <a class="button" href="${href}">${text}</a>`).join('\n') + '\n';
}

export async function renderModulePage(moduleName, pageName) {
    const module = pageConfig[moduleName];
    const page = module && module.pages[pageName];
    if (!module || !page) return;

    const [template, content] = await Promise.all([
        readFile(templateFile, 'utf8'),
        readFile(path.join(module.source, pageName + '.html'), 'utf8')
    ]);

    await mkdir(path.join(distRoot, moduleName), { recursive: true });
    await writeFile(path.join(distRoot, moduleName, pageName + '.html'), renderTemplate(template, {
        title: page.title,
        page: pageName,
        nav: renderNav(module.nav),
        content: content.trim(),
        script: module.script,
        extraStyles: page.extraStyles ? '    ' + page.extraStyles + '\n' : ''
    }));
}

export async function renderModulePages() {
    for (const [moduleName, module] of Object.entries(pageConfig)) {
        for (const pageName of Object.keys(module.pages)) {
            await renderModulePage(moduleName, pageName);
        }
    }
}

export async function copyStaticFiles() {
    await mkdir(path.join(distRoot, 'assets'), { recursive: true });
    await mkdir(path.join(distRoot, 'assets', 'styles'), { recursive: true });
    await mkdir(path.join(distRoot, 'webfonts'), { recursive: true });
    await mkdir(path.join(distRoot, 'user'), { recursive: true });
    await mkdir(path.join(distRoot, 'todos'), { recursive: true });

    await cp(path.join(root, 'src', 'index.html'), path.join(distRoot, 'index.html'));
    await cp(path.join(root, 'src', 'module-web.css'), path.join(distRoot, 'assets', 'module-web.css'));
    await cp(path.join(root, 'src', 'styles'), path.join(distRoot, 'assets', 'styles'), { recursive: true });
    await cp(path.join(root, 'node_modules', 'bootstrap', 'dist', 'css', 'bootstrap.min.css'), path.join(distRoot, 'assets', 'bootstrap.min.css'));
    await cp(path.join(root, 'node_modules', 'datatables.net-bs5', 'css', 'dataTables.bootstrap5.min.css'), path.join(distRoot, 'assets', 'dataTables.bootstrap5.min.css'));
    await cp(path.join(root, 'node_modules', 'datatables.net-select-bs5', 'css', 'select.bootstrap5.min.css'), path.join(distRoot, 'assets', 'select.bootstrap5.min.css'));
    await cp(path.join(root, 'node_modules', '@fortawesome', 'fontawesome-free', 'css', 'all.min.css'), path.join(distRoot, 'assets', 'fontawesome.min.css'));
    await cp(path.join(root, 'node_modules', '@fortawesome', 'fontawesome-free', 'webfonts'), path.join(distRoot, 'webfonts'), { recursive: true });
    await cp(path.join(root, 'node_modules', 'select2', 'dist', 'css', 'select2.min.css'), path.join(distRoot, 'assets', 'select2.min.css'));

    await renderModulePages();
}

export function bundleDefinitions() {
    return [
        { name: 'user', entry: path.join(root, '..', 'user', 'src', 'UserPage.js'), outfile: path.join(distRoot, 'user', 'user.js') },
        { name: 'todos', entry: path.join(root, '..', 'todos', 'src', 'TodoPage.js'), outfile: path.join(distRoot, 'todos', 'todos.js') }
    ];
}

export function sharedVendorPlugin(entryFile) {
    const normalizedEntry = path.resolve(entryFile);
    return {
        name: 'shared-vendor-bootstrap',
        setup(buildContext) {
            buildContext.onLoad({ filter: /\.js$/ }, async (args) => {
                if (path.resolve(args.path) !== normalizedEntry) return null;
                const source = await readFile(args.path, 'utf8');
                return { contents: `import ${JSON.stringify(vendorEntry)};\n${source}`, loader: 'js' };
            });
        }
    };
}

export { distRoot };
