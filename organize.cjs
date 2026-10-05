const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getAllFiles(dir, ext) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFiles(file, ext));
        } else if (file.endsWith(ext) || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const allFiles = getAllFiles(srcDir, '.ts');

// Read all files and extract imports
const importsMap = {}; // importer -> array of imported absolute paths
const importedByMap = {}; // imported -> array of importer absolute paths

allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const regex = /from\s+['"](\.[^'"]+)['"]/g;
    let match;
    importsMap[file] = [];
    while ((match = regex.exec(content)) !== null) {
        let importPath = match[1];
        let resolved = path.resolve(path.dirname(file), importPath);
        
        let targetFile = null;
        if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
            targetFile = resolved;
        } else if (fs.existsSync(resolved + '.tsx')) {
            targetFile = resolved + '.tsx';
        } else if (fs.existsSync(resolved + '.ts')) {
            targetFile = resolved + '.ts';
        } else if (fs.existsSync(path.join(resolved, 'index.tsx'))) {
            targetFile = path.join(resolved, 'index.tsx');
        } else if (fs.existsSync(path.join(resolved, 'index.ts'))) {
            targetFile = path.join(resolved, 'index.ts');
        }

        if (targetFile) {
            importsMap[file].push(targetFile);
            if (!importedByMap[targetFile]) importedByMap[targetFile] = [];
            if (!importedByMap[targetFile].includes(file)) {
                importedByMap[targetFile].push(file);
            }
        }
    }
});

// Identify which page(s) each file belongs to
const fileUsage = {}; // file -> Set of pages

function getPagesUsing(file, visited = new Set()) {
    if (visited.has(file)) return new Set();
    visited.add(file);

    let pages = new Set();
    if (file.includes(path.join(srcDir, 'pages'))) {
        pages.add(path.basename(file, path.extname(file)));
        return pages;
    }
    if (file === path.join(srcDir, 'App.tsx') || file === path.join(srcDir, 'main.tsx')) {
        pages.add('global');
        return pages;
    }

    const importers = importedByMap[file] || [];
    for (const importer of importers) {
        const importerPages = getPagesUsing(importer, new Set(visited));
        for (const p of importerPages) {
            pages.add(p);
        }
    }
    return pages;
}

const fileDestinations = {};
const componentsDir = path.join(srcDir, 'components');
const controlDir = path.join(srcDir, 'control');

[componentsDir, controlDir].forEach(dir => {
    const files = getAllFiles(dir, '.ts');
    files.forEach(file => {
        const pages = getPagesUsing(file);
        let category = 'global';
        if (pages.size === 1 && !pages.has('global')) {
            category = Array.from(pages)[0];
        }
        
        const baseDir = file.startsWith(componentsDir) ? componentsDir : controlDir;
        const targetDir = path.join(baseDir, category);
        const targetFile = path.join(targetDir, path.basename(file));
        
        fileDestinations[file] = {
            targetDir,
            targetFile
        };
    });
});

// Move files
for (const [file, dest] of Object.entries(fileDestinations)) {
    if (!fs.existsSync(dest.targetDir)) {
        fs.mkdirSync(dest.targetDir, { recursive: true });
    }
    fs.renameSync(file, dest.targetFile);
    console.log(`Moved ${path.basename(file)} to ${dest.targetDir.replace(__dirname, '')}`);
}

// Update imports
function getRelativeImportPath(fromFile, toFile) {
    let rel = path.relative(path.dirname(fromFile), toFile);
    if (!rel.startsWith('.')) {
        rel = './' + rel;
    }
    rel = rel.replace(/\\/g, '/');
    // Remove extension
    rel = rel.replace(/\.tsx?$/, '');
    return rel;
}

// Re-read all files because their locations might have changed
const movedFilesMap = new Map(); // oldPath -> newPath
for (const [oldPath, dest] of Object.entries(fileDestinations)) {
    movedFilesMap.set(oldPath, dest.targetFile);
}

// Any file might need its imports updated, whether it was moved or not.
const currentFilePaths = allFiles.map(f => movedFilesMap.get(f) || f);

currentFilePaths.forEach(currentPath => {
    let content = fs.readFileSync(currentPath, 'utf8');
    let changed = false;

    // Find the original path of this file to resolve relative imports from its old context
    let originalPath = currentPath;
    for (const [oldP, newP] of movedFilesMap.entries()) {
        if (newP === currentPath) {
            originalPath = oldP;
            break;
        }
    }

    const regex = /(from\s+['"])(\.[^'"]+)(['"])/g;
    let newContent = content.replace(regex, (match, p1, p2, p3) => {
        let resolved = path.resolve(path.dirname(originalPath), p2);
        
        let targetFile = null;
        if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
            targetFile = resolved; // This won't work well if it was already moved, we need to check if the old resolved path maps to something
        }
        // Let's manually reconstruct the target file based on the original structure
        const extensions = ['', '.tsx', '.ts', '/index.tsx', '/index.ts'];
        for (const ext of extensions) {
            let possibleOldPath = resolved + ext;
            if (movedFilesMap.has(possibleOldPath)) {
                targetFile = movedFilesMap.get(possibleOldPath);
                break;
            } else if (allFiles.includes(possibleOldPath)) {
                targetFile = possibleOldPath; // Unmoved file
                break;
            }
        }

        if (targetFile) {
            const newImportPath = getRelativeImportPath(currentPath, targetFile);
            changed = true;
            return `${p1}${newImportPath}${p3}`;
        }
        return match; // If not found, leave as is
    });

    if (changed) {
        fs.writeFileSync(currentPath, newContent, 'utf8');
    }
});

console.log("Done updating imports.");
