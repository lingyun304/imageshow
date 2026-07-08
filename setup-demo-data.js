import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to write a sidecar JSON metadata file
function writeSidecarJson(destPath, promptText, negPromptText, steps, cfg, sampler, scheduler, seed, model, width, height) {
  const promptGraph = {
    "3": {
      "inputs": {
        "seed": seed,
        "steps": steps,
        "cfg": cfg,
        "sampler_name": sampler,
        "scheduler": scheduler,
        "denoise": 1,
        "model": ["4", 0],
        "positive": ["6", 0],
        "negative": ["7", 0],
        "latent_image": ["5", 0]
      },
      "class_type": "KSampler"
    },
    "4": {
      "inputs": {
        "ckpt_name": model
      },
      "class_type": "CheckpointLoaderSimple"
    },
    "5": {
      "inputs": {
        "width": width,
        "height": height,
        "batch_size": 1
      },
      "class_type": "EmptyLatentImage"
    },
    "6": {
      "inputs": {
        "text": promptText,
        "clip": ["4", 1]
      },
      "class_type": "CLIPTextEncode"
    },
    "7": {
      "inputs": {
        "text": negPromptText,
        "clip": ["4", 1]
      },
      "class_type": "CLIPTextEncode"
    },
    "8": {
      "inputs": {
        "samples": ["3", 0],
        "vae": ["4", 2]
      },
      "class_type": "VAEDecode"
    },
    "9": {
      "inputs": {
        "filename_prefix": "ComfyUI",
        "images": ["8", 0]
      },
      "class_type": "SaveImage"
    }
  };
  
  const workflow = {
    "last_node_id": 9,
    "last_link_id": 9,
    "nodes": [
      { "id": 3, "type": "KSampler", "properties": {} },
      { "id": 4, "type": "CheckpointLoaderSimple", "properties": {} },
      { "id": 5, "type": "EmptyLatentImage", "properties": {} },
      { "id": 6, "type": "CLIPTextEncode", "properties": {} },
      { "id": 7, "type": "CLIPTextEncode", "properties": {} },
      { "id": 8, "type": "VAEDecode", "properties": {} },
      { "id": 9, "type": "SaveImage", "properties": {} }
    ]
  };
  
  const payload = {
    prompt: promptGraph,
    workflow: workflow
  };
  
  fs.writeFileSync(destPath, JSON.stringify(payload, null, 2));
  console.log(`📝 Wrote sidecar JSON: ${destPath}`);
}

function processImage(srcPath, destImgPath, destJsonPath, promptText, negPromptText, steps, cfg, sampler, scheduler, seed, model, width, height) {
  if (!fs.existsSync(srcPath)) {
    console.error(`Source file not found: ${srcPath}`);
    return;
  }
  
  // Ensure the target directory exists
  fs.mkdirSync(path.dirname(destImgPath), { recursive: true });
  
  // Copy the image file
  fs.copyFileSync(srcPath, destImgPath);
  console.log(`📸 Copied image to: ${destImgPath}`);
  
  // Write the sidecar metadata JSON
  writeSidecarJson(destJsonPath, promptText, negPromptText, steps, cfg, sampler, scheduler, seed, model, width, height);
}

// Locate generated brain files
const brainDir = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\941e3d34-264f-475f-bb76-755f1133f07f';
if (!fs.existsSync(brainDir)) {
  console.error(`Brain directory not found at ${brainDir}`);
  process.exit(1);
}

const files = fs.readdirSync(brainDir);

const cyberpunkSrc = files.find(f => f.startsWith('cyberpunk_street') && f.endsWith('.png'));
const fantasySrc = files.find(f => f.startsWith('magic_forest') && f.endsWith('.png'));
const natureSrc = files.find(f => f.startsWith('mountain_lake') && f.endsWith('.png'));

if (cyberpunkSrc) {
  processImage(
    path.join(brainDir, cyberpunkSrc),
    path.join(__dirname, 'public', 'media', 'cyberpunk', 'cyberpunk_street.jpg'),
    path.join(__dirname, 'public', 'media', 'cyberpunk', 'cyberpunk_street.json'),
    'gorgeous cyberpunk city street at night, neon lights reflection on wet street pavement, futuristic high-tech vehicles, and cybernetic pedestrians, sleek glassmorphism style, cinematic, highly detailed',
    'blurry, lowres, monochrome, deformed, bad anatomy, bad lighting, text, watermark, bad quality, anime, illustration',
    30, 7.5, 'euler_ancestral', 'karras', 857392019482, 'cyberpunkRealistic_v20.safetensors', 1024, 1024
  );
} else {
  console.error('Cyberpunk image source file not found!');
}

if (fantasySrc) {
  processImage(
    path.join(brainDir, fantasySrc),
    path.join(__dirname, 'public', 'media', 'fantasy', 'magic_forest.jpg'),
    path.join(__dirname, 'public', 'media', 'fantasy', 'magic_forest.json'),
    'magical hidden forest sanctuary, glowing mushrooms, crystal clear river, mystical glowing tree of life in the center, ethereal fairy lights, ultra-detailed fantasy art, enchanting vibe',
    'modern buildings, concrete, cars, low quality, blurry, human, ugly, bad drawing, deformed, worst quality, monochrome',
    28, 6.0, 'dpmpp_2m', 'exponential', 482019483019, 'dreamshaper_v8.safetensors', 1024, 1024
  );
} else {
  console.error('Fantasy image source file not found!');
}

if (natureSrc) {
  processImage(
    path.join(brainDir, natureSrc),
    path.join(__dirname, 'public', 'media', 'nature', 'mountain_lake.jpg'),
    path.join(__dirname, 'public', 'media', 'nature', 'mountain_lake.json'),
    'majestic sun-kissed mountain range, clear alpine lake reflecting the snow-covered peaks, lush green pine forest, golden hour lighting, breathtaking landscape photography',
    'anime, cartoon, drawing, fake, oversaturated, city, structures, people, bad quality, blurry, watermark, signature',
    25, 7.0, 'dpmpp_sde', 'normal', 102948204918, 'sd_xl_base_1.0.safetensors', 1216, 832
  );
} else {
  console.error('Nature image source file not found!');
}
