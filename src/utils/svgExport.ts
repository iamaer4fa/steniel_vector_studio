import { PageConfig, VectorObject } from '../types/vectordraw';
import { subpathsToSvgPath } from './bezier';

export function exportToSvgString(objects: VectorObject[], pageConfig: PageConfig): string {
  const { width, height } = pageConfig;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  svg += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;
  svg += `  <style>\n`;
  svg += `    .vector-obj { vector-effect: non-scaling-stroke; }\n`;
  svg += `  </style>\n`;
  svg += `  <!-- Created with VectorDraw Studio -->\n`;

  for (const obj of objects) {
    if (!obj.visible) continue;

    const strokeAttr = obj.stroke !== 'none' ? `stroke="${obj.stroke}" stroke-width="${obj.strokeWidth}"` : `stroke="none"`;
    const fillAttr = `fill="${obj.fill}"`;
    const opacityAttr = obj.opacity < 1 ? `opacity="${obj.opacity}"` : '';

    if (obj.type === 'curve') {
      const d = subpathsToSvgPath(obj.subpaths);
      const fillRule = obj.fillRule ? `fill-rule="${obj.fillRule}"` : '';
      svg += `  <path id="${obj.id}" d="${d}" ${fillAttr} ${strokeAttr} ${fillRule} ${opacityAttr} class="vector-obj" />\n`;
    } else if (obj.type === 'rectangle') {
      const [tl, tr, br, bl] = obj.cornerRadii;
      const rx = (tl + tr + br + bl) / 4;
      svg += `  <rect id="${obj.id}" x="${obj.x}" y="${obj.y}" width="${obj.width}" height="${obj.height}" rx="${rx}" ${fillAttr} ${strokeAttr} ${opacityAttr} class="vector-obj" />\n`;
    } else if (obj.type === 'ellipse') {
      if (obj.kind === 'ellipse') {
        svg += `  <ellipse id="${obj.id}" cx="${obj.cx}" cy="${obj.cy}" rx="${obj.rx}" ry="${obj.ry}" ${fillAttr} ${strokeAttr} ${opacityAttr} class="vector-obj" />\n`;
      }
    } else if (obj.type === 'polygon') {
      const totalPoints = obj.isStar ? obj.sides * 2 : obj.sides;
      const angleStep = (Math.PI * 2) / totalPoints;
      const pts: string[] = [];
      for (let i = 0; i < totalPoints; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const r = obj.isStar && i % 2 === 1 ? obj.radius * (1 - obj.sharpness) : obj.radius;
        pts.push(`${obj.cx + r * Math.cos(angle)},${obj.cy + r * Math.sin(angle)}`);
      }
      svg += `  <polygon id="${obj.id}" points="${pts.join(' ')}" ${fillAttr} ${strokeAttr} ${opacityAttr} class="vector-obj" />\n`;
    } else if (obj.type === 'text') {
      const anchor = obj.textAlign === 'center' ? 'middle' : obj.textAlign === 'right' ? 'end' : 'start';
      svg += `  <text id="${obj.id}" x="${obj.x}" y="${obj.y}" font-family="${obj.fontFamily}" font-size="${obj.fontSize}" font-weight="${obj.fontWeight}" font-style="${obj.fontStyle}" text-anchor="${anchor}" ${fillAttr} ${strokeAttr} ${opacityAttr}>${obj.text}</text>\n`;
    }
  }

  svg += `</svg>`;
  return svg;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToPng(objects: VectorObject[], pageConfig: PageConfig) {
  const svgStr = exportToSvgString(objects, pageConfig);
  const img = new Image();
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = pageConfig.width * 2; // 2x high resolution
    canvas.height = pageConfig.height * 2;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);

      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = 'vectordraw-export.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    URL.revokeObjectURL(url);
  };
  img.src = url;
}
