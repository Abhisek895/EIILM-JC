const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function (file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));

const regex = /\b(text|bg|border|ring|shadow|from|to|via|fill|stroke|decoration)-blue-(\d{2,3})\b/g;

let totalReplacements = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let matches = content.match(regex);
  if (matches) {
    let newContent = content.replace(regex, '$1-primary-$2');
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Replaced ${matches.length} occurrences in ${file}`);
    totalReplacements += matches.length;
  }
});

console.log(`Total replacements: ${totalReplacements}`);
