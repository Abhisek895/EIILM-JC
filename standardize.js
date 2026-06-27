const fs = require('fs');
const path = require('path');

const dashboardDir = path.join(__dirname, 'frontend/src/pages/dashboard');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Table Headers
    content = content.replace(/<th([^>]*)className="[^"]*text-left[^"]*font-semibold[^"]*"([^>]*)>/g, (match, before, after) => {
        // preserve the key etc.
        return `<th${before}className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider text-gray-500"${after}>`;
    });

    // 2. Table Cells (py-3 and py-4 -> py-2.5)
    content = content.replace(/<td([^>]*)className="([^"]*)px-[46]\s+py-[34]([^"]*)"([^>]*)>/g, (match, before, classesBefore, classesAfter, after) => {
        // Ensure whitespace-nowrap for the action buttons isn't added to everything, but for normal cells we just change padding.
        let newClasses = `px-4 py-2.5 ${classesBefore} ${classesAfter}`.replace(/\s+/g, ' ').trim();
        // If it's the actions column, we might want align-middle
        return `<td${before}className="${newClasses}"${after}>`;
    });

    // 3. Action Buttons Flex Wrapper
    content = content.replace(/<div className="flex gap-2">/g, '<div className="flex items-center gap-3 whitespace-nowrap -mt-0.5">');

    // 4. Page Titles
    content = content.replace(/<h1 className="text-2xl font-bold text-gray-900">/g, '<h1 className="text-xl font-bold text-gray-900">');
    content = content.replace(/<h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">/g, '<h1 className="text-xl font-bold text-gray-900">');
    
    // 5. Create Buttons
    content = content.replace(/className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-semibold text-sm transition-colors"/g, 'className="bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 font-semibold text-sm transition-colors"');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

walkDir(dashboardDir);
console.log('Phase 3 Standardization Complete.');
