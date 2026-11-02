import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCT_STATUSES,
  canPurchaseProduct,
  isProductVisibleInCatalog,
  canRecommendInVoltIA,
  validateProductAction,
  getProductStatusBadge,
} from '../lib/catalog/product-status-core.mjs';
import { executeDiagnosticEvaluation } from '../lib/voltia/voltia-core.mjs';
import { getVerifiedCatalogPart } from '../lib/orders/order-core.mjs';

test('Issue #9 - Máquina de estados: Validaciones de transiciones de ciclo de vida', () => {
  // 1. Activar producto
  const actRes = validateProductAction('PAUSADO', 'ACTIVAR', { price: 150, name: 'Batería 72V' });
  assert.equal(actRes.allowed, true);
  assert.equal(actRes.targetStatus, PRODUCT_STATUSES.ACTIVO);
  assert.equal(actRes.targetEstado, true);

  // 2. Activar producto con precio inválido
  const invalidPriceRes = validateProductAction('PAUSADO', 'ACTIVAR', { price: 0, name: 'Batería 72V' });
  assert.equal(invalidPriceRes.allowed, false);
  assert.match(invalidPriceRes.error, /precio unitario mayor a cero/i);

  // 3. Activar producto con nombre inválido
  const invalidNameRes = validateProductAction('PAUSADO', 'ACTIVAR', { price: 100, name: 'AB' });
  assert.equal(invalidNameRes.allowed, false);
  assert.match(invalidNameRes.error, /nombre comercial descriptivo/i);

  // 4. Activar producto bloqueado sin confirmación explícita
  const blockedUnlockRes = validateProductAction('BLOQUEADO', 'ACTIVAR', { price: 100, name: 'Controlador 72V' });
  assert.equal(blockedUnlockRes.allowed, false);
  assert.match(blockedUnlockRes.error, /confirmación explícita de desbloqueo/i);

  // 5. Activar producto bloqueado CON confirmación explícita
  const confirmedUnlockRes = validateProductAction('BLOQUEADO', 'ACTIVAR', {
    confirmedUnlock: true,
    price: 100,
    name: 'Controlador 72V',
  });
  assert.equal(confirmedUnlockRes.allowed, true);
  assert.equal(confirmedUnlockRes.targetStatus, PRODUCT_STATUSES.ACTIVO);

  // 6. Pausar producto activo
  const pauseRes = validateProductAction('ACTIVO', 'PAUSAR');
  assert.equal(pauseRes.allowed, true);
  assert.equal(pauseRes.targetStatus, PRODUCT_STATUSES.PAUSADO);
  assert.equal(pauseRes.targetEstado, true);

  // 7. Bloquear producto sin motivo
  const noReasonBlock = validateProductAction('ACTIVO', 'BLOQUEAR', {});
  assert.equal(noReasonBlock.allowed, false);
  assert.match(noReasonBlock.error, /motivo de bloqueo administrativo es obligatorio/i);

  // 8. Bloquear producto con motivo válido
  const validBlock = validateProductAction('ACTIVO', 'BLOQUEAR', {
    motivoBloqueo: 'Incidencia de seguridad en lote #4432',
  });
  assert.equal(validBlock.allowed, true);
  assert.equal(validBlock.targetStatus, PRODUCT_STATUSES.BLOQUEADO);
  assert.equal(validBlock.targetEstado, false);
  assert.equal(validBlock.motivoBloqueo, 'Incidencia de seguridad en lote #4432');

  // 9. Desbloquear producto que no está bloqueado
  const invalidUnlock = validateProductAction('ACTIVO', 'DESBLOQUEAR');
  assert.equal(invalidUnlock.allowed, false);
  assert.match(invalidUnlock.error, /solo se pueden desbloquear productos que se encuentren actualmente bloqueados/i);

  // 10. Desbloquear producto bloqueado
  const validUnlock = validateProductAction('BLOQUEADO', 'DESBLOQUEAR');
  assert.equal(validUnlock.allowed, true);
  assert.equal(validUnlock.targetStatus, PRODUCT_STATUSES.PAUSADO);
});

test('Issue #9 - Reglas de visibilidad, compra y recomendación según estado', () => {
  // canPurchaseProduct
  assert.equal(canPurchaseProduct('ACTIVO', true), true);
  assert.equal(canPurchaseProduct('PAUSADO', true), false);
  assert.equal(canPurchaseProduct('BLOQUEADO', false), false);
  assert.equal(canPurchaseProduct('OCULTO', false), false);
  assert.equal(canPurchaseProduct('ARCHIVADO', false), false);
  assert.equal(canPurchaseProduct('ACTIVO', false), false);

  // isProductVisibleInCatalog
  assert.equal(isProductVisibleInCatalog('ACTIVO', true), true);
  assert.equal(isProductVisibleInCatalog('PAUSADO', true), true); // Visible pero no comprable
  assert.equal(isProductVisibleInCatalog('BLOQUEADO', false), false);
  assert.equal(isProductVisibleInCatalog('OCULTO', false), false);
  assert.equal(isProductVisibleInCatalog('ARCHIVADO', false), false);

  // canRecommendInVoltIA
  assert.equal(canRecommendInVoltIA('ACTIVO', true), true);
  assert.equal(canRecommendInVoltIA('PAUSADO', true), false);
  assert.equal(canRecommendInVoltIA('BLOQUEADO', false), false);
  assert.equal(canRecommendInVoltIA('OCULTO', false), false);
  assert.equal(canRecommendInVoltIA('ARCHIVADO', false), false);
});

test('Issue #9 - Badges y metadatos visuales de estado en catálogo', () => {
  const badgeActivo = getProductStatusBadge('ACTIVO', true);
  assert.equal(badgeActivo.status, 'ACTIVO');
  assert.match(badgeActivo.label, /Activo/i);
  assert.match(badgeActivo.bgColor, /emerald/i);

  const badgePausado = getProductStatusBadge('PAUSADO', true);
  assert.equal(badgePausado.status, 'PAUSADO');
  assert.match(badgePausado.label, /Pausado/i);
  assert.match(badgePausado.bgColor, /amber/i);

  const badgeBloqueado = getProductStatusBadge('BLOQUEADO', false);
  assert.equal(badgeBloqueado.status, 'BLOQUEADO');
  assert.match(badgeBloqueado.label, /Bloqueado/i);
  assert.match(badgeBloqueado.bgColor, /red/i);

  const badgeOculto = getProductStatusBadge('OCULTO', false);
  assert.equal(badgeOculto.status, 'OCULTO');
  assert.match(badgeOculto.label, /Oculto/i);
});

test('Issue #9 - VoltIA excluye repuestos pausados, bloqueados o archivados', () => {
  const res = executeDiagnosticEvaluation({
    symptomCode: 'perdida_fuerza_cuestas',
    vehicleModel: 'Lion',
    brand: 'TAILG',
  });

  assert.ok(Array.isArray(res.recommendedParts));
  // Todos los repuestos recomendados deben ser activos y aptos para recomendación
  for (const part of res.recommendedParts) {
    assert.equal(
      canRecommendInVoltIA(part.data_status || part.dataStatus, part.estado !== undefined ? part.estado : true),
      true
    );
  }
});

test('Issue #9 - getVerifiedCatalogPart reporta dataStatus y estado', () => {
  const part = getVerifiedCatalogPart('MS-BAT-72V45AH');
  assert.ok(part);
  assert.equal(part.dataStatus, 'ACTIVO');
  assert.equal(part.estado, true);
  assert.equal(canPurchaseProduct(part.dataStatus, part.estado), true);
});

test('Issue #10 - Contraste de colores y WCAG AA en tokens de Mi Cuenta (/cuenta)', () => {
  // Función para calcular luminancia relativa según WCAG 2.2
  function sRGBtoLinear(c) {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }

  function getLuminance(r, g, b) {
    return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b);
  }

  function getContrastRatio(rgb1, rgb2) {
    const l1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
    const l2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  const white = [255, 255, 255];
  const slate50 = [248, 250, 252];
  const slate900 = [15, 23, 42]; // #0f172a
  const slate700 = [51, 65, 85]; // #334155
  const slate600 = [71, 85, 105]; // #475569

  // 1. Textos principales (slate-900 sobre fondo blanco)
  const ratioMain = getContrastRatio(slate900, white);
  assert.ok(
    ratioMain >= 7.0,
    `El ratio del texto principal (${ratioMain.toFixed(2)}) debe cumplir WCAG AAA (>= 7.0)`
  );

  // 2. Textos secundarios (slate-600 sobre fondo blanco)
  const ratioSecondary = getContrastRatio(slate600, white);
  assert.ok(
    ratioSecondary >= 4.5,
    `El ratio del texto secundario (${ratioSecondary.toFixed(2)}) debe cumplir WCAG AA (>= 4.5)`
  );

  // 3. Textos en tarjetas internas (slate-700 sobre slate-50)
  const ratioCardText = getContrastRatio(slate700, slate50);
  assert.ok(
    ratioCardText >= 4.5,
    `El ratio del texto en tarjetas internas (${ratioCardText.toFixed(2)}) debe cumplir WCAG AA (>= 4.5)`
  );

  // 4. Badges de estado: Emerald-800 (#065f46) sobre Emerald-50 (#ecfdf5)
  const emerald800 = [6, 95, 70];
  const emerald50 = [236, 253, 245];
  const ratioEmerald = getContrastRatio(emerald800, emerald50);
  assert.ok(
    ratioEmerald >= 4.5,
    `El ratio del badge emerald (${ratioEmerald.toFixed(2)}) debe cumplir WCAG AA (>= 4.5)`
  );

  // 5. Badges de advertencia: Amber-900 (#78350f) sobre Amber-50 (#fffbeb)
  const amber900 = [120, 53, 15];
  const amber50 = [255, 251, 235];
  const ratioAmber = getContrastRatio(amber900, amber50);
  assert.ok(
    ratioAmber >= 4.5,
    `El ratio del badge amber (${ratioAmber.toFixed(2)}) debe cumplir WCAG AA (>= 4.5)`
  );
});
