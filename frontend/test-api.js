const axios = require('axios');
axios.get('http://127.0.0.1:3003/api/v1/cms/page-sections?pageKey=home')
  .then(res => {
    console.log("Success data:", JSON.stringify(res.data, null, 2));
    const data = res.data.data || [];
    const heroSection = data.find(s => s.sectionKey === 'hero');
    console.log("Hero section found:", !!heroSection);
  })
  .catch(err => {
    console.error("Error:", err.message);
  });
