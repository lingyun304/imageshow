import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, 'public', 'images');
const OUTPUT_FILE = path.join(__dirname, 'public', 'images-data.json');

// Parse PNG metadata (tEXt and iTXt chunks)
function parsePngMetadata(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    
    // Check PNG signature
    if (buffer.length < 8 || !buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) {
      return null;
    }
    
    const result = {};
    let offset = 8;
    
    while (offset < buffer.length) {
      if (offset + 8 > buffer.length) break;
      const length = buffer.readUInt32BE(offset);
      const type = buffer.toString('ascii', offset + 4, offset + 8);
      offset += 8;
      
      if (offset + length + 4 > buffer.length) break;
      
      const chunkData = buffer.subarray(offset, offset + length);
      
      if (type === 'tEXt') {
        const nullIdx = chunkData.indexOf(0);
        if (nullIdx !== -1) {
          const keyword = chunkData.toString('ascii', 0, nullIdx);
          const text = chunkData.toString('utf8', nullIdx + 1);
          result[keyword] = text;
        }
      } else if (type === 'iTXt') {
        const nullIdx1 = chunkData.indexOf(0);
        if (nullIdx1 !== -1) {
          const keyword = chunkData.toString('ascii', 0, nullIdx1);
          const compressionFlag = chunkData[nullIdx1 + 1];
          
          let nullIdx2 = chunkData.indexOf(0, nullIdx1 + 3);
          let nullIdx3 = chunkData.indexOf(0, nullIdx2 + 1);
          
          if (nullIdx2 !== -1 && nullIdx3 !== -1) {
            let textBuffer = chunkData.subarray(nullIdx3 + 1);
            if (compressionFlag === 1) {
              try {
                textBuffer = zlib.inflateSync(textBuffer);
              } catch (e) {
                // Ignore compression errors
              }
            }
            const text = textBuffer.toString('utf8');
            result[keyword] = text;
          }
        }
      } else if (type === 'IEND') {
        break;
      }
      
      offset += length + 4; // Skip chunk data + CRC (4 bytes)
    }
    
    return result;
  } catch (error) {
    console.error(`Error parsing PNG ${filePath}:`, error);
    return null;
  }
}

// Parse WebP XMP metadata
function parseWebpMetadata(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    if (buffer.length < 12) return null;
    
    const riff = buffer.toString('ascii', 0, 4);
    const webp = buffer.toString('ascii', 8, 12);
    if (riff !== 'RIFF' || webp !== 'WEBP') return null;
    
    const result = {};
    let offset = 12;
    
    while (offset < buffer.length) {
      if (offset + 8 > buffer.length) break;
      const type = buffer.toString('ascii', offset, offset + 4);
      const size = buffer.readUInt32BE(offset + 4);
      offset += 8;
      
      if (offset + size > buffer.length) break;
      
      if (type === 'XMP ') {
        const xmpStr = buffer.toString('utf8', offset, offset + size);
        
        // Parse ComfyUI parameters from XMP attributes
        const promptMatch = xmpStr.match(/comfyui:prompt="([^"]+)"/);
        if (promptMatch) {
          const decoded = promptMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
          result['prompt'] = decoded;
        }
        const workflowMatch = xmpStr.match(/comfyui:workflow="([^"]+)"/);
        if (workflowMatch) {
          const decoded = workflowMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
          result['workflow'] = decoded;
        }
      }
      
      offset += size + (size % 2); // WebP chunks are padded to even bytes
    }
    
    return result;
  } catch (e) {
    console.error(`Error parsing WebP ${filePath}:`, e);
    return null;
  }
}

// Extract parameters from ComfyUI prompt graph
function extractComfyuiParams(rawMetadata) {
  if (!rawMetadata) return { hasMetadata: false };
  
  let promptGraph = null;
  let workflow = null;
  
  if (rawMetadata.prompt) {
    try {
      promptGraph = typeof rawMetadata.prompt === 'string' ? JSON.parse(rawMetadata.prompt) : rawMetadata.prompt;
    } catch (e) {
      // Not JSON
    }
  }
  
  if (rawMetadata.workflow) {
    try {
      workflow = typeof rawMetadata.workflow === 'string' ? JSON.parse(rawMetadata.workflow) : rawMetadata.workflow;
    } catch (e) {
      // Not JSON
    }
  }
  
  if (!promptGraph) {
    // If prompt wasn't JSON, see if we have simple string text
    if (typeof rawMetadata.prompt === 'string' && rawMetadata.prompt.trim()) {
      return {
        hasMetadata: true,
        prompt: rawMetadata.prompt,
        negativePrompt: '',
        steps: null,
        cfg: null,
        sampler: '',
        scheduler: '',
        seed: null,
        denoise: null,
        model: '',
        width: null,
        height: null
      };
    }
    return { hasMetadata: false };
  }
  
  const params = {
    hasMetadata: true,
    prompt: '',
    negativePrompt: '',
    steps: null,
    cfg: null,
    sampler: '',
    scheduler: '',
    seed: null,
    denoise: null,
    model: '',
    width: null,
    height: null
  };
  
  const textNodes = [];
  const modelNodes = [];
  const latentNodes = [];
  let ksamplerNode = null;
  
  for (const nodeId in promptGraph) {
    const node = promptGraph[nodeId];
    if (!node) continue;
    
    const classType = node.class_type;
    if (classType === 'KSampler' || classType === 'KSamplerAdvanced') {
      ksamplerNode = node;
    } else if (classType === 'CLIPTextEncode' || classType === 'SDXLPromptEncoder') {
      textNodes.push({ id: nodeId, node });
    } else if (classType === 'CheckpointLoaderSimple' || classType === 'CheckpointLoader') {
      modelNodes.push({ id: nodeId, node });
    } else if (classType === 'EmptyLatentImage') {
      latentNodes.push({ id: nodeId, node });
    }
  }
  
  if (ksamplerNode && ksamplerNode.inputs) {
    const inputs = ksamplerNode.inputs;
    params.steps = inputs.steps !== undefined ? inputs.steps : null;
    params.cfg = inputs.cfg !== undefined ? inputs.cfg : null;
    params.sampler = inputs.sampler_name || '';
    params.scheduler = inputs.scheduler || '';
    params.seed = inputs.seed !== undefined ? inputs.seed : null;
    params.denoise = inputs.denoise !== undefined ? inputs.denoise : null;
    
    // Trace positive prompt
    if (Array.isArray(inputs.positive)) {
      const posId = inputs.positive[0];
      const posNode = textNodes.find(n => n.id == posId);
      if (posNode && posNode.node.inputs) {
        params.prompt = posNode.node.inputs.text || posNode.node.inputs.prompt_g || '';
      }
    }
    
    // Trace negative prompt
    if (Array.isArray(inputs.negative)) {
      const negId = inputs.negative[0];
      const negNode = textNodes.find(n => n.id == negId);
      if (negNode && negNode.node.inputs) {
        params.negativePrompt = negNode.node.inputs.text || negNode.node.inputs.prompt_g || '';
      }
    }
    
    // Trace model
    if (Array.isArray(inputs.model)) {
      const modelId = inputs.model[0];
      const modelNode = modelNodes.find(n => n.id == modelId);
      if (modelNode && modelNode.node.inputs) {
        params.model = modelNode.node.inputs.ckpt_name || '';
      }
    }
    
    // Trace width/height
    if (Array.isArray(inputs.latent_image)) {
      const latentId = inputs.latent_image[0];
      const latentNode = latentNodes.find(n => n.id == latentId);
      if (latentNode && latentNode.node.inputs) {
        params.width = latentNode.node.inputs.width || null;
        params.height = latentNode.node.inputs.height || null;
      }
    }
  }
  
  // Fallbacks if tracing didn't work
  if (!params.prompt && textNodes.length > 0) {
    const negativeKeywords = ['bad quality', 'worse quality', 'lowres', 'monochrome', 'deformed', 'blurry', 'ugly', 'nsfw', 'negative'];
    const looksNegative = (txt) => {
      if (!txt) return false;
      const lower = txt.toLowerCase();
      return negativeKeywords.some(kw => lower.includes(kw)) || lower.length < 50 && (lower.includes('embedding:') || lower.includes('easynegative'));
    };
    
    const posCandidates = textNodes.filter(n => n.node.inputs && !looksNegative(n.node.inputs.text || n.node.inputs.prompt_g));
    const negCandidates = textNodes.filter(n => n.node.inputs && looksNegative(n.node.inputs.text || n.node.inputs.prompt_g));
    
    if (posCandidates.length > 0) {
      params.prompt = posCandidates[0].node.inputs.text || posCandidates[0].node.inputs.prompt_g || '';
    } else {
      params.prompt = textNodes[0].node.inputs.text || textNodes[0].node.inputs.prompt_g || '';
    }
    
    if (negCandidates.length > 0) {
      params.negativePrompt = negCandidates[0].node.inputs.text || negCandidates[0].node.inputs.prompt_g || '';
    }
  }
  
  if (!params.model && modelNodes.length > 0) {
    params.model = modelNodes[0].node.inputs.ckpt_name || '';
  }
  
  if ((!params.width || !params.height) && latentNodes.length > 0) {
    params.width = latentNodes[0].node.inputs.width || null;
    params.height = latentNodes[0].node.inputs.height || null;
  }
  
  if (typeof params.prompt === 'object') params.prompt = JSON.stringify(params.prompt);
  if (typeof params.negativePrompt === 'object') params.negativePrompt = JSON.stringify(params.negativePrompt);
  
  // Save raw data for reference or advanced features
  params.rawPrompt = promptGraph;
  params.rawWorkflow = workflow;
  
  return params;
}

// Format bytes into readable sizes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Scans local images and updates the images-data.json file
function scan() {
  console.log('🔍 Scanning local folders under public/images...');
  
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ Directory not found: ${IMAGES_DIR}`);
    console.log('Creating folders...');
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify([], null, 2));
    return;
  }
  
  const folders = fs.readdirSync(IMAGES_DIR).filter(file => {
    return fs.statSync(path.join(IMAGES_DIR, file)).isDirectory();
  });
  
  const images = [];
  const supportedExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
  
  folders.forEach(folder => {
    const categoryPath = path.join(IMAGES_DIR, folder);
    const files = fs.readdirSync(categoryPath);
    
    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (!supportedExtensions.includes(ext)) return;
      
      const filePath = path.join(categoryPath, file);
      const stat = fs.statSync(filePath);
      
      // Category is folder name
      const category = folder;
      // Relative URL for frontend client
      const imagePath = `/images/${folder}/${file}`;
      
      let rawMetadata = null;
      if (ext === '.png') {
        rawMetadata = parsePngMetadata(filePath);
      } else if (ext === '.webp') {
        rawMetadata = parseWebpMetadata(filePath);
      }
      
      // Look for sidecar JSON file if png/webp metadata is empty, or as a general fallback/companion option
      const jsonFile = path.join(categoryPath, path.basename(file, ext) + '.json');
      if (fs.existsSync(jsonFile)) {
        try {
          const jsonContent = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
          rawMetadata = rawMetadata || {};
          if (jsonContent.prompt) {
            rawMetadata.prompt = jsonContent.prompt;
          } else {
            // If the JSON is directly the prompt graph
            rawMetadata.prompt = jsonContent;
          }
          if (jsonContent.workflow) {
            rawMetadata.workflow = jsonContent.workflow;
          }
        } catch (err) {
          console.error(`Error reading sidecar JSON ${jsonFile}:`, err);
        }
      }
      
      const extractedParams = extractComfyuiParams(rawMetadata);
      
      images.push({
        id: `${category}-${path.basename(file, ext)}`.replace(/[^a-zA-Z0-9-]/g, '_'),
        filename: file,
        category: category,
        path: imagePath,
        size: formatBytes(stat.size),
        rawSizeBytes: stat.size,
        updatedAt: stat.mtime.toISOString(),
        metadata: extractedParams
      });
      
      console.log(`✅ Scanned: [${category}] ${file} (Metadata: ${extractedParams.hasMetadata ? 'Yes' : 'No'})`);
    });
  });
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(images, null, 2));
  console.log(`\n🎉 Success! Scanned ${images.length} images and wrote data to ${OUTPUT_FILE}`);
}

scan();
