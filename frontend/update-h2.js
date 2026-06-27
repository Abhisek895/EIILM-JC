const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('dashboard') && !fullPath.includes('auth')) {
        processDir(fullPath);
      }
    } else if (fullPath.endsWith('.tsx') && !file.startsWith('_')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      content = content.replace(/<h2\s+className="([^"]+)"/g, (match, classes) => {
        // Skip small headings that shouldn't be global sections
        if (classes.includes('text-lg') || classes.includes('text-xl') || classes.includes('text-2xl')) {
            return match;
        }
        
        let newClasses = classes
          .replace(/\btext-\d?xl\b/g, '')
          .replace(/\bmd:text-\d?xl\b/g, '')
          .replace(/\bfont-\w+\b/g, '')
          .replace(/\btext-gray-\d+\b/g, '')
          .replace(/\s+/g, ' ')
          .trim();
          
        newClasses = 'text-4xl md:text-5xl font-extrabold text-gray-900 ' + newClasses;
        newClasses = newClasses.replace(/\s+/g, ' ').trim();
        changed = true;
        return `<h2 className="${newClasses}"`;
      });
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated', fullPath);
      }
    }
  }
}

processDir('c:/EIILM-JC/frontend/src/pages');
