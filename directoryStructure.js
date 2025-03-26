const fs = require('fs');
const path = require('path');

function printDirectoryStructure(startPath, indent = 0) {
    /**
     * Print the structure of directory startPath with indentation.
     */
    // Print the root directory name
    console.log('|' + '-'.repeat(indent) + path.basename(path.resolve(startPath)));
    
    // List all files and directories in startPath
    const items = fs.readdirSync(startPath).sort();
    
    for (const item of items) {
        const itemPath = path.join(startPath, item);
        
        // Skip hidden files/folders (those starting with .)
        if (path.basename(itemPath).startsWith('.')) {
            continue;
        }
        
        if (fs.statSync(itemPath).isDirectory()) {
            // If item is a directory, recursively print its content
            printDirectoryStructure(itemPath, indent + 4);
        } else {
            // If item is a file, print its name with indentation
            console.log('|' + '-'.repeat(indent + 4) + item);
        }
    }
}

// Get the current working directory
const currentDirectory = process.cwd();
console.log(`Directory structure for: ${currentDirectory}`);
printDirectoryStructure(currentDirectory);