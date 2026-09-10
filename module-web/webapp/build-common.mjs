import { mkdir, cp } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const distRoot = path.join(root, 'dist', 'module-web');

export async function copyStaticFiles() {
    await mkdir(path.join(distRoot, 'assets'), { recursive: true });
    await mkdir(path.join(distRoot, 'assets', 'styles'), { recursive: true });
    await mkdir(path.join(distRoot, 'webfonts'), { recursive: true });
    await mkdir(path.join(distRoot, 'user'), { recursive: true });
    await mkdir(path.join(distRoot, 'todos'), { recursive: true });

    await cp(
        path.join(root, 'src', 'index.html'),
        path.join(distRoot, 'index.html')
    );

    await cp(
        path.join(root, 'src', 'module-web.css'),
        path.join(distRoot, 'assets', 'module-web.css')
    );

    await cp(
        path.join(root, 'src', 'styles'),
        path.join(distRoot, 'assets', 'styles'),
        { recursive: true }
    );

    await cp(
        path.join(root, 'node_modules', 'bootstrap', 'dist', 'css', 'bootstrap.min.css'),
        path.join(distRoot, 'assets', 'bootstrap.min.css')
    );

    await cp(
        path.join(root, 'node_modules', 'datatables.net-bs5', 'css', 'dataTables.bootstrap5.min.css'),
        path.join(distRoot, 'assets', 'dataTables.bootstrap5.min.css')
    );

    await cp(
        path.join(root, 'node_modules', 'datatables.net-select-bs5', 'css', 'select.bootstrap5.min.css'),
        path.join(distRoot, 'assets', 'select.bootstrap5.min.css')
    );

    await cp(
        path.join(root, 'node_modules', '@fortawesome', 'fontawesome-free', 'css', 'all.min.css'),
        path.join(distRoot, 'assets', 'fontawesome.min.css')
    );

    await cp(
        path.join(root, 'node_modules', '@fortawesome', 'fontawesome-free', 'webfonts'),
        path.join(distRoot, 'webfonts'),
        { recursive: true }
    );

    await cp(
        path.join(root, 'node_modules', 'select2', 'dist', 'css', 'select2.min.css'),
        path.join(distRoot, 'assets', 'select2.min.css')
    );

    await cp(
        path.join(root, '..', 'user', 'src', 'pages'),
        path.join(distRoot, 'user'),
        { recursive: true }
    );

    await cp(
        path.join(root, '..', 'todos', 'src', 'pages'),
        path.join(distRoot, 'todos'),
        { recursive: true }
    );
}

export function bundleDefinitions() {
    return [
        {
            name: 'user',
            entry: path.join(root, '..', 'user', 'src', 'UserPage.js'),
            outfile: path.join(distRoot, 'user', 'user.js')
        },
        {
            name: 'todos',
            entry: path.join(root, '..', 'todos', 'src', 'TodoPage.js'),
            outfile: path.join(distRoot, 'todos', 'todos.js')
        }
    ];
}

export { distRoot };
