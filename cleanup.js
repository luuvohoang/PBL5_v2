const fs = require('fs');
const path = require('path');

const projectDir = __dirname;
const excludeFiles = ['package.json', 'cleanup.js'];

function cleanDirectory(directory) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const fullPath = path.join(directory, file);

        if (excludeFiles.includes(file)) {
            continue;
        }

        if (fs.lstatSync(fullPath).isDirectory()) {
            cleanDirectory(fullPath);
            fs.rmdirSync(fullPath);
        } else {
            fs.unlinkSync(fullPath);
        }
    }
}

try {
    cleanDirectory(projectDir);
    console.log('Project cleaned successfully!');
} catch (error) {
    console.error('Error cleaning project:', error);
}
