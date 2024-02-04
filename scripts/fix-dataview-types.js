const fs = require('fs');
const path = require('path');
const glob = require('glob');

function updateImports(filePath, basePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    const updatedLines = lines.map((line) => {
        const importRegex = /from ['"]([^'"]+)['"];$/;
        const match = line.match(importRegex);

        if (match) {
            let importPath = match[1];
            // Проверяем, не начинается ли путь импорта с . или /
            if (!importPath.startsWith('.') && !importPath.startsWith('/')) {

                let resolvedImportPath = path.join(basePath, importPath);
                let extension = ''

                if (fs.existsSync(resolvedImportPath + '.ts')) {
                    extension = '.ts'
                } else if (fs.existsSync(resolvedImportPath + '.d.ts')) {
                    extension = '.d.ts';
                } else if (fs.existsSync(resolvedImportPath + '/index.ts')) {
                    extension = '/index.ts';
                } else if (fs.existsSync(resolvedImportPath + '/index.d.ts')) {
                    extension = '/index.d.ts';
                } else {
                    console.warn(`Can not handle: "${importPath}" at "${filePath}"; `)
                    return line;
                }

                const relativePath = path.relative(path.dirname(filePath), resolvedImportPath + extension);
                const newImport = relativePath.replace(new RegExp(`${extension}$`), '')

                return line.replace(importPath, `./${newImport}` );
            }
        }

        return line;
    });

    fs.writeFileSync(filePath, updatedLines.join('\n'), 'utf8');
}

function processDirectory(basePath) {
    const pattern = `${basePath}/**/*.ts`;
    glob(pattern, (err, files) => {
        if (err) {
            console.error('Error finding files:', err);
            return;
        }

        files.forEach((file) => {
            updateImports(file, basePath);
        });
    });
}

processDirectory('./node_modules/obsidian-dataview/lib');
