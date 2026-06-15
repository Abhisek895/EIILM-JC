const fs = require('fs');
const colors = require('tailwindcss/colors');

function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : null;
}

const themes = {
  blue: colors.blue,
  emerald: colors.emerald,
  rose: colors.rose,
  purple: colors.purple,
  amber: colors.amber,
  slate: colors.slate, // Adding slate to allow a sleek dark/mono primary theme
};

let cssContent = `
/* ================= THEME VARIABLES ================= */
`;

for (const [themeName, palette] of Object.entries(themes)) {
  const selector = themeName === 'blue' ? `:root, [data-theme="blue"]` : `[data-theme="${themeName}"]`;
  cssContent += `${selector} {\n`;
  for (const [shade, hex] of Object.entries(palette)) {
    if (typeof hex === 'string') {
      const rgb = hexToRgb(hex);
      if (rgb) cssContent += `  --color-primary-${shade}: ${rgb};\n`;
    }
  }
  cssContent += `}\n\n`;
}

console.log(cssContent);
