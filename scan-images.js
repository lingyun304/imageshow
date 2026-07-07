import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import readline from 'readline';

const workingDir = process.cwd();

// 自动检测运行环境：如果是源码开发目录则使用 public/ 子目录，如果是编译打包后的 dist/ 目录则使用平铺根目录
const hasPublicDir = fs.existsSync(path.join(workingDir, 'public'));

const IMAGES_DIR = hasPublicDir ? path.join(workingDir, 'public', 'images') : path.join(workingDir, 'images');
const OUTPUT_FILE = hasPublicDir ? path.join(workingDir, 'public', 'images-data.json') : path.join(workingDir, 'images-data.json');

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
  console.log('\n🔍 开始扫描本地图片及元数据...');
  
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`❌ 目录未找到: ${IMAGES_DIR}`);
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
      
      const category = folder;
      const imagePath = `/images/${folder}/${file}`;
      
      let rawMetadata = null;
      if (ext === '.png') {
        rawMetadata = parsePngMetadata(filePath);
      } else if (ext === '.webp') {
        rawMetadata = parseWebpMetadata(filePath);
      }
      
      // Look for sidecar JSON
      const jsonFile = path.join(categoryPath, path.basename(file, ext) + '.json');
      if (fs.existsSync(jsonFile)) {
        try {
          const jsonContent = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
          rawMetadata = rawMetadata || {};
          if (jsonContent.prompt) {
            rawMetadata.prompt = jsonContent.prompt;
          } else {
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
      
      console.log(`✅ 已扫描: [${category}] ${file} (含元数据: ${extractedParams.hasMetadata ? '是' : '否'})`);
    });
  });
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(images, null, 2));
  console.log(`\n🎉 扫描成功！共扫描了 ${images.length} 张图片，已更新前端数据库：${OUTPUT_FILE}`);
}

// Create directory link helper
function setupSymlink(targetPath) {
  const baseDir = hasPublicDir ? path.join(workingDir, 'public') : workingDir;
  const linkPath = path.join(baseDir, 'images');
  
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  
  if (fs.existsSync(linkPath)) {
    try {
      const stats = fs.lstatSync(linkPath);
      if (stats.isSymbolicLink() || stats.isDirectory()) {
        fs.rmSync(linkPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(linkPath);
      }
    } catch (e) {
      console.warn('⚠️ 警告: 移除原有 images 软链接失败，尝试直接删除...');
      try {
        fs.rmSync(linkPath, { recursive: true, force: true });
      } catch (err) {
        console.error(`❌ 错误: 无法移除 ${hasPublicDir ? 'public/' : ''}images 文件夹。请手动删除对应 images 目录，然后再试。`);
        throw err;
      }
    }
  }
  
  // Create link
  const type = process.platform === 'win32' ? 'junction' : 'dir';
  console.log(`🔗 正在建立目录链接: ${hasPublicDir ? 'public/' : ''}images -> ${targetPath}`);
  fs.symlinkSync(targetPath, linkPath, type);
  console.log('✅ 目录链接建立成功！');
}

// CLI prompt helper
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans);
  }));
}

// Main sequence
async function main() {
  try {
    const CONFIG_FILE = path.join(workingDir, 'directory-config.json');
    let targetPath = null;
    let needPrompt = false;
    
    const args = process.argv.slice(2);
    const isSwitch = args.includes('--switch') || args.includes('-s');
    
    if (fs.existsSync(CONFIG_FILE) && !isSwitch) {
      try {
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        if (config.targetPath && fs.existsSync(config.targetPath)) {
          targetPath = config.targetPath;
          console.log(`📁 载入已配置的图片目录: ${targetPath}`);
        } else {
          console.log('⚠️ 配置文件中指向的目录已不存在。');
          needPrompt = true;
        }
      } catch (e) {
        needPrompt = true;
      }
    } else {
      needPrompt = true;
    }
    
    if (needPrompt) {
      console.log('\n==================================================');
      console.log('👉 PromptGallery 图片目录设置');
      console.log('==================================================');
      if (isSwitch) {
        console.log('🔄 检测到 --switch 参数，正在切换加载的图片目录。');
      } else {
        console.log('💡 首次运行或配置文件不存在，请指定您的 AI 图片目录。');
      }
      console.log('您可以输入绝对路径，或直接把文件夹拖入本终端窗口：\n');
      
      let validPath = false;
      while (!validPath) {
        const answer = await askQuestion('请输入文件夹路径: ');
        const cleanPath = answer.trim().replace(/^["']|["']$/g, '');
        
        if (!cleanPath) {
          console.log('❌ 路径不能为空，请重新输入。');
          continue;
        }
        
        if (fs.existsSync(cleanPath)) {
          const stats = fs.statSync(cleanPath);
          if (stats.isDirectory()) {
            targetPath = cleanPath;
            validPath = true;
          } else {
            console.log('❌ 该路径不是一个有效的文件夹，请重新输入。');
          }
        } else {
          console.log(`❌ 路径不存在: "${cleanPath}"，请重新输入。`);
        }
      }
      
      fs.writeFileSync(CONFIG_FILE, JSON.stringify({ targetPath }, null, 2));
      console.log(`💾 目录已成功保存至 directory-config.json`);
      
      setupSymlink(targetPath);
    } else {
      // Double check symlink is correct
      const baseDir = hasPublicDir ? path.join(workingDir, 'public') : workingDir;
      const linkPath = path.join(baseDir, 'images');
      if (!fs.existsSync(linkPath)) {
        setupSymlink(targetPath);
      }
    }
    
    // Run scan
    scan();
    
  } catch (error) {
    console.error('❌ 执行失败:', error);
  } finally {
    // Hold terminal open if in packaged binary format
    if (process.pkg || process.argv.includes('--hold')) {
      console.log('\n==================================================');
      await askQuestion('🎉 运行结束！按下 [回车键] 即可退出窗口...');
    }
  }
}

main();
