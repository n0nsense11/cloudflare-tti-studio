/**
 * Cloudflare Workers AI - Text-to-Image Studio
 * 支持全部10个文生图模型
 * @version 2.1.0
 */

// import html template
import HTML from './index.html';

// ─── 可用模型列表（共9个）──────────────────────────────────────────────
const AVAILABLE_MODELS = [
  {
    id: 'flux-2-klein-4b',
    name: 'FLUX.2 klein 4B',
    description: '高速蒸馏版，4B参数，适合实时预览、快速生成',
    provider: '@cf/black-forest-labs/flux-2-klein-4b',
    transport: 'multipart',
    outputType: 'png',
    defaultWidth: 1024,
    defaultHeight: 1024,
    maxWidth: 1024,
    maxHeight: 1024,
    supportsWidth: true,
    supportsHeight: true,
    supportsSteps: false,
    supportsGuidance: false,
    supportsSeed: false,
    supportsNegativePrompt: false,
    supportsImg2Img: false,
    supportsInpainting: false,
  },
  {
    id: 'flux-2-klein-9b',
    name: 'FLUX.2 klein 9B',
    description: '增强质量版，9B参数，速度稍慢但质量更高',
    provider: '@cf/black-forest-labs/flux-2-klein-9b',
    transport: 'multipart',
    outputType: 'png',
    defaultWidth: 1024,
    defaultHeight: 1024,
    maxWidth: 1024,
    maxHeight: 1024,
    supportsWidth: true,
    supportsHeight: true,
    supportsSteps: false,
    supportsGuidance: false,
    supportsSeed: false,
    supportsNegativePrompt: false,
    supportsImg2Img: false,
    supportsInpainting: false,
  },
  {
    id: 'flux-2-dev',
    name: 'FLUX.2 dev',
    description: '最高输出质量，开放权重，适合追求最佳效果',
    provider: '@cf/black-forest-labs/flux-2-dev',
    transport: 'multipart',
    outputType: 'png',
    defaultWidth: 1024,
    defaultHeight: 1024,
    maxWidth: 1024,
    maxHeight: 1024,
    supportsWidth: true,
    supportsHeight: true,
    supportsSteps: false,
    supportsGuidance: false,
    supportsSeed: false,
    supportsNegativePrompt: false,
    supportsImg2Img: false,
    supportsInpainting: false,
  },
  {
    id: 'flux-1-schnell',
    name: 'FLUX.1 schnell',
    description: '12B参数，极快4步生成，适合批量',
    provider: '@cf/black-forest-labs/flux-1-schnell',
    transport: 'json',
    outputType: 'jpg',
    defaultWidth: 1024,
    defaultHeight: 1024,
    maxWidth: 1024,
    maxHeight: 1024,
    supportsWidth: false,
    supportsHeight: false,
    supportsSteps: true,
    supportsGuidance: false,
    supportsSeed: false,
    supportsNegativePrompt: false,
    supportsImg2Img: false,
    supportsInpainting: false,
    stepsRange: [1, 8],
    defaultSteps: 4,
  },
  {
    id: 'stable-diffusion-xl-lightning',
    name: 'SDXL-Lightning',
    description: '极快几步生成，ByteDance出品，高质量 · 🆓 免费',
    provider: '@cf/bytedance/stable-diffusion-xl-lightning',
    transport: 'json',
    outputType: 'jpg',
    defaultWidth: 1024,
    defaultHeight: 1024,
    maxWidth: 1024,
    maxHeight: 1024,
    supportsWidth: true,
    supportsHeight: true,
    supportsSteps: true,
    supportsGuidance: true,
    supportsSeed: true,
    supportsNegativePrompt: true,
    supportsImg2Img: false,
    supportsInpainting: false,
    stepsRange: [1, 8],
    defaultSteps: 4,
    defaultGuidance: 7.5,
  },
  {
    id: 'dreamshaper-8-lcm',
    name: 'DreamShaper 8 LCM',
    description: '强逼真写实风格，不牺牲创意范围，LCM加速 · 🆓 免费',
    provider: '@cf/lykon/dreamshaper-8-lcm',
    transport: 'json',
    outputType: 'jpg',
    defaultWidth: 1024,
    defaultHeight: 1024,
    maxWidth: 1024,
    maxHeight: 1024,
    supportsWidth: true,
    supportsHeight: true,
    supportsSteps: true,
    supportsGuidance: true,
    supportsSeed: true,
    supportsNegativePrompt: true,
    supportsImg2Img: false,
    supportsInpainting: false,
    stepsRange: [1, 12],
    defaultSteps: 6,
    defaultGuidance: 7.5,
  },
  {
    id: 'stable-diffusion-xl-base-1.0',
    name: 'SDXL Base 1.0',
    description: 'Stability AI 官方 SDXL 基座模型，适合追求标准质量 · 🆓 免费',
    provider: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
    transport: 'json',
    outputType: 'jpg',
    defaultWidth: 1024,
    defaultHeight: 1024,
    maxWidth: 2048,
    maxHeight: 2048,
    supportsWidth: true,
    supportsHeight: true,
    supportsSteps: true,
    supportsGuidance: false,
    supportsSeed: false,
    supportsNegativePrompt: true,
    supportsImg2Img: false,
    supportsInpainting: false,
    stepsRange: [1, 20],
    defaultSteps: 20,
  },
  {
    id: 'stable-diffusion-v1-5-img2img',
    name: 'SD v1.5 img2img',
    description: '经典SD 1.5，以图生新图，支持image_b64输入 · 🆓 免费',
    provider: '@cf/runwayml/stable-diffusion-v1-5-img2img',
    transport: 'json',
    outputType: 'png',
    defaultWidth: 512,
    defaultHeight: 512,
    maxWidth: 2048,
    maxHeight: 2048,
    supportsWidth: true,
    supportsHeight: true,
    supportsSteps: true,
    supportsGuidance: true,
    supportsSeed: true,
    supportsNegativePrompt: true,
    supportsImg2Img: true,
    supportsInpainting: false,
    stepsRange: [1, 50],
    defaultSteps: 20,
    defaultGuidance: 7.5,
  },
  {
    id: 'phoenix-1.0',
    name: 'Leonardo Phoenix 1.0',
    description: '最佳文字生成，提示词adherence最强',
    provider: '@cf/leonardo/phoenix-1.0',
    transport: 'json',
    outputType: 'jpg',
    defaultWidth: 1024,
    defaultHeight: 1024,
    maxWidth: 2048,
    maxHeight: 2048,
    supportsWidth: true,
    supportsHeight: true,
    supportsSteps: true,
    supportsGuidance: true,
    supportsSeed: true,
    supportsNegativePrompt: true,
    supportsImg2Img: false,
    supportsInpainting: false,
    stepsRange: [1, 50],
    defaultSteps: 25,
    defaultGuidance: 2,
  },
];

// 修正：Lucid Origin 实际 provider ID
const MODEL_PROVIDER_MAP = {};

// 随机提示词库
const RANDOM_PROMPTS = [
  'a massive ancient treehouse village built into a giant sequoia, sunset golden hour, Studio Ghibli style',
  'a cyberpunk street food stall in neon-lit Tokyo alley, steam rising, rain reflections, cinematic',
  'a sleeping cat curled up on a stack of colorful wool blankets, soft morning light, cozy atmosphere',
  'underwater art deco city with glass domes and bioluminescent jellyfish floating through the halls',
  'a lone astronaut tending a wildflower garden on the lunar surface, Earth visible in the sky',
  'Art Deco poster style: a roaring 1920s jazz club with geometric patterns, gold and black palette',
  'a giant owl made of intricate stained glass, sunlight passing through creating rainbow patterns on the floor',
  'cozy autumn cabin interior, warm fireplace glow, books scattered, wind howling outside, hyperrealistic',
  'a mechanical hummingbird with copper gears and jeweled feathers, hovering over a brass telescope',
  'floating islands connected by rope bridges, waterfalls cascading into clouds below, epic fantasy landscape',
];

// 访问密码（留空数组则无需密码）
const PASSWORDS = [];

// ─── 工具函数 ───────────────────────────────────────────────────────────

/**
 * base64 字符串转 Uint8Array
 */
function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * 获取模型的真实 provider ID
 */
function getModelProvider(modelId) {
  return MODEL_PROVIDER_MAP[modelId] ||
    AVAILABLE_MODELS.find(m => m.id === modelId)?.provider ||
    null;
}

/**
 * 构建指定模型的输入参数
 */
function buildModelInputs(modelId, data, modelDef) {
  const { transport } = modelDef;

  // FLUX.2 系列 - 需要通过 FormData 发送（不是 JSON body）
  if (modelId.startsWith('flux-2-')) {
    const fd = new FormData();
    fd.append('prompt', data.prompt || 'cyberpunk cat');
    fd.append('width', String(data.width || modelDef.defaultWidth));
    fd.append('height', String(data.height || modelDef.defaultHeight));
    // 传 { multipart: { body: ReadableStream, contentType: string } }
    const formResponse = new Response(fd);
    return {
      multipart: {
        body: formResponse.body,
        contentType: formResponse.headers.get('content-type'),
      },
    };
  }

  // JSON 传输模型
  const inputs = { prompt: data.prompt || 'cyberpunk cat' };

  if (modelId === 'flux-1-schnell') {
    let steps = parseInt(data.num_steps) || modelDef.defaultSteps || 4;
    steps = Math.max(1, Math.min(8, steps));
    inputs.steps = steps;
    return inputs;
  }

  // SDXL-Lightning / DreamShaper / SD v1.5 / Phoenix
  if (modelDef.supportsWidth) {
    inputs.width = data.width || modelDef.defaultWidth;
  }
  if (modelDef.supportsHeight) {
    inputs.height = data.height || modelDef.defaultHeight;
  }
  if (modelDef.supportsSteps) {
    const maxSteps = modelDef.stepsRange ? modelDef.stepsRange[1] : 50;
    inputs.num_steps = Math.min(maxSteps, parseInt(data.num_steps) || modelDef.defaultSteps || 20);
  }
  if (modelDef.supportsGuidance) {
    inputs.guidance = parseFloat(data.guidance || modelDef.defaultGuidance || 7.5);
  }
  if (modelDef.supportsSeed) {
    inputs.seed = parseInt(data.seed) || Math.floor(Math.random() * 1024 * 1024);
  }
  if (modelDef.supportsNegativePrompt) {
    // Leonardo Phoenix 要求 negative_prompt 长度 >= 1
    inputs.negative_prompt = data.negative_prompt || 'none';
  }

  // img2img
  if (modelDef.supportsImg2Img && data.image_b64) {
    inputs.image_b64 = data.image_b64;
    inputs.strength = parseFloat(data.strength || 1);
  }

  // inpainting
  if (modelDef.supportsInpainting && data.image_b64 && data.mask_b64) {
    inputs.image_b64 = data.image_b64;
    inputs.mask_b64 = data.mask_b64;
    inputs.strength = parseFloat(data.strength || 1);
  }

  return inputs;
}

/**
 * 处理 AI 响应，返回 { imageData: Uint8Array, contentType: string }
 */
async function processAIResponse(modelId, response, modelDef) {
  // DreamShaper / SDXL-Lightning 等：
  // env.AI.run() 返回原生二进制（ReadableStream），直接返回
  if (response instanceof ArrayBuffer || (response && typeof response.arrayBuffer === 'function')) {
    const buf = response instanceof ArrayBuffer ? response : await response.arrayBuffer();
    if (buf.byteLength === 0) throw new Error(`Empty binary response for ${modelId}`);
    const contentType = modelDef.outputType === 'png' ? 'image/png' : 'image/jpeg';
    return { imageData: new Uint8Array(buf), contentType };
  }

  // flux-1-schnell / FLUX.2 — 返回 JSON { image: "base64..." }
  if (modelId === 'flux-1-schnell' || modelId.startsWith('flux-2-')) {
    let resObj = typeof response === 'string' ? JSON.parse(response) : response;
    const img = resObj.result?.image || resObj.image;
    if (!img) throw new Error(`Invalid JSON response for ${modelId}`);
    const contentType = modelId === 'flux-1-schnell' ? 'image/jpeg' : 'image/png';
    return { imageData: base64ToUint8Array(img), contentType };
  }

  // 兜底：尝试多种可能的响应结构
  let resObj = typeof response === 'string' ? JSON.parse(response) : response;
  // 尝试所有可能的图片字段路径
  const img =
    resObj.result?.image ||
    resObj.image ||
    resObj.output?.image ||
    resObj.result?.output?.image ||
    resObj.data?.image ||
    resObj.generations?.[0]?.image ||
    resObj.images?.[0];
  if (img) {
    // 如果是 Uint8Array（原生二进制），直接返回
    if (img instanceof Uint8Array) {
      return { imageData: img, contentType: 'image/jpeg' };
    }
    return { imageData: base64ToUint8Array(img), contentType: 'image/jpeg' };
  }
  // 记录无法解析的响应结构，供调试
  console.log(`[TTI] Unknown response structure for ${modelId}:`, JSON.stringify(Object.keys(resObj)));
  throw new Error(`No image data in response for ${modelId}`);
}

// ─── CORS 头 ───────────────────────────────────────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ─── Worker 主入口 ──────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const originalHost = request.headers.get('host') || 'localhost';

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // ── GET /api/models — 返回模型列表
      if (path === '/api/models' && request.method === 'GET') {
        const modelsForClient = AVAILABLE_MODELS.map(m => ({
          id: m.id,
          name: m.name,
          description: m.description,
          outputType: m.outputType,
          defaultWidth: m.defaultWidth,
          defaultHeight: m.defaultHeight,
          maxWidth: m.maxWidth,
          maxHeight: m.maxHeight,
          supportsWidth: m.supportsWidth,
          supportsHeight: m.supportsHeight,
          supportsSteps: m.supportsSteps,
          supportsGuidance: m.supportsGuidance,
          supportsSeed: m.supportsSeed,
          supportsNegativePrompt: m.supportsNegativePrompt,
          supportsImg2Img: m.supportsImg2Img || false,
          supportsInpainting: m.supportsInpainting || false,
          stepsRange: m.stepsRange || null,
          defaultSteps: m.defaultSteps || null,
          defaultGuidance: m.defaultGuidance || null,
        }));
        return new Response(JSON.stringify(modelsForClient), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      // ── GET /api/prompts — 返回随机提示词
      if (path === '/api/prompts' && request.method === 'GET') {
        return new Response(JSON.stringify(RANDOM_PROMPTS), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      // ── POST /api/generate — 生成图片
      if (path === '/api/generate' && request.method === 'POST') {
        let data;
        try {
          data = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }

        // 密码校验
        if (PASSWORDS.length > 0 &&
          (!data.password || !PASSWORDS.includes(data.password))) {
          return new Response(JSON.stringify({ error: 'Invalid or missing password' }), {
            status: 403,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }

        if (!data.prompt || !data.model) {
          return new Response(JSON.stringify({ error: 'Missing required fields: prompt, model' }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }

        const modelDef = AVAILABLE_MODELS.find(m => m.id === data.model);
        if (!modelDef) {
          return new Response(JSON.stringify({ error: `Unknown model: ${data.model}` }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }

        const provider = getModelProvider(data.model);
        const inputs = buildModelInputs(data.model, data, modelDef);

        console.log(`[TTI] Model: ${provider}, Prompt: ${inputs.prompt?.substring(0, 50)}...`);

        let aiResponse;
        try {
          aiResponse = await env.AI.run(provider, inputs);
          const aType = typeof aiResponse;
          const aIsArrBuf = aiResponse instanceof ArrayBuffer;
          const aHasArrBuf = aiResponse && typeof aiResponse.arrayBuffer === 'function';
          console.log(`[TTI] AI response type: ${aType}, isArrBuf: ${aIsArrBuf}, hasArrBuf: ${aHasArrBuf}`);
        } catch (err) {
          console.error('[TTI] AI run error:', err);
          return new Response(JSON.stringify({ error: 'AI generation failed', details: err.message }), {
            status: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }

        // ── 处理不同模型的响应格式 ──
        // flux-1-schnell / FLUX.2：返回 JSON { image: "base64..." }，需要解析
        if (data.model === 'flux-1-schnell' || data.model.startsWith('flux-2-')) {
          const { imageData } = await processAIResponse(data.model, aiResponse, modelDef);
          const ct = data.model === 'flux-1-schnell' ? 'image/jpeg' : 'image/png';
          return new Response(imageData, {
            headers: { ...CORS_HEADERS, 'Content-Type': ct, 'Cache-Control': 'no-store' },
          });
        }

        // DreamShaper / SDXL-Lightning / SD v1.5 / Lucid Origin 等：
        // env.AI.run() 返回原生二进制（ReadableStream），直接返回，不需要 JSON 解析
        // 参考项目 huarzone/Text2img-Cloudflare-Workers 的处理方式
        const contentType = modelDef.outputType === 'png' ? 'image/png' : 'image/jpeg';
        return new Response(aiResponse, {
          headers: { ...CORS_HEADERS, 'Content-Type': contentType, 'Cache-Control': 'no-store' },
        });
      }

      // ── GET / — 返回 HTML 页面
      if (path.endsWith('.html') || path === '/') {
        const html = HTML.replace(/\{\{host\}\}/g, originalHost);
        return new Response(html, {
          headers: { ...CORS_HEADERS, 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      return new Response('Not Found', { status: 404 });
    } catch (err) {
      console.error('[Worker] Unhandled error:', err);
      return new Response(JSON.stringify({ error: 'Internal server error', details: err.message }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
  },
};
