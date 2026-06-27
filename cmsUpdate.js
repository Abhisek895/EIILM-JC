const fs = require('fs');
const path = require('path');

const aboutPath = path.join(__dirname, 'frontend/src/pages/about.tsx');

let aboutContent = fs.readFileSync(aboutPath, 'utf8');

// 1. Mission and Vision Strings
aboutContent = aboutContent.replace(
  'To provide quality, innovative, and value-driven education that equips students with the knowledge, skills, and ethical grounding necessary to thrive in a rapidly evolving global landscape — and to contribute meaningfully to society.',
  `{settings.about_mission || 'To provide quality, innovative, and value-driven education that equips students with the knowledge, skills, and ethical grounding necessary to thrive in a rapidly evolving global landscape — and to contribute meaningfully to society.'}`
);

aboutContent = aboutContent.replace(
  'To be a nationally recognized institution of excellence that fosters intellectual curiosity, research culture, and holistic development — producing graduates who are global citizens and ethical leaders in their chosen fields.',
  `{settings.about_vision || 'To be a nationally recognized institution of excellence that fosters intellectual curiosity, research culture, and holistic development — producing graduates who are global citizens and ethical leaders in their chosen fields.'}`
);

// 2. Director Quote and Name
aboutContent = aboutContent.replace(
  'Education is not merely a transfer of knowledge, but a transformation of character. At {collegeName},\n                we believe in empowering every student to discover their potential and pursue excellence with purpose.',
  `{settings.about_director_quote || \`Education is not merely a transfer of knowledge, but a transformation of character. At \${collegeName}, we believe in empowering every student to discover their potential and pursue excellence with purpose.\`}`
);

aboutContent = aboutContent.replace(
  '<p className="font-bold text-white text-lg">The Director</p>',
  '<p className="font-bold text-white text-lg">{settings.about_director_name || \'The Director\'}</p>'
);

// 3. Badges / Accreditations
// We need to replace the array `['NAAC Accredited', 'UGC Recognized', ...]`
aboutContent = aboutContent.replace(
  /\{\['NAAC Accredited', 'UGC Recognized', 'AICTE Approved', 'ISO Certified', 'State University Affiliated'\]\.map\(\(badge, i\) => \(/g,
  `{(settings.about_accreditations ? settings.about_accreditations.split(',').map(s=>s.trim()).filter(Boolean) : ['NAAC Accredited', 'UGC Recognized', 'AICTE Approved', 'ISO Certified', 'State University Affiliated']).map((badge, i) => (`
);

// 4. Parse JSON Values
// To avoid messy string replacements for the Core Values array and Timeline, I'll inject parsing logic near the top of the component and then replace the array references.

const parsingLogic = `
  const isHtml = /^<[a-z][\\s\\S]*>/i.test(about);

  // Safely Parse JSON Arrays
  let coreValues = [];
  try { coreValues = settings.about_values ? JSON.parse(settings.about_values) : []; } catch(e){}
  if (!coreValues.length) {
    coreValues = [
      { icon: 'Star', title: 'Excellence', desc: 'We hold ourselves to the highest standards in teaching, research, and student development.', color: 'bg-amber-500' },
      { icon: 'Heart', title: 'Integrity', desc: 'Honesty, transparency, and ethical conduct are the cornerstones of everything we do.', color: 'bg-rose-500' },
      { icon: 'Users', title: 'Inclusivity', desc: 'We celebrate diversity and create an environment where every student feels valued and heard.', color: 'bg-indigo-500' },
      { icon: 'Lightbulb', title: 'Innovation', desc: 'We nurture creative thinking and encourage students to challenge boundaries and pioneer change.', color: 'bg-emerald-500' },
      { icon: 'BookOpen', title: 'Scholarship', desc: 'A deep commitment to academic rigor and life-long learning drives our academic community.', color: 'bg-primary-600' },
      { icon: 'Globe', title: 'Global Outlook', desc: 'We prepare students to succeed in a connected world by developing cross-cultural understanding.', color: 'bg-violet-600' },
    ];
  }

  let timelineEvents = [];
  try { timelineEvents = settings.about_timeline ? JSON.parse(settings.about_timeline) : []; } catch(e){}
  if (!timelineEvents.length) {
    timelineEvents = [
      { year: 'Est.', title: 'Foundation', desc: 'The college was established with a mission to provide quality education to the youth of the region.', side: 'left' },
      { year: '+5', title: 'First Batch Graduates', desc: 'Our inaugural batch of graduates went on to prestigious institutions and companies across India.', side: 'right' },
      { year: '+10', title: 'NAAC Accreditation', desc: 'The institution received accreditation, affirming its commitment to quality education.', side: 'left' },
      { year: '+15', title: 'Campus Expansion', desc: 'New infrastructure — labs, library and sports facilities — added to enrich student experience.', side: 'right' },
      { year: 'Now', title: 'A New Era', desc: 'Today we serve thousands of students with modern programs and industry-ready curriculum.', side: 'left' },
    ];
  }

  // Icon mapping for JSON strings
  const IconMap: any = { Star, Heart, Users, Lightbulb, BookOpen, Globe };
`;

aboutContent = aboutContent.replace('const isHtml = /^<[a-z][\\s\\S]*>/i.test(about);', parsingLogic);

// Replace Core Values Map
aboutContent = aboutContent.replace(
  /\{\[\s*\{\s*icon:\s*Star,.*\}\s*\]\.map\(\(v, i\) => \(/s, // This regex won't work well over multiple lines. Let's do string split/replace.
  `{coreValues.map((v: any, i: number) => {
              const MappedIcon = IconMap[v.icon] || Star;
              return (
              <FadeIn key={i} delay={i * 0.07}>
                <ValueCard icon={MappedIcon} title={v.title} desc={v.desc} color={v.color} />
              </FadeIn>
              )
            })}`
);

// We need to carefully replace the Core Values Array.
// Let's use string manipulation
const coreValuesStart = `{[
              { icon: Star, title: 'Excellence', desc: 'We hold ourselves to the highest standards in teaching, research, and student development.', color: 'bg-amber-500' },
              { icon: Heart, title: 'Integrity', desc: 'Honesty, transparency, and ethical conduct are the cornerstones of everything we do.', color: 'bg-rose-500' },
              { icon: Users, title: 'Inclusivity', desc: 'We celebrate diversity and create an environment where every student feels valued and heard.', color: 'bg-indigo-500' },
              { icon: Lightbulb, title: 'Innovation', desc: 'We nurture creative thinking and encourage students to challenge boundaries and pioneer change.', color: 'bg-emerald-500' },
              { icon: BookOpen, title: 'Scholarship', desc: 'A deep commitment to academic rigor and life-long learning drives our academic community.', color: 'bg-primary-600' },
              { icon: Globe, title: 'Global Outlook', desc: 'We prepare students to succeed in a connected world by developing cross-cultural understanding.', color: 'bg-violet-600' },
            ].map((v, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <ValueCard {...v} />
              </FadeIn>
            ))}`;

const coreValuesReplacement = `{coreValues.map((v: any, i: number) => {
              const MappedIcon = IconMap[v.icon] || Star;
              return (
              <FadeIn key={i} delay={i * 0.07}>
                <ValueCard icon={MappedIcon} title={v.title} desc={v.desc} color={v.color} />
              </FadeIn>
              )
            })}`;
            
aboutContent = aboutContent.replace(coreValuesStart, coreValuesReplacement);

const timelineStart = `{[
              { year: 'Est.', title: 'Foundation', desc: 'The college was established with a mission to provide quality education to the youth of the region.', side: 'left' as const },
              { year: '+5', title: 'First Batch Graduates', desc: 'Our inaugural batch of graduates went on to prestigious institutions and companies across India.', side: 'right' as const },
              { year: '+10', title: 'NAAC Accreditation', desc: 'The institution received accreditation, affirming its commitment to quality education.', side: 'left' as const },
              { year: '+15', title: 'Campus Expansion', desc: 'New infrastructure — labs, library and sports facilities — added to enrich student experience.', side: 'right' as const },
              { year: 'Now', title: 'A New Era', desc: 'Today we serve thousands of students with modern programs and industry-ready curriculum.', side: 'left' as const },
            ].map((item, i) => (`;

const timelineReplacement = `{timelineEvents.map((item: any, i: number) => (`;
aboutContent = aboutContent.replace(timelineStart, timelineReplacement);

fs.writeFileSync(aboutPath, aboutContent);
console.log('About page updated successfully');

// ==========================================
// CONTACT PAGE UPDATE
// ==========================================
const contactPath = path.join(__dirname, 'frontend/src/pages/contact.tsx');
let contactContent = fs.readFileSync(contactPath, 'utf8');

const contactParsingLogic = `
  // Parse FAQS
  let parsedFaqs = [];
  try { parsedFaqs = settings.contact_faqs ? JSON.parse(settings.contact_faqs) : []; } catch(e){}
  if (!parsedFaqs.length) {
    parsedFaqs = FAQS;
  }
`;

// Insert after settings fetching in ContactPage
// Find the line "const collegeName = settings.college_name || 'EIILM Junior College';"
contactContent = contactContent.replace("const isHydrated = true;", `const isHydrated = true;\n${contactParsingLogic}`);

// Replace FAQS.map with parsedFaqs.map
contactContent = contactContent.replace("FAQS.map((faq, i)", "parsedFaqs.map((faq: any, i: number)");

// Replace hardcoded map URL
contactContent = contactContent.replace(
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117925.33439927712!2d88.26495094203756!3d22.535406374523173!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f882db4908f667%3A0x43e330e68f6c2cbc!2sKolkata%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1709663248384!5m2!1sen!2sin',
  `{settings.contact_map_url || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117925.33439927712!2d88.26495094203756!3d22.535406374523173!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f882db4908f667%3A0x43e330e68f6c2cbc!2sKolkata%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1709663248384!5m2!1sen!2sin'}`
);

// Replace office hours
contactContent = contactContent.replace(
  '<p className="text-gray-900 font-semibold mt-1">Mon - Sat, 9:00 AM - 5:00 PM</p>',
  '<p className="text-gray-900 font-semibold mt-1">{settings.contact_office_hours || \'Mon - Sat, 9:00 AM - 5:00 PM\'}</p>'
);

// Replace address
// Looking at contact page address:
contactContent = contactContent.replace(
  '<p className="text-gray-900 font-semibold mt-1 leading-relaxed">123 Education Boulevard,<br />Knowledge City, State 12345</p>',
  '<p className="text-gray-900 font-semibold mt-1 leading-relaxed whitespace-pre-wrap">{settings.contact_address || \'123 Education Boulevard,\\nKnowledge City, State 12345\'}</p>'
);

fs.writeFileSync(contactPath, contactContent);
console.log('Contact page updated successfully');
