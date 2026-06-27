const fs = require('fs');
const path = require('path');

// 1. Update Settings Page
const settingsPath = path.join(__dirname, 'frontend/src/pages/dashboard/settings/index.tsx');
let settingsContent = fs.readFileSync(settingsPath, 'utf8');

const targetSettingsLine = `{ key: 'about_mission', label: 'Mission Statement', type: 'textarea', placeholder: 'Our mission is to provide quality...' },`;
const newSettingsLine = `{ key: 'about_story_subtitle', label: 'Story Subtitle (e.g. Our Story)', type: 'text', placeholder: 'Our Story' },\n  { key: 'about_story_heading', label: 'Story Heading', type: 'text', placeholder: 'Building Tomorrow\\'s Leaders Since Inception' },\n  ` + targetSettingsLine;

if (settingsContent.includes(targetSettingsLine)) {
  settingsContent = settingsContent.replace(targetSettingsLine, newSettingsLine);
} else {
  // Try alternative matching
  const altTarget = `{ key: 'about_mission', label: 'Mission Statement'`;
  settingsContent = settingsContent.replace(
    altTarget,
    `{ key: 'about_story_subtitle', label: 'Story Subtitle (e.g. Our Story)', type: 'text', placeholder: 'Our Story' },\n  { key: 'about_story_heading', label: 'Story Heading', type: 'text', placeholder: 'Building Tomorrow\\'s Leaders Since Inception' },\n  ${altTarget}`
  );
}

fs.writeFileSync(settingsPath, settingsContent);


// 2. Update About Page
const aboutPath = path.join(__dirname, 'frontend/src/pages/about.tsx');
let aboutContent = fs.readFileSync(aboutPath, 'utf8');

// Replace "Our Story"
aboutContent = aboutContent.replace(
  '<p className="text-sm font-bold uppercase tracking-widest text-primary-600 mb-3">Our Story</p>',
  '<p className="text-sm font-bold uppercase tracking-widest text-primary-600 mb-3">{settings.about_story_subtitle || \'Our Story\'}</p>'
);

// Replace "Building Tomorrow's Leaders Since Inception"
aboutContent = aboutContent.replace(
  `Building Tomorrow's Leaders Since Inception`,
  `{settings.about_story_heading || "Building Tomorrow's Leaders Since Inception"}`
);

fs.writeFileSync(aboutPath, aboutContent);
console.log('Successfully updated About Story headings!');
