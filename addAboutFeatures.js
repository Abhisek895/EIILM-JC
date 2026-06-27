const fs = require('fs');
const path = require('path');

// 1. Update Settings Page
const settingsPath = path.join(__dirname, 'frontend/src/pages/dashboard/settings/index.tsx');
let settingsContent = fs.readFileSync(settingsPath, 'utf8');

const targetSettingsLine = `{ key: 'about_timeline', label: 'Timeline Array (JSON format)', type: 'textarea', placeholder: '[\\n  { "year": "Est.", "title": "Foundation", "desc": "...", "side": "left" }\\n]' },`;
const newSettingsLine = `{ key: 'about_features', label: '4 Image Grid Blocks (JSON format)', type: 'textarea', placeholder: '[\\n  { "label": "Academic Excellence", "icon": "GraduationCap", "bg": "bg-primary-600" }\\n]' },\n  ` + targetSettingsLine;

settingsContent = settingsContent.replace(targetSettingsLine, newSettingsLine);
fs.writeFileSync(settingsPath, settingsContent);


// 2. Update About Page
const aboutPath = path.join(__dirname, 'frontend/src/pages/about.tsx');
let aboutContent = fs.readFileSync(aboutPath, 'utf8');

// First inject parsing logic
const targetParsingLine = `let coreValues = [];`;

const parsingLogic = `
  let aboutFeatures = [];
  try { aboutFeatures = settings.about_features ? JSON.parse(settings.about_features) : []; } catch(e){}
  if (!aboutFeatures.length) {
    aboutFeatures = [
      { icon: 'GraduationCap', label: 'Academic Excellence', bg: 'bg-primary-600' },
      { icon: 'Globe', label: 'Global Exposure', bg: 'bg-indigo-600' },
      { icon: 'Shield', label: 'Accredited Programs', bg: 'bg-violet-600' },
      { icon: 'Lightbulb', label: 'Innovation Driven', bg: 'bg-sky-600' },
    ];
  }
  const FeatureIconMap: any = { GraduationCap, Globe, Shield, Lightbulb, Star, Heart, Users, BookOpen, Target, Award };

  let coreValues = [];`;

aboutContent = aboutContent.replace(targetParsingLine, parsingLogic);

// Then replace the map
const targetMap = `{[
                          { icon: GraduationCap, label: 'Academic Excellence', bg: 'bg-primary-600' },
                          { icon: Globe, label: 'Global Exposure', bg: 'bg-indigo-600' },
                          { icon: Shield, label: 'Accredited Programs', bg: 'bg-violet-600' },
                          { icon: Lightbulb, label: 'Innovation Driven', bg: 'bg-sky-600' },
                        ].map(({ icon: Icon, label, bg }, i) => (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            className={\`\${bg} rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-white text-center shadow-lg cursor-default\`}
                          >
                            <Icon size={32} />`;

const replacementMap = `{aboutFeatures.map((feat: any, i: number) => {
                          const Icon = FeatureIconMap[feat.icon] || Star;
                          return (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            className={\`\${feat.bg} rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-white text-center shadow-lg cursor-default\`}
                          >
                            <Icon size={32} />`;

aboutContent = aboutContent.replace(targetMap, replacementMap);

// The original map closing is `))} ` but we changed `({ icon: Icon, label, bg }, i) => (` to `(feat: any, i: number) => { const Icon = ... return (` 
// So we need to change `))` to `)})}`
const originalClosing = `</motion.div>
                        ))}`;
const newClosing = `</motion.div>
                          )
                        })}`;

aboutContent = aboutContent.replace(originalClosing, newClosing);

fs.writeFileSync(aboutPath, aboutContent);
console.log('Successfully updated Settings and About pages to make features dynamic!');
