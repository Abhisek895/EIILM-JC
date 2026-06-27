import { Database } from '../config/database';
import { SiteSetting } from '../models';

async function run() {
  const settings = [
    { keyName: 'about_story_subtitle', value: 'Our Story' },
    { keyName: 'about_story_heading', value: 'Building Tomorrow\'s Leaders Since Inception' },
    { keyName: 'about_mission', value: 'Our mission is to provide quality education that nurtures intellectual growth, critical thinking, innovation, and ethical values. We are committed to empowering students with the knowledge, skills, and confidence needed to excel in their careers, contribute to society, and become responsible global citizens.' },
    { keyName: 'about_vision', value: 'Our vision is to be a leading institution of higher education that fosters academic excellence, innovation, research, and holistic development. We aspire to inspire students with the knowledge, skills, and confidence needed to become future leaders, contribute to society, and create positive impact.' },
    { keyName: 'about_director_quote', value: 'Education is not merely the acquisition of knowledge; it is the foundation for character, leadership, and lifelong success. At our institution, we strive to create an environment where every student is encouraged to dream big, think critically, and achieve their fullest potential.' },
    { keyName: 'about_director_name', value: 'Bhaskar Chakraborty' },
    { keyName: 'about_accreditations', value: 'NAAC++' },
    { keyName: 'about_features', value: JSON.stringify([
      { "label": "Academic Excellence", "icon": "GraduationCap", "bg": "bg-primary-600" },
      { "label": "Industry-Oriented Learning", "icon": "Briefcase", "bg": "bg-emerald-600" },
      { "label": "Research & Innovation", "icon": "Lightbulb", "bg": "bg-violet-600" },
      { "label": "Global Opportunities", "icon": "Globe", "bg": "bg-sky-600" }
    ], null, 2) },
    { keyName: 'about_timeline', value: JSON.stringify([
      { "year": "2005", "title": "Institution Founded", "desc": "The college was established with a vision to provide quality higher education and foster academic excellence.", "side": "left" },
      { "year": "2010", "title": "Program Expansion", "desc": "New undergraduate and postgraduate programs were introduced to meet evolving industry demands.", "side": "right" },
      { "year": "2015", "title": "Research Initiatives", "desc": "Dedicated research centers and innovation labs were established to encourage creativity and discovery.", "side": "left" },
      { "year": "2020", "title": "Digital Transformation", "desc": "Advanced digital learning platforms and smart classrooms were implemented across the campus.", "side": "right" },
      { "year": "2025", "title": "Global Recognition", "desc": "The institution strengthened international collaborations and enhanced student opportunities worldwide.", "side": "left" }
    ], null, 2) },
    { keyName: 'about_values', value: JSON.stringify([
      { "title": "Academic Excellence", "desc": "We are committed to delivering high-quality education that inspires lifelong learning and achievement.", "color": "bg-amber-500", "icon": "Star" },
      { "title": "Integrity", "desc": "We uphold honesty, transparency, and ethical behavior in all academic and professional endeavors.", "color": "bg-rose-500", "icon": "Star" },
      { "title": "Innovation", "desc": "We encourage creativity, critical thinking, and the pursuit of innovative solutions to real-world challenges.", "color": "bg-violet-500", "icon": "Star" },
      { "title": "Knowledge", "desc": "We promote continuous learning, intellectual curiosity, and academic growth.", "color": "bg-sky-500", "icon": "Star" },
      { "title": "Leadership", "desc": "We empower students to become confident leaders who positively impact their communities and professions.", "color": "bg-emerald-500", "icon": "Star" },
      { "title": "Achievement", "desc": "We inspire students to strive for excellence and reach their highest potential.", "color": "bg-orange-500", "icon": "Star" }
    ], null, 2) }
  ];

  for (const s of settings) {
    const existing = await SiteSetting.findOne({ where: { keyName: s.keyName } });
    if (existing) {
      existing.value = s.value;
      await existing.save();
    } else {
      await SiteSetting.create(s);
    }
  }

  console.log('About settings saved successfully!');
  process.exit(0);
}
run().catch(console.error);
