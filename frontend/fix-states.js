const fs = require('fs');

const files = [
  'c:\\EIILM-JC\\frontend\\src\\pages\\departments.tsx',
  'c:\\EIILM-JC\\frontend\\src\\pages\\faculty\\index.tsx',
  'c:\\EIILM-JC\\frontend\\src\\pages\\notices.tsx',
  'c:\\EIILM-JC\\frontend\\src\\pages\\events.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('const [siteSettings, setSiteSettings]')) {
    content = content.replace(/(const \[loading, setLoading\] = useState.*?;\s*)/, "const [siteSettings, setSiteSettings] = useState<any>({});\n  $1");
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
});
