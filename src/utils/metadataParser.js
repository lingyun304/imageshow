// Client-side ComfyUI Metadata Parser for local directory importing

export async function parsePngMetadata(arrayBuffer) {
  const buffer = new Uint8Array(arrayBuffer);
  
  // Check PNG signature
  if (buffer.length < 8 || 
      buffer[0] !== 0x89 || buffer[1] !== 0x50 || buffer[2] !== 0x4E || buffer[3] !== 0x47 ||
      buffer[4] !== 0x0D || buffer[5] !== 0x0A || buffer[6] !== 0x1A || buffer[7] !== 0x0A) {
    return null;
  }
  
  const result = {};
  let offset = 8;
  const view = new DataView(arrayBuffer);
  const textDecoder = new TextDecoder('utf-8');
  const asciiDecoder = new TextDecoder('ascii');
  
  while (offset < buffer.length) {
    if (offset + 8 > buffer.length) break;
    const length = view.getUint32(offset);
    const type = asciiDecoder.decode(buffer.subarray(offset + 4, offset + 8));
    offset += 8;
    
    if (offset + length + 4 > buffer.length) break;
    
    const chunkData = buffer.subarray(offset, offset + length);
    
    if (type === 'tEXt') {
      const nullIdx = chunkData.indexOf(0);
      if (nullIdx !== -1) {
        const keyword = asciiDecoder.decode(chunkData.subarray(0, nullIdx));
        const text = textDecoder.decode(chunkData.subarray(nullIdx + 1));
        result[keyword] = text;
      }
    } else if (type === 'iTXt') {
      const nullIdx1 = chunkData.indexOf(0);
      if (nullIdx1 !== -1) {
        const keyword = asciiDecoder.decode(chunkData.subarray(0, nullIdx1));
        const compressionFlag = chunkData[nullIdx1 + 1];
        
        let nullIdx2 = chunkData.indexOf(0, nullIdx1 + 3);
        let nullIdx3 = chunkData.indexOf(0, nullIdx2 + 1);
        
        if (nullIdx2 !== -1 && nullIdx3 !== -1) {
          let textBuffer = chunkData.subarray(nullIdx3 + 1);
          if (compressionFlag === 1) {
            try {
              textBuffer = await decompressZlib(textBuffer);
            } catch (e) {
              console.warn('Decompression failed:', e);
            }
          }
          const text = textDecoder.decode(textBuffer);
          result[keyword] = text;
        }
      }
    } else if (type === 'IEND') {
      break;
    }
    
    offset += length + 4;
  }
  
  return result;
}

async function decompressZlib(uint8Array) {
  try {
    const ds = new DecompressionStream('deflate');
    const writer = ds.writable.getWriter();
    writer.write(uint8Array);
    writer.close();
    const response = new Response(ds.readable);
    const buf = await response.arrayBuffer();
    return new Uint8Array(buf);
  } catch (e) {
    console.error('DecompressionStream error:', e);
    return uint8Array;
  }
}

export function parseWebpMetadata(arrayBuffer) {
  const buffer = new Uint8Array(arrayBuffer);
  if (buffer.length < 12) return null;
  
  const asciiDecoder = new TextDecoder('ascii');
  
  const riff = asciiDecoder.decode(buffer.subarray(0, 4));
  const webp = asciiDecoder.decode(buffer.subarray(8, 12));
  if (riff !== 'RIFF' || webp !== 'WEBP') return null;
  
  const result = {};
  let offset = 12;
  const view = new DataView(arrayBuffer);
  
  while (offset < buffer.length) {
    if (offset + 8 > buffer.length) break;
    const type = asciiDecoder.decode(buffer.subarray(offset, offset + 4));
    const size = view.getUint32(offset + 4);
    offset += 8;
    
    if (offset + size > buffer.length) break;
    
    if (type === 'XMP ') {
      const xmpStr = new TextDecoder('utf-8').decode(buffer.subarray(offset, offset + size));
      
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
    
    offset += size + (size % 2);
  }
  
  return result;
}

export function extractComfyuiParams(rawMetadata) {
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
    
    if (Array.isArray(inputs.positive)) {
      const posId = inputs.positive[0];
      const posNode = textNodes.find(n => n.id == posId);
      if (posNode && posNode.node.inputs) {
        params.prompt = posNode.node.inputs.text || posNode.node.inputs.prompt_g || '';
      }
    }
    
    if (Array.isArray(inputs.negative)) {
      const negId = inputs.negative[0];
      const negNode = textNodes.find(n => n.id == negId);
      if (negNode && negNode.node.inputs) {
        params.negativePrompt = negNode.node.inputs.text || negNode.node.inputs.prompt_g || '';
      }
    }
    
    if (Array.isArray(inputs.model)) {
      const modelId = inputs.model[0];
      const modelNode = modelNodes.find(n => n.id == modelId);
      if (modelNode && modelNode.node.inputs) {
        params.model = modelNode.node.inputs.ckpt_name || '';
      }
    }
    
    if (Array.isArray(inputs.latent_image)) {
      const latentId = inputs.latent_image[0];
      const latentNode = latentNodes.find(n => n.id == latentId);
      if (latentNode && latentNode.node.inputs) {
        params.width = latentNode.node.inputs.width || null;
        params.height = latentNode.node.inputs.height || null;
      }
    }
  }
  
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
  
  params.rawPrompt = promptGraph;
  params.rawWorkflow = workflow;
  
  return params;
}

function pathExtension(filename) {
  const idx = filename.lastIndexOf('.');
  return idx !== -1 ? filename.substring(idx).toLowerCase() : '';
}

function basenameWithoutExt(filename) {
  const idx = filename.lastIndexOf('.');
  return idx !== -1 ? filename.substring(0, idx) : filename;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Traverse local directory handle and load all images into database format
export async function scanLocalDirectory(dirHandle, onProgress, preScannedData = null) {
  const sidecarJsons = new Map();
  const imageFiles = [];
  
  async function traverse(handle, relativePath = []) {
    for await (const entry of handle.values()) {
      if (entry.kind === 'directory') {
        await traverse(entry, [...relativePath, entry.name]);
      } else if (entry.kind === 'file') {
        const file = await entry.getFile();
        const ext = pathExtension(file.name);
        const nameWithoutExt = basenameWithoutExt(file.name);
        const category = relativePath.length > 0 ? relativePath[relativePath.length - 1] : 'Uncategorized';
        
        if (ext === '.json' && file.name !== 'media-data.json') {
          try {
            const text = await file.text();
            const json = JSON.parse(text);
            sidecarJsons.set(`${category}/${nameWithoutExt}`, json);
          } catch (e) {
            console.error('Failed to parse sidecar JSON:', file.name, e);
          }
        } else {
          const isImage = ['.png', '.webp', '.jpg', '.jpeg', '.gif', '.bmp', '.svg'].includes(ext);
          const isVideo = ['.mp4', '.webm', '.mov', '.avi', '.mkv'].includes(ext);
          const isAudio = ['.mp3', '.wav', '.flac', '.aac', '.m4a', '.ogg'].includes(ext);
          if (isImage || isVideo || isAudio) {
            imageFiles.push({
              file,
              category,
              name: nameWithoutExt,
              ext,
              type: isImage ? 'image' : (isVideo ? 'video' : 'audio'),
              filename: file.name,
              size: formatBytes(file.size),
              rawSizeBytes: file.size,
              updatedAt: new Date(file.lastModified).toISOString()
            });
          }
        }
      }
    }
  }
  
  if (onProgress) onProgress('读取目录结构中...');
  await traverse(dirHandle);
  
  const images = [];
  const total = imageFiles.length;
  
  for (let i = 0; i < total; i++) {
    const img = imageFiles[i];
    if (onProgress) onProgress(`正在解析元数据 (${i + 1}/${total}): ${img.filename}`);
    
    const matchId = `${img.category}-${img.name}`.replace(/[^a-zA-Z0-9-]/g, '_');
    const matchedPreScanned = preScannedData ? preScannedData.find(item => item.id === matchId) : null;
    
    let extractedParams = null;
    
    if (matchedPreScanned && matchedPreScanned.metadata) {
      extractedParams = matchedPreScanned.metadata;
    } else {
      let rawMetadata = null;
      
      if (img.ext === '.png') {
        try {
          const arrBuf = await img.file.arrayBuffer();
          rawMetadata = await parsePngMetadata(arrBuf);
        } catch (e) {
          console.error('Error parsing PNG metadata client-side:', img.filename, e);
        }
      } else if (img.ext === '.webp') {
        try {
          const arrBuf = await img.file.arrayBuffer();
          rawMetadata = parseWebpMetadata(arrBuf);
        } catch (e) {
          console.error('Error parsing WebP metadata client-side:', img.filename, e);
        }
      }
      
      const sidecarKey = `${img.category}/${img.name}`;
      if (sidecarJsons.has(sidecarKey)) {
        const jsonContent = sidecarJsons.get(sidecarKey);
        rawMetadata = rawMetadata || {};
        if (jsonContent.prompt) {
          rawMetadata.prompt = jsonContent.prompt;
        } else {
          rawMetadata.prompt = jsonContent;
        }
        if (jsonContent.workflow) {
          rawMetadata.workflow = jsonContent.workflow;
        }
      }
      
      extractedParams = extractComfyuiParams(rawMetadata);
    }
    
    const objectUrl = URL.createObjectURL(img.file);
    
    images.push({
      id: matchId,
      filename: img.filename,
      category: img.category,
      path: objectUrl,
      type: img.type,
      size: img.size,
      rawSizeBytes: img.rawSizeBytes,
      updatedAt: img.updatedAt,
      metadata: extractedParams,
      isLocalFile: true
    });
  }
  
  return images;
}
