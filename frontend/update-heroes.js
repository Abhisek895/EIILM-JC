const fs = require('fs');
const path = require('path');

const PAGES = [
  {
    file: 'c:\\EIILM-JC\\frontend\\src\\pages\\courses.tsx',
    prefix: 'courses_',
    taglineDefault: 'Academic Programmes',
    headingDefault: 'Explore Our Courses',
    subheadingDefault: 'Discover world-class programmes designed to shape your future and open doors to global opportunities.',
  },
  {
    file: 'c:\\EIILM-JC\\frontend\\src\\pages\\departments.tsx',
    prefix: 'dept_',
    taglineDefault: 'Academic Departments',
    headingDefault: 'Our Departments',
    subheadingDefault: 'Explore our diverse academic departments dedicated to excellence in teaching and research.',
  },
  {
    file: 'c:\\EIILM-JC\\frontend\\src\\pages\\faculty\\index.tsx',
    prefix: 'faculty_',
    taglineDefault: 'Academic Excellence',
    headingDefault: 'Our Faculty',
    subheadingDefault: 'Meet our distinguished team of educators, researchers, and industry experts.',
  },
  {
    file: 'c:\\EIILM-JC\\frontend\\src\\pages\\notices.tsx',
    prefix: 'notices_',
    taglineDefault: 'Stay Updated',
    headingDefault: 'Important Notices',
    subheadingDefault: 'Stay informed with the latest announcements, schedules, and important updates from the college.',
  },
  {
    file: 'c:\\EIILM-JC\\frontend\\src\\pages\\events.tsx',
    prefix: 'events_',
    taglineDefault: 'Campus Life',
    headingDefault: 'Upcoming Events',
    subheadingDefault: 'Discover academic seminars, cultural fests, and student activities happening around the campus.',
  },
  {
    file: 'c:\\EIILM-JC\\frontend\\src\\pages\\infrastructure.tsx',
    prefix: 'infra_',
    taglineDefault: 'Campus Infrastructure',
    headingDefault: 'World-Class Facilities',
    subheadingDefault: 'Experience an environment designed to inspire innovation, foster creativity, and provide the ultimate student experience.',
  }
];

PAGES.forEach(page => {
  if (!fs.existsSync(page.file)) {
    console.log(`Skipping missing file: ${page.file}`);
    return;
  }
  let content = fs.readFileSync(page.file, 'utf8');
  let changed = false;

  // 1. Ensure siteSettingsApi is imported
  if (!content.includes('siteSettingsApi')) {
    content = content.replace(/import \{([^}]+)\} from '@api\/endpoints';/, "import { $1, siteSettingsApi } from '@api/endpoints';");
    if (!content.includes('siteSettingsApi')) {
      content = content.replace(/import { infrastructureApi } from '@api\/endpoints';/, "import { infrastructureApi, siteSettingsApi } from '@api/endpoints';");
    }
    changed = true;
  }

  // 2. Add siteSettings state
  if (!content.includes('siteSettings')) {
    content = content.replace(/(const \[loading, setLoading\] = useState.*?;\s*)/, "$1const [siteSettings, setSiteSettings] = useState<any>({});\n  ");
    
    // Inject siteSettingsApi fetch if not present
    if (content.includes('useEffect(() => {') && !content.includes('siteSettingsApi.getMap')) {
      // Very naive injection: find first useEffect and just add siteSettingsApi.getMap()
      // Since each file has a different structure, a targeted approach is better.
      // We will handle the fetch in step 2.5
    }
    changed = true;
  }

  // Handle the data fetch injection
  if (!content.includes('siteSettingsApi.getMap()')) {
      content = content.replace(/(useEffect\(\(\) => \{\s*)(const load = async \(\) => \{\s*try \{\s*const response: any = await courseApi.*?;\s*if \(response.success\) \{\s*setCourses\(response.data \|\| \[\]\);\s*\})/, "$1$2\n        const settingsRes: any = await siteSettingsApi.getMap();\n        setSiteSettings(settingsRes?.data || {});\n");
      content = content.replace(/(useEffect\(\(\) => \{\s*departmentApi\.getAll[\s\S]*?load\(\);\s*\})/, "$1\n  useEffect(() => {\n    siteSettingsApi.getMap().then((res: any) => setSiteSettings(res?.data || {}));\n  }, []);\n");
      content = content.replace(/(const load = async \(\) => \{\s*setLoading\(true\);\s*setError\(null\);\s*try \{\s*const res: any = await noticeApi.*?\s*setNotices\(res\?.data.*?;\s*\})/, "$1\n      const settingsRes: any = await siteSettingsApi.getMap();\n      setSiteSettings(settingsRes?.data || {});\n");
      content = content.replace(/(const load = async \(\) => \{\s*setLoading\(true\);\s*setError\(null\);\s*try \{\s*const res: any = await eventApi.*?\s*setEvents\(res\?.data.*?;\s*\})/, "$1\n      const settingsRes: any = await siteSettingsApi.getMap();\n      setSiteSettings(settingsRes?.data || {});\n");
      changed = true;
  }

  // 3. Update the Hero DOM block
  const heroRegex1 = /<div className="bg-gradient-to-[^>]+>[\s\S]*?<div className="container mx-auto px-6[^>]*>[\s\S]*?<\/div>\s*<\/div>/;
  const newHero = `<div className="bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary-200 mb-3">
            {siteSettings.${page.prefix}hero_tagline || '${page.taglineDefault}'}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            {siteSettings.${page.prefix}hero_heading || '${page.headingDefault}'}
          </h1>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto">
            {siteSettings.${page.prefix}hero_subheading || '${page.subheadingDefault}'}
          </p>
        </div>
      </div>`;
  
  if (heroRegex1.test(content)) {
    content = content.replace(heroRegex1, newHero);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(page.file, content, 'utf8');
    console.log(`Updated ${page.file}`);
  }
});
