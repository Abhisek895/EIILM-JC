const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'c:\\EIILM-JC\\frontend\\src\\pages\\notices.tsx',
  'c:\\EIILM-JC\\frontend\\src\\pages\\faculty\\[id].tsx',
  'c:\\EIILM-JC\\frontend\\src\\pages\\faculty\\index.tsx',
  'c:\\EIILM-JC\\frontend\\src\\pages\\departments\\[slug].tsx',
  'c:\\EIILM-JC\\frontend\\src\\pages\\dashboard\\settings\\index.tsx',
  'c:\\EIILM-JC\\frontend\\src\\pages\\dashboard\\notices\\index.tsx',
  'c:\\EIILM-JC\\frontend\\src\\pages\\dashboard\\faculty\\index.tsx',
  'c:\\EIILM-JC\\frontend\\src\\pages\\dashboard\\events\\index.tsx',
  'c:\\EIILM-JC\\frontend\\src\\pages\\dashboard\\courses\\index.tsx',
  'c:\\EIILM-JC\\frontend\\src\\pages\\courses.tsx'
];

filesToUpdate.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add import if not present
  if (!content.includes('getImageUrl') && !content.includes('@utils/image')) {
    content = "import { getImageUrl } from '@utils/image';\n" + content;
    changed = true;
  }

  // Find src={var} and replace with src={getImageUrl(var)}
  // Ensure we don't double wrap: src={getImageUrl(getImageUrl(var))}
  const newContent = content.replace(/<img[^>]*src=\{([^}]+)\}/g, (match, srcValue) => {
    if (srcValue.includes('getImageUrl') || srcValue.startsWith('`') || srcValue.includes('?')) {
      return match;
    }
    // E.g. src={f.photo} -> src={getImageUrl(f.photo)}
    return match.replace(`src={${srcValue}}`, `src={getImageUrl(${srcValue})}`);
  });

  if (newContent !== content) {
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${path.basename(file)}`);
  }
});
