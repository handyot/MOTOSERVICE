/**
 * MOTOSERVICE / NERO Electric Motors - Servicio Central de IA Conversacional VoltIA V1 (Core ESM)
 */

import { detectElectricalHazards } from './voltia-core.mjs';
import {
  executeSearchCatalog,
  executeCheckCompatibility,
  executeTrackOrder,
} from './voltia-ai-tools-core.mjs';

const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_MESSAGES = 8;
const MAX_TOOL_ITERATIONS = 3;

export const VOLTIA_SYSTEM_PROMPT = `Eres VoltIA, el asistente experto en electromovilidad, diagnóstico técnico y repuestos oficiales de NERO Electric Motors (Lima, Perú).

REGLAS DE CONDUCTA Y SEGURIDAD:
1. INFORMACIÓN AUTÉNTICA: Consulta siempre las herramientas disponibles ('search_catalog', 'check_compatibility', 'track_order') para obtener datos reales. NUNCA inventes productos, SKUs, precios, compatibilidades ni pedidos.
2. SEGURIDAD ELÉCTRICA: NUNCA recomiendes abrir paquetes de baterías de litio, puentear fusibles/BMS, alterar voltajes sin regulador o realizar maniobras peligrosas. Si hay riesgo de incendio o daño, prioriza la seguridad y deriva a taller oficial.
3. COMPATIBILIDAD CON EVIDENCIA: No des por confirmada la compatibilidad solo porque dos componentes tengan el mismo voltaje. Si faltan datos (conector, dimensiones, química, corriente del controlador), pide al cliente los datos exactos que reduzcan la incertidumbre.
4. ESTILO Y TONO: Profesional, técnico, cercano y claro. Usa español neutro/peruano formal con unidades claras (V, Ah, W, km/h). Sé conciso en el chat para móviles.
5. DERIVACIÓN: Cuando un problema requiera intervención física con instrumental de taller, explica la razón técnica e invita a registrar la solicitud de asistencia técnica humana.`;

export const VOLTIA_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_catalog',
      description: 'Busca repuestos, componentes y motos eléctricas reales en el catálogo de NERO Electric Motors.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Término de búsqueda: nombre de repuesto, SKU, categoría o modelo.',
          },
          category: {
            type: 'string',
            description: 'Categoría opcional: baterias, controladores, cargadores, frenos, llantas, etc.',
          },
          voltage: {
            type: 'number',
            description: 'Voltaje nominal del componente en voltios (ej: 48, 60, 72).',
          },
          brand: {
            type: 'string',
            description: 'Marca del repuesto o vehículo (ej: TAILG, YADEA, GREENLINE, NERO Electric).',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_compatibility',
      description: 'Evalúa técnicamente la compatibilidad entre un modelo de vehículo eléctrico y un repuesto específico.',
      parameters: {
        type: 'object',
        properties: {
          brand: {
            type: 'string',
            description: 'Marca del vehículo (ej: TAILG, YADEA, GREENLINE, KAYENCORP).',
          },
          model: {
            type: 'string',
            description: 'Modelo comercial del vehículo (ej: Lion E5, F55 Mecha G2, M6 Pro).',
          },
          partSkuOrName: {
            type: 'string',
            description: 'SKU o nombre del repuesto a verificar (ej: MS-BAT-72V45AH, cargador 72v).',
          },
          voltage: {
            type: 'number',
            description: 'Voltaje del sistema en voltios para comprobar correspondencia eléctrica.',
          },
        },
        required: ['brand', 'model', 'partSkuOrName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'track_order',
      description: 'Consulta el estado logístico de un pedido del cliente de forma segura. Requiere autorización del servidor.',
      parameters: {
        type: 'object',
        properties: {
          orderNumber: {
            type: 'string',
            description: 'Código oficial del pedido (ejemplo: MS-2026-10001).',
          },
          guestToken: {
            type: 'string',
            description: 'Token de acceso seguro si el comprador fue invitado.',
          },
        },
        required: ['orderNumber'],
      },
    },
  },
];

/**
 * Pipeline principal de procesamiento de VoltIA
 */
export async function processVoltIAChat(
  req,
  securityContext = {},
  customFetch = fetch,
  toolOptions = {}
) {
  const rawMessage = (req.message || '').trim();

  // 1. Validaciones de entrada
  if (!rawMessage) {
    return {
      success: false,
      message: 'Por favor escribe tu consulta o síntoma para que VoltIA pueda asistirte.',
      isAiEnabled: false,
    };
  }

  if (rawMessage.length > MAX_MESSAGE_LENGTH) {
    return {
      success: false,
      message: `Tu mensaje excede el límite permitido de ${MAX_MESSAGE_LENGTH} caracteres. Por favor resume tu consulta.`,
      isAiEnabled: false,
    };
  }

  // 2. FASE DETERMINISTA DE SEGURIDAD ELÉCTRICA (PRIORIDAD ABSOLUTA)
  const hazardAlert = detectElectricalHazards(rawMessage);
  if (hazardAlert) {
    return {
      success: true,
      message: `${hazardAlert.title}\n\n${hazardAlert.warning}\n\nMedidas de emergencia inmediatas:\n${hazardAlert.immediateActions
        .map((a) => `• ${a}`)
        .join('\n')}\n\nPor favor, no intentes encender ni cargar el vehículo. Pulsa el botón «Solicitar Asistencia Técnica» para derivarte inmediatamente con un técnico certificado.`,
      safetyAlert: hazardAlert,
      suggestedQuestions: [
        '¿Cómo desconecto la batería con seguridad?',
        'Solicitar técnico a domicilio',
        'Ver talleres autorizados en Lima',
      ],
      isAiEnabled: true,
    };
  }

  // 3. Verificación de configuración de OpenAI en el servidor
  const apiKey = process.env.OPENAI_API_KEY;
  const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    return {
      success: false,
      message:
        'El asistente de IA VoltIA no está configurado en este entorno (falta la variable OPENAI_API_KEY). Puedes utilizar el diagnóstico rápido o solicitar soporte técnico con nuestro equipo.',
      isAiEnabled: false,
    };
  }

  // 4. Construcción del historial
  const messages = [{ role: 'system', content: VOLTIA_SYSTEM_PROMPT }];

  if (req.context?.brand || req.context?.model || req.context?.voltage) {
    messages.push({
      role: 'system',
      content: `Contexto del cliente en la tienda: Marca seleccionada: ${req.context.brand || 'No especificada'}, Modelo: ${
        req.context.model || 'No especificado'
      }, Voltaje: ${req.context.voltage ? `${req.context.voltage}V` : 'No especificado'}.`,
    });
  }

  const history = Array.isArray(req.history) ? req.history.slice(-MAX_HISTORY_MESSAGES) : [];
  for (const h of history) {
    if (typeof h.text === 'string' && h.text.trim()) {
      messages.push({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text.trim().slice(0, MAX_MESSAGE_LENGTH),
      });
    }
  }

  messages.push({ role: 'user', content: rawMessage });

  // 5. Ciclo de Tool Calling
  const toolCallsExecuted = [];
  const recommendedProducts = [];
  let iterations = 0;

  try {
    while (iterations < MAX_TOOL_ITERATIONS) {
      iterations++;

      const payload = {
        model: modelName,
        messages,
        tools: VOLTIA_TOOLS,
        tool_choice: 'auto',
        temperature: 0.2,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      let response;
      try {
        response = await customFetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`OpenAI API error [${response.status}]: ${errorText.slice(0, 200)}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const assistantMessage = choice?.message;

      if (!assistantMessage) {
        throw new Error('Respuesta inválida del proveedor de IA.');
      }

      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        return {
          success: true,
          message: assistantMessage.content || 'Sin respuesta generada.',
          recommendedProducts: recommendedProducts.slice(0, 4),
          suggestedQuestions: generateSuggestedQuestions(rawMessage, toolCallsExecuted),
          toolCallsExecuted,
          isAiEnabled: true,
        };
      }

      messages.push(assistantMessage);

      for (const call of assistantMessage.tool_calls) {
        const fnName = call.function?.name;
        let fnArgs = {};
        try {
          fnArgs = JSON.parse(call.function?.arguments || '{}');
        } catch {
          fnArgs = {};
        }

        toolCallsExecuted.push(fnName);
        let toolResult = { error: 'Herramienta no reconocida' };

        if (fnName === 'search_catalog') {
          toolResult = await executeSearchCatalog(fnArgs, toolOptions);
          if (toolResult.success && Array.isArray(toolResult.parts)) {
            recommendedProducts.push(...toolResult.parts);
          }
        } else if (fnName === 'check_compatibility') {
          toolResult = await executeCheckCompatibility(fnArgs, toolOptions);
        } else if (fnName === 'track_order') {
          toolResult = await executeTrackOrder(
            {
              orderNumber: fnArgs.orderNumber,
              guestToken: fnArgs.guestToken || req.context?.guestToken,
            },
            securityContext
          );
        } else {
          toolResult = { error: `Herramienta «${fnName}» no permitida en esta versión de VoltIA.` };
        }

        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(toolResult),
        });
      }
    }

    return {
      success: true,
      message: 'He procesado la consulta técnica con las herramientas del catálogo. ¿Deseas más detalles sobre algún componente específico?',
      recommendedProducts: recommendedProducts.slice(0, 4),
      suggestedQuestions: ['Ver repuestos en el catálogo', 'Hablar con un técnico'],
      toolCallsExecuted,
      isAiEnabled: true,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Error desconocido al contactar a VoltIA';
    return {
      success: false,
      message: 'No pudimos procesar tu consulta técnica con el modelo de IA en este momento. Intenta nuevamente en unos instantes o consulta directamente a soporte técnico.',
      error: errorMsg,
      isAiEnabled: true,
    };
  }
}

function generateSuggestedQuestions(userQuery, toolsExecuted) {
  const q = userQuery.toLowerCase();
  if (toolsExecuted.includes('search_catalog') || q.includes('bateria') || q.includes('cargador')) {
    return [
      '¿Qué garantía tienen estos repuestos?',
      '¿Incluyen servicio de instalación en taller?',
      '¿Cómo sé si mi cargador actual es compatible?',
    ];
  }
  if (toolsExecuted.includes('track_order') || q.includes('pedido')) {
    return [
      '¿Cuánto demora el despacho a domicilio?',
      '¿Dónde queda el almacén de recojo?',
      'Consultar otro pedido',
    ];
  }
  return [
    '¿Qué batería de litio es compatible con mi moto?',
    '¿Cómo saber si el controlador está fallando?',
    'Solicitar asistencia técnica especializada',
  ];
}
