import { FEATURED_PARTS } from '../constants.js';

const HAZARD_KEYWORDS = [
  'hinchad',
  'hinchazon',
  'humo',
  'olor a quemado',
  'olor fuerte',
  'chispa',
  'chispazo',
  'fuego',
  'calentamiento extremo',
  'quema al tocar',
  'derretid',
  'cable pelado',
  'corto circuito',
  'cortocircuito',
  'agua en bateria',
  'sumergid',
];

// Modelos oficiales que disponen de repuestos directos verificados (plug-and-play en catálogo)
export const KNOWN_MODELS_WITH_DIRECT_PARTS = new Set([
  // Tailg
  'tailg-f55 mecha g2',
  'tailg-optimus mecha g3',
  'tailg-f52 mecha g1',
  'tailg-f52 neo',
  'tailg-x9 super s',
  'tailg-f55l litio extraíble',
  'tailg-t7 litio extraíble',
  'tailg-v10 litio extraíble',
  'tailg-x51 litio extraíble',
  'tailg-ledo litio extraíble lmfp',
  'tailg-a1 plus',
  'tailg-lion max 2026',
  'tailg-polaris super s',
  'tailg-leopard pro super s',
  'tailg-master',
  'tailg-t5',
  'tailg-t3',
  'tailg-t24',
  'tailg-vmp s4',
  'tailg-vmp s2',
  'tailg-vmp s2x',
  // Yadea
  'yadea-e8s pro',
  'yadea-m6 pro',
  // Kayencorp
  'kayencorp-bicimoto ido',
  'kayencorp-moto mnk2',
  // Greenline
  'greenline-m6',
  'greenline-m5',
  'greenline-e3',
  'greenline-e5',
  'greenline-f6',
  'greenline-j4',
  'greenline-tm8x',
  'greenline-tm6x',
  'greenline-h2',
]);

export function hasDirectCompatibleParts(brand, model) {
  if (!brand || !model) return false;
  const b = brand.trim().toLowerCase();
  const m = model.trim().toLowerCase();
  if (
    !b ||
    !m ||
    b === 'genérica' ||
    m === 'moto eléctrica' ||
    m === 'modelo general' ||
    m === 'consulta directa'
  ) {
    return false;
  }
  for (const known of KNOWN_MODELS_WITH_DIRECT_PARTS) {
    const [knownBrand, ...modelParts] = known.split('-');
    const knownModel = modelParts.join('-');
    if (b === knownBrand && (m === knownModel || m.includes(knownModel) || knownModel.includes(m))) {
      return true;
    }
  }
  return false;
}

export function detectElectricalHazards(text) {
  if (!text || typeof text !== 'string') return null;
  const lower = text.toLowerCase();
  const matched = HAZARD_KEYWORDS.find((keyword) => lower.includes(keyword));

  if (matched) {
    return {
      level: 'PELIGRO_ELECTRICO_CRITICO',
      title: '⚠️ ALERTA DE SEGURIDAD ELÉCTRICA: DETÉN EL USO INMEDIATAMENTE',
      warning:
        'Se han detectado indicios de riesgo eléctrico severo (posible fallo térmico, cortocircuito o fuga en celdas de litio).',
      immediateActions: [
        'Desconecta el cargador de la red eléctrica si está enchufado, sin tocar cables sobrecalentados.',
        'Apaga la llave de contacto y baja la llave térmica principal (breaker) de la motocicleta.',
        'Ubica el vehículo en un espacio abierto, ventilado y lejos de materiales inflamables.',
        'PROHIBIDO TERMINANTEMENTE abrir, golpear, perforar o desarmar el pack de baterías de litio.',
        'No intentes encender la moto nuevamente hasta que un técnico especializado la evalúe.',
      ],
      referToTechnician: true,
    };
  }

  return null;
}

export function executeDiagnosticEvaluation(req) {
  const { symptom, brand = 'Genérica', model = 'Moto Eléctrica', userInput = '', answers = {} } = req;

  const safetyHazard = detectElectricalHazards(userInput);
  if (safetyHazard) {
    return {
      symptom: 'Riesgo eléctrico crítico detectado',
      reportedVehicle: `${brand} ${model}`,
      hypotheses: [
        {
          cause: 'Fallo térmico o cortocircuito de celdas / cableado de potencia',
          description:
            'Indicios reportados de calor excesivo, deformación de batería, chispas o emanación de gases.',
          probability: 'ALTA',
        },
      ],
      safeChecksPerformed: ['Evaluación inmediata de seguridad activa'],
      certainty: 'CONFIRMADO',
      recommendedAction:
        'Aislamiento preventivo del vehículo y derivación urgente a taller técnico autorizado.',
      safetyAlert: safetyHazard,
      recommendedParts: [],
      referToTechnician: true,
      referralReason: 'Riesgo inminente de ignición de litio o choque eléctrico.',
    };
  }

  let result;

  switch (symptom) {
    case 'no-enciende': {
      const breakerState = answers['breaker'] || 'desconocido';
      const displayState = answers['display'] || 'apagado';

      if (breakerState === 'abajo') {
        result = {
          symptom: 'La moto no enciende (Breaker principal desconectado)',
          reportedVehicle: `${brand} ${model}`,
          hypotheses: [
            {
              cause: 'Disyuntor térmico de tracción en posición OFF o disparado por sobrecorriente',
              description: 'El interruptor de protección debajo del asiento interrumpe el circuito maestro.',
              probability: 'ALTA',
            },
          ],
          safeChecksPerformed: [
            'Revisión visual de la llave térmica debajo del compartimento de carga',
          ],
          certainty: 'CONFIRMADO',
          recommendedAction:
            'Sube la llave térmica principal a la posición ON y verifica si el panel enciende.',
          recommendedParts: [],
          referToTechnician: false,
        };
        break;
      }

      if (displayState === 'enciende_pero_no_acelera') {
        const brakeCheck = answers['switch_freno'] || 'no_probado';
        result = {
          symptom: 'Pantalla enciende pero el motor no responde al acelerar',
          reportedVehicle: `${brand} ${model}`,
          hypotheses: [
            {
              cause: 'Microswitch de corte de freno trabado o pata de apoyo lateral (caballete) activo',
              description:
                'El controlador corta la señal de tracción como medida de seguridad cuando detecta freno accionado.',
              probability: 'ALTA',
            },
            {
              cause: 'Fallo en sensor Hall de maneta de acelerador (0.8V a 4.2V ausente)',
              description: 'El cableado de señal o el imán interno del acelerador está desalineado o desconectado.',
              probability: 'MEDIA',
            },
          ],
          safeChecksPerformed: [
            'Comprobación de luz de freno trasera (si queda encendida fija sin presionar la maneta)',
            'Verificación de sensor de caballete lateral',
          ],
          certainty: brakeCheck === 'luz_fija' ? 'CONFIRMADO' : 'PROBABLE',
          recommendedAction:
            'Inspecciona las manetas de freno y suéltalas para comprobar si la luz de freno se apaga. Si el microswitch está dañado, se requiere reemplazo de la maneta con corte.',
          recommendedParts: [
            {
              sku: 'MS-BRK-REGEN-SET',
              name: 'Kit de Frenos Hidráulicos con Switch de Corte Eléctrico',
              category: 'Frenos y Regeneración',
              price: 320,
              currency: 'PEN',
              inStock: true,
              isDirectSale: true,
              rationale:
                'Si el microswitch de la maneta de freno se queda pegado, envía señal continua de corte al controlador impidiendo que el acelerador responda.',
            },
          ],
          referToTechnician: false,
        };
        break;
      }

      result = {
        symptom: 'La moto no enciende en absoluto (Sistema completamente inerte)',
        reportedVehicle: `${brand} ${model}`,
        hypotheses: [
          {
            cause: 'Descarga profunda de la batería o bloqueo por bajo voltaje del BMS',
            description:
              'Si la tensión cae por debajo del umbral de corte de seguridad (LVC), el BMS apaga la salida para proteger las celdas.',
            probability: 'ALTA',
          },
          {
            cause: 'Convertidor DC-DC 12V inoperativo o fusible de línea de accesorios quemado',
            description: 'La instrumentación de baja tensión no recibe los 12V necesarios para iluminar la pantalla.',
            probability: 'MEDIA',
          },
        ],
        safeChecksPerformed: [
          'Comprobación del breaker de potencia',
          'Inspección del puerto de carga',
        ],
        certainty: 'PROBABLE',
        recommendedAction:
          'Conecta el cargador oficial durante al menos 30 minutos y observa el LED indicador. Si el cargador no reacciona, mide el voltaje de la batería en bornes con un multímetro.',
        recommendedParts: [
          {
            sku: 'MS-DCDC-72V12V',
            name: 'Convertidor DC-DC 36V-72V a 12V 20A Aislado',
            category: 'Cableado y Sensores',
            price: 140,
            currency: 'PEN',
            inStock: true,
            isDirectSale: true,
            rationale: 'Restaura la alimentación de 12V para tablero, luces y bocina en motos de 48V-72V.',
          },
        ],
        referToTechnician: false,
      };
      break;
    }

    case 'perdida-potencia': {
      result = {
        symptom: 'Pérdida de potencia o tironeo al acelerar',
        reportedVehicle: `${brand} ${model}`,
        hypotheses: [
          {
            cause: 'Caída de tensión (Voltage Sag) bajo carga por alta resistencia interna de la batería',
            description:
              'Al demandar alto amperaje de aceleración, el voltaje cae por debajo del umbral del controlador provocando cortes temporales.',
            probability: 'ALTA',
          },
          {
            cause: 'Desconexión o falso contacto en una de las 3 fases del motor o sensores Hall',
            description:
              'Un cable de fase recalentado en la bornera genera vibración, zumbido fuerte y falta de torque.',
            probability: 'MEDIA',
          },
        ],
        safeChecksPerformed: [
          'Observación del indicador de batería durante aceleración en marcha vs detenida',
          'Inspección visual de conectores de fase de motor (amarillo, verde, azul)',
        ],
        certainty: 'PROBABLE',
        recommendedAction:
          'Verifica si el medidor de batería baja bruscamente al acelerar a fondo. Si cae más de 4-6 voltios, el pack de baterías requiere balanceo o reemplazo de celdas fatigadas.',
        recommendedParts: [
          {
            sku: 'MS-CTRL-VOTOL-EM100',
            name: 'Controlador Senoidal VOTOL EM-100/2 72V',
            category: 'Controladores y ESC',
            price: 680,
            currency: 'PEN',
            inStock: true,
            isDirectSale: true,
            rationale:
              'Controlador de alta eficiencia con disipación de calor superior y gestión senoidal suave sin tironeos.',
          },
        ],
        referToTechnician: false,
      };
      break;
    }

    case 'bateria-descarga-rapido': {
      result = {
        symptom: 'Autonomía notablemente reducida / Se descarga rápido',
        reportedVehicle: `${brand} ${model}`,
        hypotheses: [
          {
            cause: 'Desbalance severo entre grupos de celdas o degradación química de capacidad',
            description:
              'Una sola serie de celdas que llegue prematuramente al corte de bajo voltaje provocará que el BMS corte toda la batería.',
            probability: 'ALTA',
          },
          {
            cause: 'Batería de plomo-gel sulfatada o alcanzando su fin de ciclo de vida',
            description: 'Las baterías de plomo tradicionales sufren pérdida exponencial de autonomía tras descargas profundas.',
            probability: 'ALTA',
          },
        ],
        safeChecksPerformed: [
          'Comprobación de giro libre de rueda con la moto en caballete central',
          'Conteo de meses de uso y ciclos de carga de la batería actual',
        ],
        certainty: 'PROBABLE',
        recommendedAction:
          'Gira ambas ruedas manualmente en el aire para descartar freno rozando. Si giran libres, la batería ha perdido capacidad útil y se recomienda migrar a un pack de litio con BMS inteligente.',
        recommendedParts: [
          {
            sku: 'MS-BAT-72V45AH',
            name: 'Pack Batería Litio Smart NMC 72V 45Ah',
            category: 'Baterías y BMS',
            price: 3450,
            currency: 'PEN',
            inStock: true,
            isDirectSale: true,
            rationale:
              'Pack de litio con BMS Bluetooth para monitorear el balance exacto de cada celda y triplicar la autonomía respecto a plomo.',
          },
        ],
        referToTechnician: false,
      };
      break;
    }

    case 'cargador-no-carga': {
      result = {
        symptom: 'El cargador no carga o enciende luz verde fija sin pasar corriente',
        reportedVehicle: `${brand} ${model}`,
        hypotheses: [
          {
            cause: 'Fusible interno del puerto de carga de la moto quemado',
            description: 'Muchos modelos tienen un fusible aéreo de 10A-15A en la línea del enchufe de carga.',
            probability: 'ALTA',
          },
        ],
        safeChecksPerformed: [
          'Inspección de pines del enchufe de carga (sin sulfato ni quemaduras)',
          'Verificación de encendido del ventilador interno del cargador al conectar',
        ],
        certainty: 'PROBABLE',
        recommendedAction:
          'Inspecciona el fusible del conector de carga de la moto. Si el fusible está intacto y el cargador no enciende su ventilador, el cargador o su cable están dañados.',
        recommendedParts: [
          {
            sku: 'MS-CHG-72V8A-FAST',
            name: 'Cargador Inteligente de Aluminio 72V (84V max) 8A',
            category: 'Baterías y BMS',
            price: 490,
            currency: 'PEN',
            inStock: true,
            isDirectSale: true,
            rationale:
              'Cargador de aleación de aluminio con disipación activa termorregulada, curva CC/CV y corte automático al 100%.',
          },
        ],
        referToTechnician: false,
      };
      break;
    }

    case 'fallo-intermitente': {
      result = {
        symptom: 'Cortes intermitentes de aceleración o apagados repentinos en marcha',
        reportedVehicle: `${brand} ${model}`,
        hypotheses: [
          {
            cause: 'Microcorte en switch de maneta de freno o falso contacto en sensor Hall',
            description: 'Vibraciones en baches provocan activación espuria del circuito de corte.',
            probability: 'ALTA',
          },
          {
            cause: 'Caída de voltaje momentánea por desbalance que activa protección BMS',
            description: 'Bajo demanda repentina de corriente, el BMS interrumpe la salida por milisegundos.',
            probability: 'MEDIA',
          },
        ],
        safeChecksPerformed: [
          'Inspección de holgura en manetas de freno y cableado de manillar',
          'Revisión de apriete en bornes de disyuntor térmico',
        ],
        certainty: 'PROBABLE',
        recommendedAction:
          'Verifica si el corte coincide con baches o frenadas leves. Se recomienda ajuste de microswitch o revisión de cableado de señal.',
        recommendedParts: [
          {
            sku: 'MS-BRK-REGEN-SET',
            name: 'Kit de Frenos Hidráulicos con Switch de Corte Eléctrico',
            category: 'Frenos y Regeneración',
            price: 320,
            currency: 'PEN',
            inStock: true,
            isDirectSale: true,
            rationale: 'Reemplaza switches sulfatados o con holgura que causan cortes de acelerador intermitentes.',
          },
        ],
        referToTechnician: false,
      };
      break;
    }

    case 'compatibilidad-duda':
    default: {
      result = {
        symptom: 'Evaluación de compatibilidad técnica de componentes',
        reportedVehicle: `${brand} ${model}`,
        hypotheses: [
          {
            cause: 'Necesidad de contrastar voltaje nominal, protocolo de comunicación y tipo de química',
            description:
              'Los controladores y baterías deben coincidir en rango de tensión y límites de amperaje continuo/pico.',
            probability: 'ALTA',
          },
        ],
        safeChecksPerformed: [
          'Consulta en la matriz de compatibilidades publicadas de MOTOSERVICE',
        ],
        certainty: 'NO_CONCLUYENTE',
        recommendedAction:
          'Verifica la placa técnica de tu moto indicando voltaje (48V, 60V, 72V) y tipo de conector antes de comprar.',
        recommendedParts: [
          {
            sku: FEATURED_PARTS[0].sku,
            name: FEATURED_PARTS[0].name,
            category: 'Baterías y BMS',
            price: FEATURED_PARTS[0].price,
            currency: FEATURED_PARTS[0].currency,
            inStock: true,
            isDirectSale: true,
            rationale: 'Componente destacado de tracción con verificación técnica disponible.',
          },
        ],
        referToTechnician: true,
        referralReason: 'Se requiere confirmación de variante física o ficha técnica del fabricante.',
      };
      break;
    }
  }

  // Verificación autónoma de repuestos directos en catálogo ("por dependencia propia")
  const hasDirectParts = hasDirectCompatibleParts(brand, model);
  if (!hasDirectParts) {
    const isGenericOrUnset =
      !brand ||
      !model ||
      brand.toLowerCase() === 'genérica' ||
      model.toLowerCase() === 'moto eléctrica' ||
      model.toLowerCase() === 'modelo general' ||
      model.toLowerCase() === 'consulta directa';

    const vehicleLabel = isGenericOrUnset ? 'tu modelo de moto eléctrica' : `${brand} ${model}`;

    const adaptationNotice = {
      isCustomAdaptation: true,
      title: 'Adaptación Técnica en Taller Autorizado MotoService',
      description: `No contamos con repuesto original plug-and-play de fábrica para ${vehicleLabel}. Actuando con autonomía técnica, VoltIA ha identificado componentes alternativos de tracción compatibles mediante adaptación certificada en taller autorizado MotoService.`,
      suggestedModifications: [
        'Acondicionamiento y remapeo de conectores de arnés eléctrico / señal Hall.',
        'Ajuste mecánico de soportes, bandeja de batería o anclajes de controlador.',
        'Calibración de voltajes de corte (LVC) y curva de aceleración en taller autorizado.'
      ],
      workshopRecommendation: 'Para conservar la seguridad del vehículo y la garantía del componente, la adaptación e instalación debe realizarse en un taller autorizado MotoService.'
    };

    // Si el síntoma no arrojó repuestos, seleccionamos el componente idóneo para adaptación
    let recommendedParts = (result.recommendedParts && result.recommendedParts.length > 0)
      ? result.recommendedParts
      : [
          {
            sku: 'MS-CTRL-VOTOL-EM100',
            name: 'Controlador Senoidal VOTOL EM-100/2 72V (Universal Adaptable)',
            category: 'Controladores y ESC',
            price: 680,
            currency: 'PEN',
            inStock: true,
            isDirectSale: true,
            rationale: 'Controlador senoidal con parámetros reprogramables para adaptarse a motores y voltajes de diversos fabricantes.',
          }
        ];

    result.recommendedParts = recommendedParts.map((p) => ({
      ...p,
      isAdaptation: true,
      workshopModificationRequired: true,
      workshopNotes: 'Requiere adaptación de conectores, reprogramación de curvas o ajuste de anclaje físico en taller autorizado MotoService.',
    }));

    result.adaptationNotice = adaptationNotice;
    result.referToTechnician = true;
    result.referralReason = 'Adaptación técnica en taller autorizado requerida para modelo sin repuestos directos de fábrica.';
    result.recommendedAction = `VoltIA ha seleccionado repuestos adaptables para ${vehicleLabel}. Para garantizar un funcionamiento seguro y conservar la garantía comercial, la modificación e instalación debe realizarse en un taller autorizado MotoService.`;
  }

  return result;
}
