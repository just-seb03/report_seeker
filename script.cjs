const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getAllFiles(dir, ext) {
    let results = [];
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

const files = getAllFiles(srcDir, '.ts');
const importMap = {};

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const regex = /from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        let importPath = match[1];
        if (importPath.startsWith('.')) {
            let resolved = path.resolve(path.dirname(file), importPath);
            // Handle extensionless imports
            if (!fs.existsSync(resolved)) {
                if (fs.existsSync(resolved + '.tsx')) resolved += '.tsx';
                else if (fs.existsSync(resolved + '.ts')) resolved += '.ts';
            }
            if (!importMap[resolved]) importMap[resolved] = [];
            importMap[resolved].push(file);
        }
    }
});

console.log(JSON.stringify(importMap, null, 2));
