/**
 * MOTOSERVICE - Test Suite para Issue #17: Contraste y Legibilidad WCAG 2.2 AA en /pedido/[id]
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

// Función de Luminancia Relativa según WCAG 2.2
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Cálculo de Ratio de Contraste según WCAG 2.2
function getContrastRatio(rgb1, rgb2) {
  const l1 = getLuminance(...rgb1);
  const l2 = getLuminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Colores Tailwind utilizados en /pedido/[id]
const COLORS = {
  slate950: [2, 6, 23],    // #020617 (Fondo tarjeta oscura)
  slate900: [15, 23, 42],   // #0f172a (Superficie secundaria)
  white: [255, 255, 255],   // #ffffff
  slate100: [241, 245, 249],// #f1f5f9
  slate200: [226, 232, 240],// #e2e8f0
  slate300: [203, 213, 225],// #cbd5e1
  cyan200: [165, 243, 252], // #a5f3fc
  cyan300: [103, 232, 249], // #67e8f9
  cyan400: [34, 211, 238],  // #22d3ee
  emerald300: [110, 231, 183], // #6ee7b7
  emerald400: [52, 211, 153],  // #34d399
  emerald500: [16, 185, 129],  // #10b981
};

test('Issue #17: Ratios de contraste WCAG 2.2 AA (mínimo 4.5:1 para texto normal, 3:1 para texto grande/componentes)', () => {
  // 1. Textos principales en tarjetas oscuras (slate-950)
  const ratioWhite = getContrastRatio(COLORS.white, COLORS.slate950);
  assert.ok(ratioWhite >= 7, `Blanco sobre slate-950 debe superar 7:1 (AAA). Ratio: ${ratioWhite.toFixed(2)}:1`);

  const ratioSlate200 = getContrastRatio(COLORS.slate200, COLORS.slate950);
  assert.ok(ratioSlate200 >= 4.5, `Slate-200 sobre slate-950 debe superar 4.5:1 (AA). Ratio: ${ratioSlate200.toFixed(2)}:1`);

  const ratioSlate300 = getContrastRatio(COLORS.slate300, COLORS.slate950);
  assert.ok(ratioSlate300 >= 4.5, `Slate-300 sobre slate-950 debe superar 4.5:1 (AA). Ratio: ${ratioSlate300.toFixed(2)}:1`);

  // 2. Etiquetas y acentos de marca (cyan-300, cyan-200, emerald-300)
  const ratioCyan300 = getContrastRatio(COLORS.cyan300, COLORS.slate950);
  assert.ok(ratioCyan300 >= 7, `Cyan-300 sobre slate-950 debe superar 7:1 (AAA). Ratio: ${ratioCyan300.toFixed(2)}:1`);

  const ratioCyan200 = getContrastRatio(COLORS.cyan200, COLORS.slate950);
  assert.ok(ratioCyan200 >= 7, `Cyan-200 sobre slate-950 debe superar 7:1 (AAA). Ratio: ${ratioCyan200.toFixed(2)}:1`);

  const ratioEmerald300 = getContrastRatio(COLORS.emerald300, COLORS.slate950);
  assert.ok(ratioEmerald300 >= 7, `Emerald-300 sobre slate-950 debe superar 7:1 (AAA). Ratio: ${ratioEmerald300.toFixed(2)}:1`);

  // 3. Botón CTA Consultar a VoltIA (texto slate-950 sobre fondo cyan-400)
  const ratioVoltIABtn = getContrastRatio(COLORS.slate950, COLORS.cyan400);
  assert.ok(ratioVoltIABtn >= 7, `Texto slate-950 sobre botón cyan-400 debe superar 7:1 (AAA). Ratio: ${ratioVoltIABtn.toFixed(2)}:1`);
});

test('Issue #17: Inspección de estructura visual y componentes en app/pedido/[id]/page.tsx', () => {
  const pageFile = fs.readFileSync(path.join(ROOT_DIR, 'app/pedido/[id]/page.tsx'), 'utf8');

  // 1. Tarjeta principal: presencia de etiquetas claras y legibles
  assert.ok(pageFile.includes('Destinatario'), 'Debe existir la sección Destinatario');
  assert.ok(pageFile.includes('Entrega'), 'Debe existir la sección Entrega');
  assert.ok(pageFile.includes('Comprobante SUNAT'), 'Debe existir la sección Comprobante SUNAT');
  assert.ok(pageFile.includes('text-cyan-300'), 'Las cabeceras de sección deben usar colores de alto contraste text-cyan-300');

  // 2. Línea de progreso multimodal (no depende solo del color)
  assert.ok(pageFile.includes('Completado'), 'La línea de progreso debe indicar textualmente la etapa Completado');
  assert.ok(pageFile.includes('En curso'), 'La línea de progreso debe indicar textualmente la etapa En curso');
  assert.ok(pageFile.includes('Pendiente'), 'La línea de progreso debe indicar textualmente las etapas Pendientes');
  assert.ok(pageFile.includes('progressPercent'), 'La línea de progreso debe contar con barra dinámica de avance');

  // 3. Productos y totales legibles
  assert.ok(pageFile.includes('SKU:'), 'Los productos deben mostrar su SKU con badge visible');
  assert.ok(pageFile.includes('Total Pagado (Inc. IGV)'), 'Debe mostrarse el total pagado con distinción tipográfica');
  assert.ok(pageFile.includes('text-cyan-300'), 'El total pagado debe resaltarse con cyan-300 de alto contraste');

  // 4. Integración con OrderVoltIAButton
  assert.ok(
    pageFile.includes('<OrderVoltIAButton'),
    'La sección de dudas y soporte debe renderizar el componente interactivo OrderVoltIAButton'
  );
});

test('Issue #17: Componente OrderVoltIAButton integra asistente VoltIA sin navegación externa', () => {
  const btnPath = path.join(ROOT_DIR, 'components/orders/OrderVoltIAButton.tsx');
  assert.ok(fs.existsSync(btnPath), 'components/orders/OrderVoltIAButton.tsx debe existir');

  const btnContent = fs.readFileSync(btnPath, 'utf8');
  assert.ok(
    btnContent.includes('openVoltIAChat'),
    'OrderVoltIAButton debe llamar a openVoltIAChat para abrir el widget in-place'
  );
  assert.ok(
    btnContent.includes('bg-cyan-400') && btnContent.includes('text-slate-950'),
    'OrderVoltIAButton debe usar bg-cyan-400 con texto text-slate-950 de máximo contraste'
  );
  assert.ok(
    btnContent.includes('focus-visible:ring-2'),
    'OrderVoltIAButton debe incluir estilos de foco visible accesibles'
  );
});
