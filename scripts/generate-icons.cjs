const fs = require('fs');
const path = require('path');

// Função para criar um ícone SVG simples
function createIconSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#0066cc" rx="${size * 0.2}"/>
    <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold">SC</text>
  </svg>`;
}

// Tamanhos necessários
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Criar diretório de ícones se não existir
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Gerar ícones SVG
sizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const filePath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filePath, svgContent);
  console.log(`Ícone ${size}x${size} criado: ${filePath}`);
});

console.log('Ícones SVG criados com sucesso!');
