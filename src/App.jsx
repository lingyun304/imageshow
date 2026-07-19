import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Search, 
  SlidersHorizontal, 
  Copy, 
  Check, 
  Download, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Folder, 
  FolderOpen,
  Layers, 
  Info, 
  Terminal, 
  Database, 
  BookOpen,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Code,
  Calendar,
  FileText,
  Moon,
  Leaf,
  Zap,
  Plus,
  Minus,
  Trash2,
  HelpCircle,
  RefreshCw,
  Shuffle,
  Settings,
  AlertCircle
} from 'lucide-react';
import './App.css';
import { scanLocalDirectory } from './utils/metadataParser';

// Helper to parse weights and parentheses from raw tags
function parseTag(rawTag) {
  let clean = rawTag.trim();
  let weight = 1.0;

  // Matches ((tag:weight)) or (tag:weight)
  const match = clean.match(/^\(+(.+?):([0-9.]+)\)+$/);
  if (match) {
    clean = match[1].trim();
    weight = parseFloat(match[2]);
  } else {
    // Check if it's just wrapped in parentheses like (((tag)))
    const parenMatch = clean.match(/^\(+(.+?)\)+$/);
    if (parenMatch) {
      clean = parenMatch[1].trim();
    }
  }
  return { clean, weight };
}

const AI_STYLES = [
  { id: 'cyberpunk', name: '赛博朋克', nameEn: 'Cyberpunk', prompt: 'cyberpunk style, high-tech low-life, neon glowing lights, holographic displays, futuristic urban street, metallic surfaces' },
  { id: 'anime', name: '日系动漫', nameEn: 'Dynamic Anime', prompt: 'modern anime style, vibrant colors, expressive eyes, line art, cel-shading, high aesthetic value, masterpiece' },
  { id: 'realistic', name: '写实人像', nameEn: 'Realistic Portrait', prompt: 'hyper-realistic photo, 8k resolution, detailed skin texture, raw photo, captured with DSLR, natural skin pores, photographic masterpiece' },
  { id: 'fantasy', name: '魔法奇幻', nameEn: 'Fantasy Magic', prompt: 'fantasy world, magic elements, glowing particles, mystical forest, ethereal atmosphere, ancient ruins, legendary scenery' },
  { id: 'cinematic', name: '电影质感', nameEn: 'Cinematic', prompt: 'cinematic shot, 35mm lens, depth of field, dramatic shadows, highly atmospheric, movie poster quality, color graded' },
  { id: 'watercolor', name: '水彩手绘', nameEn: 'Watercolor Art', prompt: 'watercolor painting, soft color washes, hand-drawn paper texture, artistic brush strokes, splashes, gentle aesthetic' },
  { id: 'oilpainting', name: '古典油画', nameEn: 'Classical Oil Painting', prompt: 'classical oil painting style, visible heavy brush strokes, rich texture, chiaroscuro lighting, baroque atmosphere, masterwork canvas' },
  { id: '3drender', name: '3D C4D渲染', nameEn: '3D C4D Render', prompt: '3d render, octane render, cinema 4d style, clay material, cute chibi design, bright ambient occlusion, smooth surfaces' },
  { id: 'chinese', name: '国风水墨', nameEn: 'Chinese Ink Wash', prompt: 'traditional chinese ink wash painting style, guofeng, elegant brush strokes, minimalist composition, misty mountain landscape, calligraphic lines' },
  { id: 'steampunk', name: '蒸汽朋克', nameEn: 'Steampunk', prompt: 'steampunk style, brass gears, copper pipes, smoke and steam, Victorian clothing, mechanical details, sepia tone accents' }
];

const AI_COMPOSITIONS = [
  { id: 'close-up', name: '电影特写', nameEn: 'Close-up Shot', prompt: 'close-up portrait, focusing on details and expressions, blurry background' },
  { id: 'medium', name: '中景半身', nameEn: 'Medium Shot', prompt: 'medium shot, showing upper body and surrounding context' },
  { id: 'full-body', name: '全身立绘', nameEn: 'Full Body Shot', prompt: 'full body shot, showing complete character pose and details' },
  { id: 'wide-angle', name: '宏大远景', nameEn: 'Wide Angle', prompt: 'wide-angle view, expansive scenery, scale and environment context' },
  { id: 'low-angle', name: '仰视透视', nameEn: 'Low Angle', prompt: 'low angle view, looking up, imposing and dynamic perspective' },
  { id: 'high-angle', name: '俯视构图', nameEn: 'High Angle', prompt: 'high angle shot, bird\'s-eye view, structural composition' }
];

const AI_LIGHTINGS = [
  { id: 'neon', name: '霓虹冷色', nameEn: 'Neon Glowing', prompt: 'vibrant neon cyberpunk lighting, cold blue and pink lights, high contrast shadows' },
  { id: 'volumetric', name: '体积光', nameEn: 'Volumetric Light', prompt: 'dramatic volumetric light rays, dust particles visible, sunset rays breaking through, atmospheric haze' },
  { id: 'studio', name: '棚拍布光', nameEn: 'Studio Lighting', prompt: 'soft studio lighting, 3-point light setup, key light, fill light, clean studio backdrop' },
  { id: 'golden-hour', name: '黄金时刻', nameEn: 'Golden Hour', prompt: 'warm golden hour light, soft orange sunset glow, long warm shadows, cinematic backlight' },
  { id: 'dark-moody', name: '阴郁暗光', nameEn: 'Dark & Moody', prompt: 'low-key lighting, deep shadows, moody ambiance, mysterious atmosphere' },
  { id: 'backlight', name: '逆光轮廓', nameEn: 'Rim Backlighting', prompt: 'strong backlighting, glowing rim light outlining the edges, high silhouette contrast' }
];

function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'fresh-mint';
  });

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.className = '';
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Navigation
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'gallery', 'guide'

  // Image data state
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Local directory import state
  const [isLocalImport, setIsLocalImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  
  // Gallery filters and search
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyWithMetadata, setOnlyWithMetadata] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedSampler, setSelectedSampler] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Detail Modal Viewer
  const [selectedImage, setSelectedImage] = useState(null);
  const [rawTab, setRawTab] = useState('prompt'); // 'prompt', 'workflow'

  // Toast Notification
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [copiedField, setCopiedField] = useState('');

  // Prompt Generator States
  const [tagDatabase, setTagDatabase] = useState(null);
  const [selectedGenCategory, setSelectedGenCategory] = useState('Age');
  const [genSearchQuery, setGenSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]); // Array of { raw, clean, weight, category }
  const [genModel, setGenModel] = useState('pony'); // 'pony', 'illustrious', 'anime'
  const [genRating, setGenRating] = useState('safe'); // 'safe', 'sensitive', 'nsfw', 'explicit'
  const [customGenPrefix, setCustomGenPrefix] = useState('');
  const [customGenSuffix, setCustomGenSuffix] = useState('');
  const [searchScope, setSearchScope] = useState('global'); // 'global' or 'category'
  const [activeRandomStyle, setActiveRandomStyle] = useState(null);

  // AI Prompt Master States
  const [llmApiUrl, setLlmApiUrl] = useState(() => localStorage.getItem('llmApiUrl') || 'http://localhost:11434/v1');
  const [llmApiKey, setLlmApiKey] = useState(() => localStorage.getItem('llmApiKey') || '');
  const [llmModel, setLlmModel] = useState(() => localStorage.getItem('llmModel') || 'llama3:latest');
  const [llmPreset, setLlmPreset] = useState('ollama'); // 'ollama', 'deepseek', 'openai', 'custom'
  const [aiUserIdea, setAiUserIdea] = useState('一个戴着发光耳机和未来护目镜的少女，独自坐在赛博朋克雨夜街头小吃摊前吃拉面，背景是层叠的霓虹灯牌与高科技摩天大楼。');
  const [aiSelectedStyle, setAiSelectedStyle] = useState('cyberpunk');
  const [aiSelectedComposition, setAiSelectedComposition] = useState('close-up');
  const [aiSelectedLighting, setAiSelectedLighting] = useState('neon');
  const [aiResultPrompt, setAiResultPrompt] = useState('');
  const [aiResultTranslation, setAiResultTranslation] = useState('');
  const [aiIsGenerating, setAiIsGenerating] = useState(false);
  const [aiConnectionTest, setAiConnectionTest] = useState('idle'); // 'idle', 'testing', 'success', 'error'
  const [aiConnectionError, setAiConnectionError] = useState('');
  const [showLlmSettings, setShowLlmSettings] = useState(false);

  useEffect(() => {
    localStorage.setItem('llmApiUrl', llmApiUrl);
  }, [llmApiUrl]);
  useEffect(() => {
    localStorage.setItem('llmApiKey', llmApiKey);
  }, [llmApiKey]);
  useEffect(() => {
    localStorage.setItem('llmModel', llmModel);
  }, [llmModel]);

  // Switch preset configurations
  const handleLlmPresetChange = (preset) => {
    setLlmPreset(preset);
    if (preset === 'ollama') {
      setLlmApiUrl('http://localhost:11434/v1');
      setLlmModel('llama3:latest');
    } else if (preset === 'deepseek') {
      setLlmApiUrl('https://api.deepseek.com/v1');
      setLlmModel('deepseek-chat');
    } else if (preset === 'openai') {
      setLlmApiUrl('https://api.openai.com/v1');
      setLlmModel('gpt-4o-mini');
    }
  };

  // Test Connection
  const testLlmConnection = async () => {
    if (!llmApiUrl) {
      showToast('请输入 API 接口地址！', 'error');
      return;
    }
    setAiConnectionTest('testing');
    setAiConnectionError('');
    try {
      const response = await fetch(`${llmApiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(llmApiKey ? { 'Authorization': `Bearer ${llmApiKey}` } : {})
        },
        body: JSON.stringify({
          model: llmModel,
          messages: [
            { role: 'user', content: 'ping' }
          ],
          max_tokens: 5
        })
      });
      if (response.ok) {
        setAiConnectionTest('success');
        showToast('连接测试成功！模型可正常调用。', 'success');
      } else {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }
    } catch (err) {
      console.error(err);
      setAiConnectionTest('error');
      setAiConnectionError(err.message);
      showToast('连接测试失败！', 'error');
    }
  };

  // Fetch loaded models from the API endpoint
  const handleFetchLoadedModels = async () => {
    if (!llmApiUrl) {
      showToast('请先输入 API 接口地址！', 'error');
      return;
    }
    try {
      showToast('正在从接口获取可用模型列表...', 'info');
      const response = await fetch(`${llmApiUrl}/models`, {
        method: 'GET',
        headers: {
          ...(llmApiKey ? { 'Authorization': `Bearer ${llmApiKey}` } : {})
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const modelIds = data.data.map(m => m.id);
          // Set the first available model as the selected model
          setLlmModel(modelIds[0]);
          showToast(`已成功自动获取并加载模型: ${modelIds[0]}`, 'success');
        } else {
          showToast('未在接口端检测到已加载的模型，请确保大模型已启用。', 'warning');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error(err);
      showToast('获取模型列表失败，请检查地址是否正确或是否存在跨域限制。', 'error');
    }
  };

  // Generate Creative Natural Language Prompt via LLM
  const handleGenerateAIPrompt = async () => {
    if (!aiUserIdea.trim()) {
      showToast('请先输入您的创意脑洞描述！', 'error');
      return;
    }
    if (!llmApiUrl) {
      showToast('请在 API 设置中配置接口地址！', 'error');
      setShowLlmSettings(true);
      return;
    }

    setAiIsGenerating(true);
    setAiResultPrompt('');
    setAiResultTranslation('');

    const styleObj = AI_STYLES.find(s => s.id === aiSelectedStyle);
    const compObj = AI_COMPOSITIONS.find(c => c.id === aiSelectedComposition);
    const lightObj = AI_LIGHTINGS.find(l => l.id === aiSelectedLighting);

    const systemPrompt = `You are a professional AI image generation prompt specialist.
Your task is to take the user's basic core idea, style, composition, and lighting preferences, and expand them into a highly detailed, descriptive, and creative natural language prompt in English, optimized for state-of-the-art text-to-image models (like Flux, Z-Image, SD3, Midjourney).

Follow these rules:
1. The expanded English prompt must be written as a single, coherent, descriptive paragraph of natural English prose (no comma-separated list of tags, but a description of the scene). Include rich sensory details, textures, composition elements, and lighting to make the image beautiful.
2. Provide a natural, beautiful Chinese translation of the expanded prompt so the user can understand it.
3. You must output the result strictly in the following JSON format:
{
  "prompt": "expanded English prompt here",
  "translation": "Chinese translation here"
}
Do not include any markdown format tags (like \`\`\`json) or extra text outside the JSON. Return only the JSON string.`;

    const userPrompt = `Core scene idea: ${aiUserIdea}
Style theme: ${styleObj ? styleObj.prompt : ''}
Composition: ${compObj ? compObj.prompt : ''}
Lighting: ${lightObj ? lightObj.prompt : ''}`;

    const messages = [];
    if (llmPreset === 'openai' || llmPreset === 'deepseek') {
      messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: userPrompt });
    } else {
      // Local models (Ollama, LM Studio, custom) might not support 'system' role.
      // We combine system instructions and user parameters into a single user message.
      messages.push({
        role: 'user',
        content: `${systemPrompt}\n\n[Instruction]: Generate the detailed prompt based on the following parameters:\n${userPrompt}`
      });
    }

    try {
      const response = await fetch(`${llmApiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(llmApiKey ? { 'Authorization': `Bearer ${llmApiKey}` } : {})
        },
        body: JSON.stringify({
          model: llmModel,
          messages,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
        throw new Error('API 返回的数据结构不正确，未检测到大模型回复内容。');
      }

      let content = data.choices[0].message.content.trim();
      
      // Strip markdown codeblocks
      if (content.startsWith('```json')) {
        content = content.substring(7);
      } else if (content.startsWith('```')) {
        content = content.substring(3);
      }
      if (content.endsWith('```')) {
        content = content.substring(0, content.length - 3);
      }
      content = content.trim();

      try {
        const parsed = JSON.parse(content);
        setAiResultPrompt(parsed.prompt || content);
        setAiResultTranslation(parsed.translation || '');
        showToast('创意提示词生成成功！', 'success');
      } catch (parseErr) {
        // Fallback: If not JSON, output directly
        setAiResultPrompt(content);
        setAiResultTranslation('API 未返回标准的 JSON 结构，已直接渲染原始模型回复。');
        showToast('创意提示词已生成，但未进行结构化解析。', 'warning');
      }
    } catch (err) {
      console.error(err);
      setAiResultPrompt('');
      setAiResultTranslation('');
      showToast('大模型生成失败，请检查连线配置！', 'error');
      
      // Suggest local troubleshooting
      let helpMsg = `调用接口出错: ${err.message}\n\n`;
      if (llmPreset === 'ollama') {
        helpMsg += `排查建议 (Ollama 本地配置):\n` +
          `1. 确认已在电脑上启动 Ollama (在任务栏/菜单栏检查图标)\n` +
          `2. 终端执行 "ollama list" 检查是否已下载模型 "${llmModel}"\n` +
          `3. 确认接口地址 "http://localhost:11434/v1" 是否正常，或尝试通过浏览器直接访问该链接是否提示 "Ollama is running"`;
      } else {
        helpMsg += `排查建议:\n` +
          `1. 检查 API 接口地址 "${llmApiUrl}" 是否能从本地网络访问\n` +
          `2. 确认 API Key 密钥是否正确，或额度是否充足\n` +
          `3. 检查选定的模型名称 "${llmModel}" 是否在服务端有效`;
      }
      setAiResultTranslation(helpMsg);
    } finally {
      setAiIsGenerating(false);
    }
  };

  // Fetch tag database
  useEffect(() => {
    fetch('/tag-data.json')
      .then(res => {
        if (!res.ok) {
          throw new Error('Tags database JSON not found.');
        }
        return res.json();
      })
      .then(data => {
        setTagDatabase(data);
      })
      .catch(err => {
        console.error('Error loading tag database:', err);
      });
  }, []);

  const handleToggleTag = (rawTag, category) => {
    const isSelected = selectedTags.some(t => t.raw === rawTag);
    if (isSelected) {
      setSelectedTags(selectedTags.filter(t => t.raw !== rawTag));
    } else {
      const { clean, weight } = parseTag(rawTag);
      let zh = '';
      if (tagDatabase && tagDatabase[category]) {
        const found = tagDatabase[category].tags.find(t => (Array.isArray(t) ? t[0] : t) === rawTag);
        if (found && Array.isArray(found)) {
          zh = found[1];
        }
      }
      setSelectedTags([...selectedTags, { raw: rawTag, clean, weight, category, zh }]);
    }
  };

  const handleAdjustWeight = (rawTag, delta) => {
    setSelectedTags(selectedTags.map(t => {
      if (t.raw === rawTag) {
        const newWeight = Math.round((t.weight + delta) * 10) / 10;
        if (newWeight >= 0.1 && newWeight <= 2.5) {
          return { ...t, weight: newWeight };
        }
      }
      return t;
    }));
  };

  const formatTag = (tagObj) => {
    if (tagObj.weight === 1.0) {
      return tagObj.clean;
    } else {
      return `(${tagObj.clean}:${tagObj.weight})`;
    }
  };

  const generatePrompts = () => {
    let positive = '';
    let negative = '';

    let prefixTags = [];
    let suffixTags = [];
    
    if (genModel === 'pony') {
      prefixTags.push('score_9, score_8_up, score_7_up, score_6_up, score_5_up, score_4_up');
      
      if (genRating === 'safe') prefixTags.push('rating_safe');
      else if (genRating === 'sensitive') prefixTags.push('rating_questionable');
      else prefixTags.push('rating_explicit');
      
      prefixTags.push('source_anime');
      negative = 'score_6, score_5, score_4, worst quality, low quality, bad anatomy, blurry, watermarked, signature';
    } 
    else if (genModel === 'illustrious') {
      if (genRating === 'safe') prefixTags.push('safe');
      else if (genRating === 'sensitive') prefixTags.push('sensitive');
      else if (genRating === 'nsfw') prefixTags.push('nsfw');
      else prefixTags.push('explicit');

      suffixTags.push('masterpiece, best quality, amazing quality, very aesthetic, absurdres');
      negative = 'lowres, worst quality, bad quality, bad anatomy, bad proportions, blurry, sketch, censor, signature, watermark, artist name, artistic error, artistic failure';
    } 
    else {
      if (genRating === 'safe') prefixTags.push('rating_safe');
      else if (genRating === 'nsfw' || genRating === 'explicit') prefixTags.push('nsfw');
      
      suffixTags.push('masterpiece, best quality, high quality');
      negative = 'worst quality, low quality, bad anatomy, bad hands, missing fingers, blurry, watermark, signature';
    }

    let userTagsList = [...selectedTags];

    if (genModel === 'illustrious') {
      const charAndCopyTags = userTagsList.filter(t => t.category === 'Character' || t.category === 'Copyright');
      const otherTags = userTagsList.filter(t => t.category !== 'Character' && t.category !== 'Copyright');
      userTagsList = [...charAndCopyTags, ...otherTags];
    }

    const userTagsFormatted = userTagsList.map(t => formatTag(t)).join(', ');

    let positiveParts = [];
    if (prefixTags.length > 0) {
      positiveParts.push(prefixTags.join(', '));
    }
    if (customGenPrefix.trim()) {
      positiveParts.push(customGenPrefix.trim());
    }
    if (userTagsFormatted) {
      positiveParts.push(userTagsFormatted);
    }
    if (customGenSuffix.trim()) {
      positiveParts.push(customGenSuffix.trim());
    }
    if (suffixTags.length > 0) {
      positiveParts.push(suffixTags.join(', '));
    }

    positive = positiveParts.join(', ');
    return { positive, negative };
  };

  const handleRandomGenerate = (styleKey) => {
    if (!tagDatabase) {
      showToast('标签库尚未加载完成，请稍后再试');
      return;
    }
    setActiveRandomStyle(styleKey);

    const styles = {
      anime: {
        model: 'pony',
        keywords: {
          Themes: ['anime', 'manga', 'illustration', 'comic', '二次元', '动漫', '插画'],
          Backgrounds: ['classroom', 'school', 'sky', 'cloud', 'cherry blossom', 'street', 'room', '教室', '学校', '天空', '云', '樱花', '街道', '房间'],
          Environment_Setting: ['classroom', 'school', 'sky', 'cloud', 'cherry blossom', 'street', 'room', '教室', '学校', '天空', '云', '樱花', '街道', '房间'],
          clothes: ['school uniform', 'sailor', 'skirt', 'dress', 'cardigan', '制服', '水手服', '裙', '毛衣']
        }
      },
      realistic: {
        model: 'illustrious',
        keywords: {
          Themes: ['photorealistic', 'realistic', 'portrait', 'photography', 'photo', '写实', '写真', '肖像', '摄影'],
          Backgrounds: ['city', 'street', 'cafe', 'park', 'room', 'interior', 'beach', '城市', '街道', '咖啡', '公园', '室内', '房间', '沙滩'],
          Environment_Setting: ['city', 'street', 'cafe', 'park', 'room', 'interior', 'beach', '城市', '街道', '咖啡', '公园', '室内', '房间', '沙滩'],
          clothes: ['casual', 't-shirt', 'jeans', 'sweater', 'jacket', 'dress', '休闲', '恤', '牛仔裤', '针织', '外套', '连衣裙'],
          Lighting: ['soft light', 'studio', 'sunlight', 'bokeh', 'depth of field', '柔光', '工作室', '日光', '背景虚化']
        }
      },
      cyberpunk: {
        model: 'pony',
        keywords: {
          Themes: ['cyberpunk', 'neon', 'futuristic', 'synthwave', '赛博', '霓虹', '未来', '科幻'],
          Backgrounds: ['city', 'street', 'alley', 'night', 'rain', 'skyscraper', '城市', '街道', '后街', '雨', '夜', '摩天大楼'],
          Environment_Setting: ['city', 'street', 'alley', 'night', 'rain', 'skyscraper', '城市', '街道', '后街', '雨', '夜', '摩天大楼'],
          clothes: ['techwear', 'leather', 'visor', 'jacket', 'hoodie', '机能', '皮衣', '面罩', '夹克', '连帽衫'],
          Lighting: ['neon', 'glowing', 'backlight', '霓虹', '发光', '逆光']
        }
      },
      fantasy: {
        model: 'anime',
        keywords: {
          Themes: ['fantasy', 'magic', 'mythical', 'fairy', 'witch', '奇幻', '魔法', '魔幻', '精灵', '女巫'],
          Backgrounds: ['forest', 'ruins', 'castle', 'island', 'cave', 'sky', '森林', '遗迹', '城堡', '岛', '洞穴', '天空'],
          Environment_Setting: ['forest', 'ruins', 'castle', 'island', 'cave', 'sky', '森林', '遗迹', '城堡', '岛', '洞穴', '天空'],
          clothes: ['robe', 'cape', 'cloak', 'dress', 'armor', '长袍', '披风', '斗篷', '连衣裙', '盔甲'],
          Props_Objects: ['staff', 'book', 'wand', 'sword', 'crystal', '法杖', '书', '魔杖', '剑', '水晶']
        }
      },
      chinese: {
        model: 'anime',
        keywords: {
          Themes: ['traditional', 'chinese', 'oriental', 'historical', '国风', '古风', '中国', '武侠'],
          Backgrounds: ['garden', 'bamboo', 'temple', 'bridge', 'pond', 'mountain', '庭院', '竹林', '寺庙', '桥', '池塘', '山'],
          Environment_Setting: ['garden', 'bamboo', 'temple', 'bridge', 'pond', 'mountain', '庭院', '竹林', '寺庙', '桥', '池塘', '山'],
          clothes: ['hanfu', 'cheongsam', 'robe', 'silk', '汉服', '旗袍', '长袍', '丝绸'],
          Props_Objects: ['fan', 'lantern', 'sword', 'umbrella', 'flute', '扇', '灯笼', '剑', '伞', '笛']
        }
      },
      scifi: {
        model: 'illustrious',
        keywords: {
          Themes: ['sci-fi', 'space', 'futuristic', 'mecha', 'alien', '科幻', '太空', '未来', '机甲', '外星'],
          Backgrounds: ['spaceship', 'planet', 'stars', 'station', 'nebula', '飞船', '星球', '星空', '空间站', '星云'],
          Environment_Setting: ['spaceship', 'planet', 'stars', 'station', 'nebula', '飞船', '星球', '星空', '空间站', '星云'],
          clothes: ['spacesuit', 'armor', 'bodysuit', 'suit', '宇航服', '盔甲', '连体衣', '制服']
        }
      },
      pastoral: {
        model: 'anime',
        keywords: {
          Themes: ['cozy', 'pastoral', 'nature', 'cottagecore', 'peaceful', '田园', '自然', '温馨', '宁静'],
          Backgrounds: ['meadow', 'field', 'cottage', 'forest', 'garden', 'grass', '草地', '花田', '小屋', '森林', '花园'],
          Environment_Setting: ['meadow', 'field', 'cottage', 'forest', 'garden', 'grass', '草地', '花田', '小屋', '森林', '花园'],
          clothes: ['sundress', 'hat', 'cardigan', 'apron', '连衣裙', '草帽', '开衫', '围裙'],
          Weather: ['golden hour', 'sunny', 'sunlight', 'warm', '黄金时刻', '晴天', '阳光', '温暖']
        }
      },
      multi: {
        model: 'pony',
        keywords: {
          Themes: ['group', 'multi-person', 'multiple girls', 'multiple boys', 'duo', 'trio', 'harem', 'couple', '聚会', '合照', '多人', '双人', '三人', '情侣'],
          Backgrounds: ['classroom', 'beach', 'cafe', 'park', 'city street', 'festival', 'party', '教室', '沙滩', '咖啡馆', '公园', '街道', '祭典', '聚会'],
          Environment_Setting: ['classroom', 'beach', 'cafe', 'park', 'city street', 'festival', 'party', '教室', '沙滩', '咖啡馆', '公园', '街道', '祭典', '聚会'],
          clothes: ['matching clothes', 'uniform', 'casual wear', 'dress', '制服', '休闲装', '连衣裙']
        }
      },
      bdsm: {
        model: 'pony',
        rating: 'explicit',
        keywords: {
          Themes: ['bdsm', 'bondage', 'shibari', 'kinbaku', 'hemp rope', 'red rope', 'rope marks', 'skindentation', 'restrained', 'tied up', '束缚', '绳艺', '绳缚', '绳痕'],
          Backgrounds: ['dungeon', 'prison cell', 'dark room', 'stone wall', '地牢', '牢房', '暗室', '石墙'],
          Environment_Setting: ['dungeon', 'prison cell', 'dark room', 'stone wall', '地牢', '牢房', '暗室', '石墙'],
          clothes: ['handcuffs', 'ball gag', 'ring gag', 'blindfold', 'chains', 'leash', 'collar', 'harness', 'bit gag', '手铐', '口球', '眼罩', '皮鞭', '项圈', '牵引绳']
        }
      },
      stealth: {
        model: 'pony',
        rating: 'explicit',
        keywords: {
          Themes: ['stealth sex', 'implied sex', 'under table', 'frosted glass', 'head out of frame', 'lower body only', 'pussy juice trail', 'legs trembling', 'cum string', 'view between legs', 'under covers', '隐奸', '暗示', '桌下', '磨砂玻璃', '无脸', '仅下半身', '腿部发抖', '拉丝', '被子下'],
          Backgrounds: ['restaurant', 'office', 'classroom', 'couch', 'living room', 'apartment window', '餐厅', '办公室', '教室', '沙发', '客厅', '公寓窗户'],
          Environment_Setting: ['restaurant', 'office', 'classroom', 'couch', 'living room', 'apartment window', '餐厅', '办公室', '教室', '沙发', '客厅', '公寓窗户'],
          clothes: ['no panties', 'no bra', 'half dressed', 'clothes lift', 'skirt lift', 'undressing', 'see through', 'wet clothes', '没穿内裤', '没穿胸罩', '衣衫不整', '掀起裙子', '掀起衬衫', '透视装', '湿身诱惑']
        }
      },
      lewd: {
        model: 'pony',
        rating: 'explicit',
        keywords: {
          NSFW: ['nude', 'sex', 'cum', 'uncensored', 'ahegao', 'oral', 'anal', 'vaginal', 'paizuri', 'creampie', 'breast', 'buttocks', 'masturbation', 'bondage', 'groping', 'pussy', 'nipples', 'naked'],
          Themes: ['nsfw', 'nude', 'uncensored', 'areola', 'pussy', 'penis', 'naked', '裸', '阿黑颜', 'ahegao'],
          Backgrounds: ['bed', 'room', 'hotel', 'bathroom', 'shower', 'indoors', 'outdoors', '床', '房间', '酒店', '镜子', '浴室', '淋浴', '室内', '室外'],
          Environment_Setting: ['bed', 'room', 'hotel', 'bathroom', 'shower', 'indoors', 'outdoors', '床', '房间', '酒店', '镜子', '浴室', '淋浴', '室内', '室外'],
          clothes: ['no panties', 'no bra', 'panty pull', 'skirt lift', 'skirt-lift', 'shirt lift', 'half dressed', 'undressing', 'see through', 'wet clothes', 'micro bikini', 'sling bikini', 'pasties', 'torn clothes', 'exposed breasts', 'exposed_breasts', 'wardrobe malfunction', '没穿内裤', '没穿胸罩', '拉扯内裤', '掀起裙子', '掀起衬衫', '半脱状态', '正在脱衣服', '透视装', '湿身诱惑', '比基尼', '死库水', '乳贴', '衣服破裂', '胸部外露', '走光']
        }
      }
    };

    let activeStyleKey = styleKey;
    if (activeStyleKey === 'random') {
      const keys = Object.keys(styles);
      const filteredKeys = (genRating === 'nsfw' || genRating === 'explicit') 
        ? keys 
        : keys.filter(k => k !== 'lewd' && k !== 'bdsm' && k !== 'stealth');
      activeStyleKey = filteredKeys[Math.floor(Math.random() * filteredKeys.length)];
    }

    const styleConfig = styles[activeStyleKey] || styles.anime;
    setGenModel(styleConfig.model);
    if (styleConfig.rating) {
      setGenRating(styleConfig.rating);
    }

    const selectedList = [];

    const expandNudityTags = (list) => {
      const hasNude = list.some(t => 
        t.raw === 'nude' || t.raw === 'naked' || t.raw === 'completely nude' || t.raw === 'fully nude'
      );
      if (!hasNude) return list;

      const has1girl = list.some(t => t.raw === '1girl');
      const has1boy = list.some(t => t.raw === '1boy');
      const has2girls = list.some(t => t.raw === '2girls');
      const has3girls = list.some(t => t.raw === '3girls');
      const hasGroup = list.some(t => t.raw === 'group' || t.raw === 'multi-person' || t.raw === 'harem' || t.raw === 'gangbang');

      let newList = list.filter(t => 
        t.raw !== 'nude' && t.raw !== 'naked' && t.raw !== 'completely nude' && t.raw !== 'fully nude'
      );

      const addTag = (raw, zh, category = 'NSFW') => {
        const { clean, weight } = parseTag(raw);
        if (!newList.some(t => t.raw === raw)) {
          newList.push({ raw, clean, weight, category, zh });
        }
      };

      if (has1girl && has1boy) {
        addTag('naked boy', '赤裸男孩');
        addTag('naked girl', '赤裸女孩');
        addTag('both nude', '两人皆裸');
      } else if (has2girls) {
        addTag('naked girls', '赤裸女孩们');
        addTag('both nude', '两人皆裸');
      } else if (has3girls) {
        addTag('naked girls', '赤裸女孩们');
        addTag('all nude', '全员皆裸');
      } else if (hasGroup) {
        addTag('naked group', '赤裸群组');
        addTag('all nude', '全员皆裸');
      } else if (has1boy) {
        addTag('naked boy', '赤裸男孩');
      } else {
        addTag('naked girl', '赤裸女孩');
      }

      return newList;
    };

    const isMultiCharacter = (activeStyleKey === 'multi') || 
                             (['lewd', 'bdsm', 'stealth'].includes(activeStyleKey) && Math.random() < 0.6);

    if (['lewd', 'bdsm', 'stealth'].includes(activeStyleKey)) {
      const adultTags = [];

      const addAdultTag = (raw, zh, category = 'NSFW') => {
        const { clean, weight } = parseTag(raw);
        if (!adultTags.some(t => t.raw === raw)) {
          adultTags.push({ raw, clean, weight, category, zh });
        }
      };

      if (activeStyleKey === 'bdsm') {
        setGenModel('pony');
        setGenRating('explicit');

        if (isMultiCharacter) {
          const bdsmStarters = [
            [['1girl', '一个女孩'], ['1boy', '一个男孩'], ['couple', '情侣/双人'], ['femdom', '女尊'], ['submissive', '顺从']],
            [['2girls', '两个女孩'], ['duo', '双人'], ['shibari', '日式绳艺'], ['bound torso', '捆绑躯干']],
            [['1girl', '一个女孩'], ['1boy', '一个男孩'], ['couple', '情侣/双人'], ['maledom', '男尊'], ['slave', '奴隶']]
          ];
          const choice = bdsmStarters[Math.floor(Math.random() * bdsmStarters.length)];
          choice.forEach(([r, z]) => addAdultTag(r, z, 'General'));
        } else {
          addAdultTag('1girl', '1个女孩', 'General');
          addAdultTag('solo', '单人', 'General');
        }

        const bdsmPosesPool = [
          ['kneeling', '跪姿'],
          ['on all fours', '四肢着地'],
          ['arms behind back', '双手反剪'],
          ['wrists bound', '绑住手腕'],
          ['arms bound', '绑住手臂'],
          ['hogtied', '五花大绑'],
          ['spread eagle', '大字形绑缚'],
          ['suspension', '悬吊'],
          ['bound to chair', '绑在椅子上'],
          ['crawling', '双膝跪地爬行'],
          ['lying on back', '仰躺'],
          ['lying on stomach', '趴着'],
          ['kneeling on one knee', '单膝跪地'],
          ['tied to pole', '绑在柱子上'],
          ['fetal position', '蜷缩姿势']
        ];

        const templates = [
          [
            ['shibari', '日式绳艺'], ['kinbaku', '绳缚'], ['hemp rope', '麻绳'], 
            ['bound torso', '捆绑躯干'], ['rope marks', '绳痕'], 
            ['skindentation', '勒痕'], 
            ['girl face visible', '女孩脸部可见'], ['at least one face visible', '至少有一张脸可见']
          ],
          [
            ['ball gag', '口球'], ['ring gag', '口圈'], ['drooling', '流口水'], 
            ['saliva trail', '唾液线'], 
            ['tears', '泪水'], ['struggling', '挣扎'], ['choker', '项圈'], ['leash', '牵引绳'],
            ['girl face visible', '女孩脸部可见'], ['at least one face visible', '至少有一张脸可见']
          ],
          [
            ['bound', '被绑'], 
            ['handcuffs', '手铐'], ['blindfold', '眼罩'], ['scared', '害怕'], 
            ['crying', '哭泣'], ['whip marks', '鞭痕'],
            ['girl face visible', '女孩脸部可见'], ['at least one face visible', '至少有一张脸可见']
          ]
        ];

        const chosenTemplate = templates[Math.floor(Math.random() * templates.length)];
        chosenTemplate.forEach(([r, z]) => addAdultTag(r, z));

        const chosenPose = bdsmPosesPool[Math.floor(Math.random() * bdsmPosesPool.length)];
        addAdultTag(chosenPose[0], chosenPose[1]);

        const bdsmBackgrounds = [
          ['dungeon', '地牢'], ['prison cell', '牢房'], ['dark room', '暗室'], ['stone wall', '石墙'],
          ['bdsm club', '俱乐部'], ['laboratory', '实验室'], ['torture chamber', '审讯室'], ['castle dungeon', '城堡地牢'],
          ['abandoned warehouse', '废弃仓库'], ['cage', '铁笼'], ['ruins', '遗迹'], ['shrine', '神社'],
          ['execution chamber', '刑讯室'], ['attic', '阁楼'], ['basement', '地下室'], ['red light district', '红灯区']
        ];
        const bg = bdsmBackgrounds[Math.floor(Math.random() * bdsmBackgrounds.length)];
        addAdultTag(bg[0], bg[1], 'Backgrounds');

        const light = [
          ['dim lighting', '昏暗光线'], ['dramatic shadow', '戏剧性阴影'], ['moody', '阴郁的']
        ][Math.floor(Math.random() * 3)];
        addAdultTag(light[0], light[1], 'Lighting');

        const bdsmClothingPool = [
          [['nude', '裸体']],
          [['nude', '裸体'], ['fishnet stockings', '渔网袜', 'clothes']],
          [['nude', '裸体'], ['thighhighs', '大腿袜', 'clothes']],
          [['latex bodysuit', '乳胶紧身衣', 'clothes']],
          [['leather lingerie', '皮革内衣', 'clothes']],
          [['bondage suit', '束缚衣', 'clothes']],
          [['apron', '围裙', 'clothes'], ['apron only', '仅穿围裙']],
          [['school uniform', '学校制服', 'clothes'], ['half dressed', '半脱衣物']],
          [['wet clothes', '湿透的衣服', 'clothes']],
          [['sukemizu', '透水死库水', 'clothes']]
        ];
        const chosenClothes = bdsmClothingPool[Math.floor(Math.random() * bdsmClothingPool.length)];
        chosenClothes.forEach(c => addAdultTag(c[0], c[1], c[2] || 'NSFW'));

      } else if (activeStyleKey === 'stealth') {
        setGenModel('pony');
        setGenRating('explicit');

        if (isMultiCharacter) {
          addAdultTag('1girl', '一个女孩', 'General');
          addAdultTag('1boy', '一个男孩', 'General');
        } else {
          addAdultTag('1girl', '一个女孩', 'General');
          addAdultTag('solo', '单人', 'General');
        }

        const stealthPosesPool = [
          ['under table', '桌子底下'],
          ['sitting on lap', '坐在大腿上'],
          ['straddling', '跨坐'],
          ['leaning forward', '身体前倾'],
          ['bent over', '弯腰/翘臀'],
          ['standing sex', '站立姿'],
          ['against wall', '靠墙站立'],
          ['kneeling under desk', '跪在桌下'],
          ['lying under covers', '躺在被子下'],
          ['sitting on desk', '坐在办公桌上'],
          ['lifting person', '被抱起'],
          ['hanging legs', '悬空双腿']
        ];

        const templates = [
          [
            ['upper body normal', '上半身正常'], ['smile', '微笑'], ['table', '桌子'], 
            ['no panties', '无内裤'], ['legs trembling', '双腿颤抖'], 
            ['pussy juice trail', '爱液痕迹'], ['stealth sex', '隐秘性交'], 
            ['boy head out of frame', '男孩头部出框'], ['girl face visible', '女孩脸部可见'],
            ['at least one face visible', '至少有一张脸可见']
          ],
          [
            ['lifting person', '抱起'], ['feet', '双脚'], ['toes', '脚趾'], ['toe scrunch', '脚趾蜷缩'], 
            ['trembling', '发抖'], ['pussy juice trail', '爱液滴落'],
            ['boy head out of frame', '男孩头部出框'], ['girl face visible', '女孩脸部可见'],
            ['at least one face visible', '至少有一张脸可见']
          ],
          [
            ['against glass', '贴在玻璃上'], ['frosted glass', '磨砂玻璃'], 
            ['breast press', '乳房贴玻璃'], ['stealth sex', '隐秘性交'], ['from outside', '从室外拍摄'], 
            ['x-ray', '透视线'], ['girl face visible', '女孩脸部可见'], ['at least one face visible', '至少有一张脸可见']
          ],
          [
            ['playing games', '打游戏'], ['holding controller', '手握手柄'], 
            ['stealth sex', '隐秘性交'], ['implied sex', '暗示性行为'], ['expressionless', '面无表情'], 
            ['upper body normal', '上半身正常'], ['cum string', '精液拉丝'],
            ['boy head out of frame', '男孩头部出框'], ['girl face visible', '女孩脸部可见'],
            ['at least one face visible', '至少有一张脸可见']
          ]
        ];

        const chosenTemplate = templates[Math.floor(Math.random() * templates.length)];
        chosenTemplate.forEach(([r, z]) => addAdultTag(r, z));

        const chosenPose = stealthPosesPool[Math.floor(Math.random() * stealthPosesPool.length)];
        addAdultTag(chosenPose[0], chosenPose[1]);

        const stealthBackgrounds = [
          ['restaurant', '餐厅'], ['office', '办公室'], ['classroom', '教室'], ['living room', '客厅'],
          ['library', '图书馆'], ['train carriage', '火车车厢'], ['subway', '地铁'], ['public restroom', '公共洗手间'],
          ['fitting room', '试衣间'], ['cinema', '电影院'], ['bus', '公交车'], ['beach', '沙滩'],
          ['park bench', '公园长椅'], ['elevator', '电梯'], ['hotel lobby', '酒店大堂'], ['cafe', '咖啡馆'],
          ['pantry', '茶水间'], ['store', '百货商店']
        ];
        const bg = stealthBackgrounds[Math.floor(Math.random() * stealthBackgrounds.length)];
        addAdultTag(bg[0], bg[1], 'Backgrounds');

        const stealthClothingPool = [
          [['skirt lift', '掀起裙子'], ['skirt', '裙子', 'clothes']],
          [['skirt lift', '掀起裙子'], ['dress', '连衣裙', 'clothes']],
          [['skirt lift', '掀起裙角'], ['cheongsam', '旗袍', 'clothes']],
          [['apron', '围裙', 'clothes'], ['apron only', '仅穿围裙']],
          [['unbuttoned shirt', '解开纽扣的衬衫'], ['shirt', '衬衫', 'clothes']],
          [['off-shoulder sweater', '露肩毛衣'], ['sweater', '毛衣', 'clothes']],
          [['school uniform', '学校制服', 'clothes'], ['half dressed', '半脱衣物']],
          [['pantyhose pull', '扯丝袜'], ['pantyhose', '丝袜', 'clothes']],
          [['yukata', '浴衣', 'clothes'], ['half dressed', '半脱衣物']],
          [['half dressed', '半脱衣物']]
        ];
        const chosenClothes = stealthClothingPool[Math.floor(Math.random() * stealthClothingPool.length)];
        chosenClothes.forEach(c => addAdultTag(c[0], c[1], c[2] || 'NSFW'));

      } else if (activeStyleKey === 'lewd') {
        setGenModel('pony');
        setGenRating('explicit');

        if (isMultiCharacter) {
          const lewdStarters = [
            [['1girl', '一个女孩'], ['1boy', '一个男孩'], ['couple', '情侣/双人']],
            [['2girls', '两个女孩'], ['duo', '双人'], ['yuri', '百合']],
            [['group', '群组/多人'], ['gangbang', '群交']]
          ];
          const choice = lewdStarters[Math.floor(Math.random() * lewdStarters.length)];
          choice.forEach(([r, z]) => addAdultTag(r, z, 'General'));
        } else {
          addAdultTag('1girl', '一个女孩', 'General');
          addAdultTag('solo', '单人', 'General');
        }

        const lewdPosesPool = [
          ['cowgirl position', '骑乘位'],
          ['reverse cowgirl position', '反向骑乘'],
          ['missionary position', '传教士式'],
          ['doggy style', '后入式'],
          ['all fours', '四肢趴地'],
          ['mating press', '压迫式'],
          ['suspended double span', '悬空抱入'],
          ['sitting on lap', '坐在大腿上'],
          ['bent over table', '趴在桌上'],
          ['legs up', '抬起双腿'],
          ['legs spread', '双腿大开'],
          ['kneeling', '跪姿'],
          ['fellatio', '口交姿势'],
          ['face down', '脸朝下俯卧']
        ];

        const templates = [
          [
            ['ahegao', '阿黑颜'], ['breast', '乳房'], ['buttocks', '臀部'], 
            ['creampie', '内射'], ['pussy', '阴部'],
            ['girl face visible', '女孩脸部可见'], ['at least one face visible', '至少有一张脸可见']
          ],
          [
            ['drooling', '流口水'], ['heart in eye', '心形瞳'], ['crying', '抽泣'], 
            ['breast bounce', '乳房晃动'],
            ['girl face visible', '女孩脸部可见'], ['at least one face visible', '至少有一张脸可见']
          ],
          [
            ['blush', '脸红'], 
            ['cum on face', '脸上射精'], ['open mouth', '张嘴'], ['tongue out', '吐舌头'], 
            ['deep throat', '深喉'],
            ['girl face visible', '女孩脸部可见'], ['at least one face visible', '至少有一张脸可见']
          ]
        ];

        const chosenTemplate = templates[Math.floor(Math.random() * templates.length)];
        chosenTemplate.forEach(([r, z]) => addAdultTag(r, z));

        const chosenPose = lewdPosesPool[Math.floor(Math.random() * lewdPosesPool.length)];
        addAdultTag(chosenPose[0], chosenPose[1]);

        const lewdClothingPool = [
          [['nude', '裸体']],
          [['nude', '裸体'], ['thighhighs', '过膝袜', 'clothes']],
          [['lingerie', '性感内衣', 'clothes']],
          [['underwear', '内衣裤', 'clothes']],
          [['micro bikini', '微型比基尼', 'clothes']],
          [['apron', '围裙', 'clothes'], ['apron only', '仅穿围裙']],
          [['unbuttoned shirt', '敞开的衬衫', 'clothes']],
          [['open front dress', '前开襟连衣裙', 'clothes']],
          [['bunny suit', '兔女郎装', 'clothes']],
          [['half dressed', '半脱衣物']]
        ];
        const chosenClothes = lewdClothingPool[Math.floor(Math.random() * lewdClothingPool.length)];
        chosenClothes.forEach(c => addAdultTag(c[0], c[1], c[2] || 'NSFW'));

        const lewdBackgrounds = [
          ['bed', '床上'], ['room', '房间'], ['hotel', '酒店'], ['bathroom', '浴室'],
          ['love hotel', '情趣酒店'], ['swimming pool', '游泳池'], ['onsen', '温泉'], ['shower room', '淋浴间'],
          ['sofa', '沙发'], ['beach', '海滩'], ['jacuzzi', '按摩浴缸'], ['tatami room', '榻榻米房间'],
          ['tent', '帐篷'], ['meadow', '草地'], ['balcony', '阳台'], ['dressing room', '化妆间']
        ];
        const bg = lewdBackgrounds[Math.floor(Math.random() * lewdBackgrounds.length)];
        addAdultTag(bg[0], bg[1], 'Backgrounds');
      }

      let filteredList = [...adultTags];
      const hasNude = filteredList.some(t => t.raw === 'nude' || t.raw === 'naked' || t.raw === 'completely nude' || t.raw === 'fully nude');
      if (hasNude) {
        const bdsmGear = ['rope', 'handcuffs', 'gag', 'blindfold', 'chains', 'leash', 'collar', 'harness', 'apron', '绳', '绑', '手铐', '口球', '眼罩', '链', '牵引', '项圈', '器具', '围裙'];
        filteredList = filteredList.filter(t => 
          (t.category !== 'clothes' && t.category !== 'clothing_materials') || 
          bdsmGear.some(g => t.raw.toLowerCase().includes(g) || (t.zh && t.zh.toLowerCase().includes(g)))
        );
      }
      if (!isMultiCharacter) {
        const forbiddenExact = ['1boy', 'couple', 'duo', 'trio', 'group', 'multi-person', 'partner', 'gangbang', 'threesome', 'yuri', 'yaoi', 'double desk', 'sitting on lap', 'playing games with partner'];
        const forbiddenSubstrings = ['boy', 'sex', 'penetration', 'fellatio', 'cunnilingus', 'creampie', 'lap', '男', '双人', '情侣', '大腿', '性交', '插入', '口交', '内射'];
        filteredList = filteredList.filter(t => {
          const rawLower = t.raw.toLowerCase();
          const zhLower = (t.zh || '').toLowerCase();
          if (forbiddenExact.some(w => rawLower === w)) return false;
          if (forbiddenSubstrings.some(sub => {
            if (sub === 'boy') return /\bboy/i.test(rawLower) || zhLower.includes('男');
            if (sub === 'sex') return /\bsex/i.test(rawLower) || zhLower.includes('性交');
            if (sub === 'lap') return /\blap\b/i.test(rawLower) || zhLower.includes('大腿');
            return rawLower.includes(sub) || zhLower.includes(sub);
          })) {
            return false;
          }
          return true;
        });
      }
      filteredList = expandNudityTags(filteredList);
      setSelectedTags(filteredList);
      
      const styleDisplayNames = {
        bdsm: '束缚调教',
        stealth: '隐奸推荐',
        lewd: '羞羞推荐'
      };
      showToast(`已成功推荐生成【${styleDisplayNames[activeStyleKey]}】风格的生图提示词！`);
      return;
    }

    const pickCategoryTag = (categoryName, limit = 1, forceMatch = false) => {
      if (!tagDatabase[categoryName]) return;
      const catData = tagDatabase[categoryName];
      const tags = catData.tags;
      if (!tags || tags.length === 0) return;

      const keywords = styleConfig.keywords[categoryName];
      let candidatePool = [];

      if (keywords) {
        candidatePool = tags.filter(tag => {
          const en = Array.isArray(tag) ? tag[0] : tag;
          const zh = Array.isArray(tag) ? tag[1] : '';
          return keywords.some(kw => en.toLowerCase().includes(kw) || (zh && zh.toLowerCase().includes(kw)));
        });
      }

      if (candidatePool.length === 0) {
        if (forceMatch) {
          return;
        }
        candidatePool = tags;
      }

      const shuffled = [...candidatePool].sort(() => 0.5 - Math.random());
      const chosen = shuffled.slice(0, Math.min(limit, shuffled.length));

      chosen.forEach(tag => {
        const raw = Array.isArray(tag) ? tag[0] : tag;
        const zh = Array.isArray(tag) ? tag[1] : '';
        const { clean, weight } = parseTag(raw);
        if (!selectedList.some(t => t.raw === raw)) {
          selectedList.push({ raw, clean, weight, category: categoryName, zh });
        }
      });
    };

    if (isMultiCharacter) {
      const multiStarters = [
        [['2girls', '两个女孩'], ['duo', '双人']], 
        [['1girl', '一个女孩'], ['1boy', '一个男孩'], ['couple', '情侣/双人']], 
        [['3girls', '三个女孩'], ['trio', '三人']], 
        [['group', '群组/多人'], ['multi-person', '多人']]
      ];
      const starter = multiStarters[Math.floor(Math.random() * multiStarters.length)];
      starter.forEach(([raw, zh]) => {
        const { clean, weight } = parseTag(raw);
        selectedList.push({ raw, clean, weight, category: 'General', zh });
      });
    } else {
      const isFemale = Math.random() < 0.9;
      const genderTags = isFemale ? [['1girl', '1个女孩'], ['solo', '单人']] : [['1boy', '1个男孩'], ['solo', '单人']];
      genderTags.forEach(([raw, zh]) => {
        const { clean, weight } = parseTag(raw);
        selectedList.push({ raw, clean, weight, category: 'General', zh });
      });
    }

    pickCategoryTag('Themes', 2);

    if (activeStyleKey === 'lewd' && tagDatabase.NSFW) {
      if (isMultiCharacter) {
        const interactionNsfw = ['sex', 'penetration', 'cowgirl position', 'missionary', 'doggy style', 'fellatio', 'cunnilingus', 'double penetration', 'gangbang', 'threesome', 'yaoi', 'yuri', 'hetero'];
        const tags = tagDatabase.NSFW.tags;
        const candidatePool = tags.filter(tag => {
          const en = Array.isArray(tag) ? tag[0] : tag;
          return interactionNsfw.some(kw => en.toLowerCase().includes(kw));
        });
        const chosenCount = 2;
        const shuffled = (candidatePool.length > 0 ? candidatePool : tags).sort(() => 0.5 - Math.random());
        shuffled.slice(0, chosenCount).forEach(tag => {
          const raw = Array.isArray(tag) ? tag[0] : tag;
          const zh = Array.isArray(tag) ? tag[1] : '';
          const { clean, weight } = parseTag(raw);
          selectedList.push({ raw, clean, weight, category: 'NSFW', zh });
        });
      } else {
        pickCategoryTag('NSFW', 3);
      }
    }

    if (activeStyleKey === 'bdsm' && tagDatabase.NSFW) {
      if (isMultiCharacter) {
        const bdsmMultiKeywords = ['femdom', 'maledom', 'leash', 'collar', 'spanking', 'flogging', 'bondage', 'submission', 'dominant', 'submissive', 'slave', 'master'];
        const tags = tagDatabase.NSFW.tags;
        const candidatePool = tags.filter(tag => {
          const en = Array.isArray(tag) ? tag[0] : tag;
          const zh = Array.isArray(tag) ? tag[1] : '';
          return bdsmMultiKeywords.some(kw => en.toLowerCase().includes(kw) || (zh && zh.toLowerCase().includes(kw)));
        });
        const chosenCount = 2;
        const shuffled = (candidatePool.length > 0 ? candidatePool : tags).sort(() => 0.5 - Math.random());
        shuffled.slice(0, chosenCount).forEach(tag => {
          const raw = Array.isArray(tag) ? tag[0] : tag;
          const zh = Array.isArray(tag) ? tag[1] : '';
          const { clean, weight } = parseTag(raw);
          selectedList.push({ raw, clean, weight, category: 'NSFW', zh });
        });
      } else {
        pickCategoryTag('NSFW', 2);
      }
    }

    if (activeStyleKey === 'stealth' && tagDatabase.NSFW) {
      if (isMultiCharacter) {
        const stealthMultiKeywords = ['stealth sex', 'implied sex', 'under table', 'sitting on lap', 'double desk', 'public use', 'office sex', 'secret relationship'];
        const tags = tagDatabase.NSFW.tags;
        const candidatePool = tags.filter(tag => {
          const en = Array.isArray(tag) ? tag[0] : tag;
          const zh = Array.isArray(tag) ? tag[1] : '';
          return stealthMultiKeywords.some(kw => en.toLowerCase().includes(kw) || (zh && zh.toLowerCase().includes(kw)));
        });
        const chosenCount = 2;
        const shuffled = (candidatePool.length > 0 ? candidatePool : tags).sort(() => 0.5 - Math.random());
        shuffled.slice(0, chosenCount).forEach(tag => {
          const raw = Array.isArray(tag) ? tag[0] : tag;
          const zh = Array.isArray(tag) ? tag[1] : '';
          const { clean, weight } = parseTag(raw);
          selectedList.push({ raw, clean, weight, category: 'NSFW', zh });
        });
      } else {
        pickCategoryTag('NSFW', 2);
      }
    }

    if (activeStyleKey === 'multi' && (genRating === 'nsfw' || genRating === 'explicit') && tagDatabase.NSFW) {
      const groupNsfwKeywords = ['threesome', 'foursome', 'gangbang', 'group sex', 'double penetration', 'dp', '三人行', '群交', '双重插入', 'harem', '后宫'];
      const tags = tagDatabase.NSFW.tags;
      const candidatePool = tags.filter(tag => {
        const en = Array.isArray(tag) ? tag[0] : tag;
        const zh = Array.isArray(tag) ? tag[1] : '';
        return groupNsfwKeywords.some(kw => en.toLowerCase().includes(kw) || (zh && zh.toLowerCase().includes(kw)));
      });
      if (candidatePool.length > 0) {
        const chosen = candidatePool[Math.floor(Math.random() * candidatePool.length)];
        const raw = Array.isArray(chosen) ? chosen[0] : chosen;
        const zh = Array.isArray(chosen) ? chosen[1] : '';
        const { clean, weight } = parseTag(raw);
        selectedList.push({ raw, clean, weight, category: 'NSFW', zh });
      }
    }

    if (tagDatabase.Environment_Setting) {
      pickCategoryTag('Environment_Setting', 1, true);
    }
    if (tagDatabase.Backgrounds) {
      pickCategoryTag('Backgrounds', 1, true);
    }

    pickCategoryTag('clothes', 2);
    pickCategoryTag('hair', 1);

    if (activeStyleKey === 'lewd' && tagDatabase.Emotions_Expressions) {
      const lewdExpressions = ['blush', 'heart in eye', 'ahegao', 'drooling', 'panting', 'crying'];
      const catData = tagDatabase.Emotions_Expressions;
      const filtered = catData.tags.filter(tag => {
        const en = Array.isArray(tag) ? tag[0] : tag;
        return lewdExpressions.some(le => en.toLowerCase().includes(le));
      });
      const chosenTag = filtered.length > 0 
        ? filtered[Math.floor(Math.random() * filtered.length)]
        : catData.tags[Math.floor(Math.random() * catData.tags.length)];
      const raw = Array.isArray(chosenTag) ? chosenTag[0] : chosenTag;
      const zh = Array.isArray(chosenTag) ? chosenTag[1] : '';
      const { clean, weight } = parseTag(raw);
      selectedList.push({ raw, clean, weight, category: 'Emotions_Expressions', zh });
    } else if (activeStyleKey === 'bdsm' && tagDatabase.Emotions_Expressions) {
      const bdsmExpressions = ['tears', 'crying', 'scared', 'struggling', 'empty eyes', 'mind break', '哭', '泪', '害怕', '挣扎', '空洞', '崩溃'];
      const catData = tagDatabase.Emotions_Expressions;
      const filtered = catData.tags.filter(tag => {
        const en = Array.isArray(tag) ? tag[0] : tag;
        const zh = Array.isArray(tag) ? tag[1] : '';
        return bdsmExpressions.some(be => en.toLowerCase().includes(be) || (zh && zh.toLowerCase().includes(be)));
      });
      const chosenTag = filtered.length > 0 
        ? filtered[Math.floor(Math.random() * filtered.length)]
        : catData.tags[Math.floor(Math.random() * catData.tags.length)];
      const raw = Array.isArray(chosenTag) ? chosenTag[0] : chosenTag;
      const zh = Array.isArray(chosenTag) ? chosenTag[1] : '';
      const { clean, weight } = parseTag(raw);
      selectedList.push({ raw, clean, weight, category: 'Emotions_Expressions', zh });
    } else if (activeStyleKey === 'stealth' && tagDatabase.Emotions_Expressions) {
      const stealthExpressions = ['smile', 'neutral expression', 'expressionless', 'happy', '微笑', '日常', '无表情', '开心'];
      const catData = tagDatabase.Emotions_Expressions;
      const filtered = catData.tags.filter(tag => {
        const en = Array.isArray(tag) ? tag[0] : tag;
        const zh = Array.isArray(tag) ? tag[1] : '';
        return stealthExpressions.some(se => en.toLowerCase().includes(se) || (zh && zh.toLowerCase().includes(se)));
      });
      const chosenTag = filtered.length > 0 
        ? filtered[Math.floor(Math.random() * filtered.length)]
        : catData.tags[Math.floor(Math.random() * catData.tags.length)];
      const raw = Array.isArray(chosenTag) ? chosenTag[0] : chosenTag;
      const zh = Array.isArray(chosenTag) ? chosenTag[1] : '';
      const { clean, weight } = parseTag(raw);
      selectedList.push({ raw, clean, weight, category: 'Emotions_Expressions', zh });
    } else {
      pickCategoryTag('Emotions_Expressions', 1);
    }

    if (activeStyleKey === 'bdsm' && tagDatabase.Poses) {
      const bdsmPoses = ['kneeling', 'arms behind back', 'hogtie', 'spread eagle', 'suspension', 'bound', 'crawling', '跪', '绑', '反绑', '四肢着地'];
      const catData = tagDatabase.Poses;
      const filtered = catData.tags.filter(tag => {
        const en = Array.isArray(tag) ? tag[0] : tag;
        const zh = Array.isArray(tag) ? tag[1] : '';
        return bdsmPoses.some(bp => en.toLowerCase().includes(bp) || (zh && zh.toLowerCase().includes(bp)));
      });
      const chosenTag = filtered.length > 0 
        ? filtered[Math.floor(Math.random() * filtered.length)]
        : catData.tags[Math.floor(Math.random() * catData.tags.length)];
      const raw = Array.isArray(chosenTag) ? chosenTag[0] : chosenTag;
      const zh = Array.isArray(chosenTag) ? chosenTag[1] : '';
      const { clean, weight } = parseTag(raw);
      selectedList.push({ raw, clean, weight, category: 'Poses', zh });
    } else {
      pickCategoryTag('Poses', 1);
    }

    if (tagDatabase.Lighting) pickCategoryTag('Lighting', 1, true);

    if (activeStyleKey === 'stealth' && tagDatabase.Perspective) {
      const stealthPerspectives = ['head out of frame', 'lower body only', 'view between legs', 'split screen', 'from below', 'from outside', 'through window', '无脸', '仅下半身', '裆部视角', '分屏', '仰视', '外面', '窗户'];
      const catData = tagDatabase.Perspective;
      const filtered = catData.tags.filter(tag => {
        const en = Array.isArray(tag) ? tag[0] : tag;
        const zh = Array.isArray(tag) ? tag[1] : '';
        return stealthPerspectives.some(sp => en.toLowerCase().includes(sp) || (zh && zh.toLowerCase().includes(sp)));
      });
      const chosenTag = filtered.length > 0 
        ? filtered[Math.floor(Math.random() * filtered.length)]
        : catData.tags[Math.floor(Math.random() * catData.tags.length)];
      const raw = Array.isArray(chosenTag) ? chosenTag[0] : chosenTag;
      const zh = Array.isArray(chosenTag) ? chosenTag[1] : '';
      const { clean, weight } = parseTag(raw);
      selectedList.push({ raw, clean, weight, category: 'Perspective', zh });
    } else if (tagDatabase.Perspective) {
      pickCategoryTag('Perspective', 1, true);
    }

    if (tagDatabase.Props_Objects) pickCategoryTag('Props_Objects', 1, true);
    if (tagDatabase.Accessory) pickCategoryTag('Accessory', 1, true);

    let filteredList = [...selectedList];

    const hasNude = filteredList.some(t => t.raw === 'nude' || t.raw === 'naked' || t.raw === 'completely nude' || t.raw === 'fully nude');
    const hasTopless = filteredList.some(t => t.raw === 'topless' || t.raw === 'exposed breasts' || t.raw === 'exposed_breasts');
    const hasBottomless = filteredList.some(t => t.raw === 'bottomless');
    const hasBarefoot = filteredList.some(t => t.raw === 'barefoot');
    const hasNoBra = filteredList.some(t => t.raw === 'no bra' || t.raw === 'no_bra');
    const hasNoPanties = filteredList.some(t => t.raw === 'no panties' || t.raw === 'no_panties');

    if (hasNude) {
      const bdsmGear = ['rope', 'handcuffs', 'gag', 'blindfold', 'chains', 'leash', 'collar', 'harness', 'apron', '绳', '绑', '手铐', '口球', '眼罩', '链', '牵引', '项圈', '器具', '围裙'];
      filteredList = filteredList.filter(t => 
        (t.category !== 'clothes' && t.category !== 'clothing_materials') || 
        bdsmGear.some(g => t.raw.toLowerCase().includes(g) || (t.zh && t.zh.toLowerCase().includes(g)))
      );
    } else {
      if (hasTopless) {
        const topWords = ['shirt', 'sweater', 'jacket', 'coat', 'hanfu', 'cheongsam', 'dress', 'kimono', 'hoodie', 'blouse', 't-shirt', 'vest', 'corset', '衬衫', '毛衣', '夹克', '外套', '大衣', '汉服', '旗袍', '连衣裙', '和服', '连帽衫', '女衬衫', '恤', '背心', '束身衣'];
        filteredList = filteredList.filter(t => {
          if (t.category === 'clothes') return !topWords.some(w => t.raw.toLowerCase().includes(w) || (t.zh && t.zh.toLowerCase().includes(w)));
          return true;
        });
      }
      if (hasBottomless) {
        const bottomWords = ['pants', 'shorts', 'skirt', 'jeans', 'hanfu', 'cheongsam', 'dress', 'kimono', 'panties', 'underwear', '裤', '短裤', '裙', '牛仔裤', '汉服', '旗袍', '连衣裙', '和服', '内裤', '内衣'];
        filteredList = filteredList.filter(t => {
          if (t.category === 'clothes') return !bottomWords.some(w => t.raw.toLowerCase().includes(w) || (t.zh && t.zh.toLowerCase().includes(w)));
          return true;
        });
      }
    }

    if (hasBarefoot) {
      const shoeWords = ['shoes', 'boots', 'sneakers', 'sandals', 'slippers', 'footwear', '鞋', '靴', '运动鞋', '凉鞋', '拖鞋'];
      filteredList = filteredList.filter(t => !shoeWords.some(w => t.raw.toLowerCase().includes(w) || (t.zh && t.zh.toLowerCase().includes(w))));
    }

    if (hasNoBra) filteredList = filteredList.filter(t => t.raw !== 'bra' && (!t.zh || !t.zh.includes('胸罩')));
    if (hasNoPanties) filteredList = filteredList.filter(t => t.raw !== 'panties' && (!t.zh || !t.zh.includes('内裤')));

    if (!isMultiCharacter) {
      const has1girl = filteredList.some(t => t.raw === '1girl');
      const has1boy = filteredList.some(t => t.raw === '1boy');
      if (has1girl && has1boy) {
        filteredList = filteredList.filter(t => t.raw !== '1boy');
      }
      const forbiddenExact = ['1boy', 'couple', 'duo', 'trio', 'group', 'multi-person', 'partner', 'gangbang', 'threesome', 'yuri', 'yaoi', 'double desk', 'sitting on lap', 'playing games with partner'];
      const forbiddenSubstrings = ['boy', 'sex', 'penetration', 'fellatio', 'cunnilingus', 'creampie', 'lap', '男', '双人', '情侣', '大腿', '性交', '插入', '口交', '内射'];
      filteredList = filteredList.filter(t => {
        const rawLower = t.raw.toLowerCase();
        const zhLower = (t.zh || '').toLowerCase();
        if (forbiddenExact.some(w => rawLower === w)) return false;
        if (forbiddenSubstrings.some(sub => {
          if (sub === 'boy') return /\bboy/i.test(rawLower) || zhLower.includes('男');
          if (sub === 'sex') return /\bsex/i.test(rawLower) || zhLower.includes('性交');
          if (sub === 'lap') return /\blap\b/i.test(rawLower) || zhLower.includes('大腿');
          return rawLower.includes(sub) || zhLower.includes(sub);
        })) {
          return false;
        }
        return true;
      });
    }

    filteredList = expandNudityTags(filteredList);
    setSelectedTags(filteredList);

    const styleDisplayNames = {
      anime: '日系二次元',
      realistic: '写实人像',
      cyberpunk: '赛博朋克',
      fantasy: '魔法奇幻',
      chinese: '国风华服',
      scifi: '科幻太空',
      pastoral: '清新田园',
      multi: '多人合照',
      bdsm: '束缚调教',
      stealth: '隐奸推荐',
      lewd: '羞羞推荐'
    };

    showToast(`已成功推荐生成【${styleDisplayNames[activeStyleKey]}】风格的生图提示词！`);
  };

  // Fetch scanned media data
  useEffect(() => {
    fetch('/media-data.json')
      .then(res => {
        if (!res.ok) {
          throw new Error('Media metadata JSON not found. Please run the scanner.');
        }
        return res.json();
      })
      .then(data => {
        setImages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading image metadata:', err);
        setLoading(false);
      });
  }, []);

  // Handler for directory import
  const handleImportDirectory = async () => {
    try {
      if (!window.showDirectoryPicker) {
        alert('您的浏览器不支持 File System Access API。请使用最新版的 Chrome, Edge 或 Safari 浏览器访问。');
        return;
      }
      
      const dirHandle = await window.showDirectoryPicker();
      setImporting(true);
      setImportStatus('正在扫描文件夹结构...');
      
      const localImages = await scanLocalDirectory(dirHandle, (status) => {
        setImportStatus(status);
      });
      
      if (localImages.length === 0) {
        showToast('在该目录下未找到任何支持的媒体文件（图片/音视频）', 'error');
        setImporting(false);
        return;
      }
      
      setImages(localImages);
      setIsLocalImport(true);
      setSelectedCategory('all');
      setActiveTab('gallery'); // 自动跳转至画廊页
      showToast(`🎉 成功导入并解析了 ${localImages.length} 个本地媒体文件！`);
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Directory import error:', e);
        showToast('导入本地文件夹失败，请重试', 'error');
      }
    } finally {
      setImporting(false);
      setImportStatus('');
    }
  };

  // Handler to reload scanned server database
  const handleLoadScannedData = () => {
    setLoading(true);
    fetch('/media-data.json')
      .then(res => {
        if (!res.ok) {
          throw new Error('Media metadata JSON not found. Please run the scanner.');
        }
        return res.json();
      })
      .then(data => {
        setImages(data);
        setIsLocalImport(false);
        setSelectedCategory('all');
        setLoading(false);
        showToast('已成功切换回默认的已扫描数据库！');
      })
      .catch(err => {
        console.error('Error loading image metadata:', err);
        setLoading(false);
        showToast('加载默认数据库失败，请运行 scan 脚本进行同步', 'error');
      });
  };

  // Show Toast Helper
  const showToast = (message, field = '') => {
    setToast({ show: true, message, type: 'success' });
    if (field) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    }
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Clipboard copy helper
  const copyToClipboard = (text, fieldName, successMessage) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => showToast(successMessage || 'Successfully copied to clipboard!', fieldName))
      .catch(err => {
        console.error('Failed to copy: ', err);
        showToast('Failed to copy to clipboard', 'error');
      });
  };

  // Keyboard navigation for open modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;
      
      const filtered = getFilteredImages();
      const currentIndex = filtered.findIndex(img => img.id === selectedImage.id);

      if (e.key === 'Escape') {
        setSelectedImage(null);
      } else if (e.key === 'ArrowRight' && currentIndex < filtered.length - 1) {
        setSelectedImage(filtered[currentIndex + 1]);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setSelectedImage(filtered[currentIndex - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, selectedCategory, searchQuery, onlyWithMetadata, selectedModel, selectedSampler, images]);

  // Derived states
  const categories = ['all', ...new Set(images.map(img => img.category))];
  
  const models = [...new Set(images
    .map(img => img.metadata?.model)
    .filter(model => model && model.trim() !== '')
  )];

  const samplers = [...new Set(images
    .map(img => img.metadata?.sampler)
    .filter(sampler => sampler && sampler.trim() !== '')
  )];

  const totalImages = images.length;
  const totalCategories = categories.length - 1;
  const imagesWithMetadata = images.filter(img => img.metadata?.hasMetadata).length;
  const metadataPercentage = totalImages > 0 ? Math.round((imagesWithMetadata / totalImages) * 100) : 0;

  // Filter logic
  const getFilteredImages = () => {
    return images.filter(img => {
      // Category filter
      if (selectedCategory !== 'all' && img.category !== selectedCategory) {
        return false;
      }
      
      // Metadata filter
      if (onlyWithMetadata && !img.metadata?.hasMetadata) {
        return false;
      }

      // Model filter
      if (selectedModel && img.metadata?.model !== selectedModel) {
        return false;
      }

      // Sampler filter
      if (selectedSampler && img.metadata?.sampler !== selectedSampler) {
        return false;
      }

      // Search filter (searches prompt, filename, model, and category)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const promptText = (img.metadata?.prompt || '').toLowerCase();
        const negPromptText = (img.metadata?.negativePrompt || '').toLowerCase();
        const filename = img.filename.toLowerCase();
        const model = (img.metadata?.model || '').toLowerCase();
        const category = img.category.toLowerCase();
        const sampler = (img.metadata?.sampler || '').toLowerCase();

        return (
          promptText.includes(query) ||
          negPromptText.includes(query) ||
          filename.includes(query) ||
          model.includes(query) ||
          category.includes(query) ||
          sampler.includes(query)
        );
      }

      return true;
    });
  };

  const filteredImages = getFilteredImages();

  // Navigation handlers
  const handlePrevImage = (e) => {
    e.stopPropagation();
    const filtered = getFilteredImages();
    const currentIndex = filtered.findIndex(img => img.id === selectedImage.id);
    if (currentIndex > 0) {
      setSelectedImage(filtered[currentIndex - 1]);
    }
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    const filtered = getFilteredImages();
    const currentIndex = filtered.findIndex(img => img.id === selectedImage.id);
    if (currentIndex < filtered.length - 1) {
      setSelectedImage(filtered[currentIndex + 1]);
    }
  };

  // Helper to trigger image download
  const downloadImage = (path, filename) => {
    const link = document.createElement('a');
    link.href = path;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloading ${filename}...`);
  };

  return (
    <div className="app-container">
      {/* Full-screen Loading Overlay for Import */}
      {importing && (
        <div className="import-loading-overlay animate-fade-in">
          <div className="import-loading-content">
            <div className="import-spinner-container">
              <div className="import-spinner"></div>
              <FolderOpen size={32} className="import-spinner-icon" />
            </div>
            <h3>正在读取本地文件夹</h3>
            <p className="import-status-text">{importStatus}</p>
            <div className="import-warning-tip">
              提示：首次读取大文件夹可能需要数秒时间，请在浏览器弹出权限请求时点击“允许访问”。
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="toast glass-panel animate-fade-in-up">
          <div className="toast-content">
            <Check size={18} className="toast-icon" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <a href="#" className="nav-logo" onClick={() => { setActiveTab('home'); setSelectedCategory('all'); }}>
            <span className="logo-icon gradient-bg"><Sparkles size={20} color="#fff" /></span>
            <span className="nav-logo-text gradient-text">PromptMedia</span>
          </a>
          
          <div className="navbar-actions">
            <ul className="nav-links">
              <li>
                <button 
                  className={`nav-link-btn nav-link ${activeTab === 'home' ? 'active' : ''}`}
                  onClick={() => setActiveTab('home')}
                >
                  首页
                </button>
              </li>
              <li>
                <button 
                  className={`nav-link-btn nav-link ${activeTab === 'gallery' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('gallery'); setSelectedCategory('all'); }}
                >
                  分类媒体库
                </button>
              </li>
              <li>
                <button 
                  className={`nav-link-btn nav-link ${activeTab === 'generator' ? 'active' : ''}`}
                  onClick={() => setActiveTab('generator')}
                >
                  提示词生成器
                </button>
              </li>
              <li>
                <button 
                  className={`nav-link-btn nav-link ${activeTab === 'ai-generator' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ai-generator')}
                >
                  AI 提示词大师
                </button>
              </li>
              <li>
                <button 
                  className={`nav-link-btn nav-link ${activeTab === 'guide' ? 'active' : ''}`}
                  onClick={() => setActiveTab('guide')}
                >
                  部署使用说明
                </button>
              </li>
            </ul>

            {/* Directory Switcher Controls */}
            <div className="directory-actions">
              {isLocalImport ? (
                <button 
                  className="nav-action-btn load-default-btn"
                  onClick={handleLoadScannedData}
                  title="切换回后端扫描的媒体数据库"
                >
                  <Database size={14} />
                  <span>载入默认库</span>
                </button>
              ) : (
                <button 
                  className="nav-action-btn import-local-btn"
                  onClick={handleImportDirectory}
                  disabled={importing}
                  title="导入并展示本地其他文件夹"
                >
                  <FolderOpen size={14} />
                  <span>{importing ? '解析中...' : '选择本地目录'}</span>
                </button>
              )}
            </div>

            {/* Theme selector widget */}
            <div className="theme-pill-selector">
              <button 
                className={`theme-pill-btn ${theme === 'fresh-mint' ? 'active' : ''}`}
                onClick={() => setTheme('fresh-mint')}
                title="清新雅致"
              >
                <Leaf size={14} />
                <span>清新</span>
              </button>
              <button 
                className={`theme-pill-btn ${theme === 'cyber-dark' ? 'active' : ''}`}
                onClick={() => setTheme('cyber-dark')}
                title="科技暗黑"
              >
                <Moon size={14} />
                <span>暗黑</span>
              </button>
              <button 
                className={`theme-pill-btn ${theme === 'dynamic-anime' ? 'active' : ''}`}
                onClick={() => setTheme('dynamic-anime')}
                title="炫酷动感"
              >
                <Zap size={14} />
                <span>动感</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Tab Content */}
      <main className="main-layout animate-fade-in">
        
        {/* HOMEPAGE TAB */}
        {activeTab === 'home' && (
          <div className="home-tab animate-fade-in">
            {/* Hero Section */}
            <section className="hero-section glass-panel">
              {theme === 'dynamic-anime' && (
                <div className="anime-floating-particles">
                  <div className="bubble bubble-1"></div>
                  <div className="bubble bubble-2"></div>
                  <div className="bubble bubble-3"></div>
                </div>
              )}
              <div className="hero-glow"></div>
              <div className="hero-content">
                <span className="hero-badge"><Sparkles size={14} /> AI Image Prompt Database</span>
                <h1 className="hero-title">
                  解密 AI 创作的 <span className="gradient-text">提示词密码</span>
                </h1>
                <p className="hero-description">
                  PromptMedia 是一款专为 ComfyUI 与 AI 艺术创作者打造的本地多媒体分类展示网站。
                  无需繁琐的后端部署，通过扫描本地文件夹即可瞬间提取 PNG/WebP 图像元数据中的生成参数，并支持音视频文件预览。
                </p>
                <div className="hero-buttons">
                  <button className="btn-primary" onClick={() => setActiveTab('gallery')}>
                    浏览分类媒体库 <ArrowRight size={18} />
                  </button>
                  <button className="btn-secondary" onClick={() => setActiveTab('guide')}>
                    查看部署使用说明
                  </button>
                </div>
              </div>
            </section>

            {/* Statistics Section */}
            <section className="stats-grid">
              <div className="stat-card glass-panel">
                <div className="stat-icon-wrapper purple"><Database size={24} /></div>
                <div className="stat-info">
                  <div className="stat-num">{loading ? '...' : totalImages}</div>
                  <div className="stat-label">已扫描本地媒体</div>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon-wrapper cyan"><Layers size={24} /></div>
                <div className="stat-info">
                  <div className="stat-num">{loading ? '...' : totalCategories}</div>
                  <div className="stat-label">媒体分类目录</div>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon-wrapper emerald"><Sparkles size={24} /></div>
                <div className="stat-info">
                  <div className="stat-num">{loading ? '...' : `${metadataPercentage}%`}</div>
                  <div className="stat-label">ComfyUI 元数据覆盖率</div>
                </div>
              </div>
            </section>

            {/* Features Info */}
            <section className="info-block-section">
              <h2 className="section-title">核心功能 & 特色</h2>
              <div className="info-grid">
                <div className="info-card glass-panel">
                  <h3>📂 自动分类展示</h3>
                  <p>只需按照分类创建本地文件夹（例如 nature, portraits），并将生成的媒体文件放入，系统会自动将文件夹名称映射为网站的分类标签，结构清晰，完全脱机运行。</p>
                </div>
                <div className="info-card glass-panel">
                  <h3>🧠 ComfyUI 元数据提取</h3>
                  <p>原生支持 PNG 与 WebP 文件块分析，直接提取并还原 ComfyUI 生成媒体时嵌入的完整提示词、负向提示词、Seed、Steps、采样器、大模型等参数。</p>
                </div>
                <div className="info-card glass-panel">
                  <h3>🔗 零后端静态体验</h3>
                  <p>通过极致优化的打包逻辑，整个网站均为前端静态页面。仅通过一个本地 Node 扫描脚本即可实时同步最新媒体并生成前端数据库，速度飞快，部署极简。</p>
                </div>
              </div>
            </section>

            {/* Category Quick Preview */}
            <section className="category-preview-section">
              <h2 className="section-title">媒体类别预览</h2>
              <div className="category-grid">
                {loading ? (
                  <div className="loading-spinner">加载分类中...</div>
                ) : (
                  categories.filter(cat => cat !== 'all').map(cat => {
                    const catImages = images.filter(img => img.category === cat);
                    const coverImgObj = catImages.find(img => img.type === 'image');
                    const coverImg = coverImgObj?.path || '';
                    return (
                      <div 
                        key={cat} 
                        className="cat-preview-card glass-panel"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setActiveTab('gallery');
                        }}
                        style={coverImg ? {
                          backgroundImage: `linear-gradient(to bottom, rgba(10, 15, 30, 0.4), rgba(7, 9, 14, 0.95)), url('${coverImg.replace(/'/g, "\\'")}')`
                        } : {}}
                      >
                        <div className="cat-preview-content">
                          <Folder className="cat-icon" size={24} />
                          <h3>{cat.charAt(0).toUpperCase() + cat.slice(1)}</h3>
                          <span className="cat-count">{catImages.length} 个媒体</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        )}


        {/* GALLERY TAB */}
        {activeTab === 'gallery' && (
          <div className="gallery-tab">
            {/* Gallery Header Controls */}
            <div className="gallery-controls glass-panel animate-fade-in-up">
              
              {/* Top Row: Search and Filter Toggle */}
              <div className="controls-row-top">
                <div className="search-box-wrapper">
                  <Search size={18} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="搜索提示词、模型、采样器、文件名..." 
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                      <X size={16} />
                    </button>
                  )}
                </div>
                
                <button 
                  className={`btn-secondary filter-toggle-btn ${showFiltersPanel || selectedModel || selectedSampler || onlyWithMetadata ? 'active-filters' : ''}`}
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                >
                  <SlidersHorizontal size={18} />
                  <span>筛选</span>
                  {(selectedModel || selectedSampler || onlyWithMetadata) && (
                    <span className="filter-badge-dot"></span>
                  )}
                </button>
              </div>

              {/* Collapsible Advanced Filters Panel */}
              {(showFiltersPanel || selectedModel || selectedSampler || onlyWithMetadata) && (
                <div className="advanced-filters-panel animate-fade-in">
                  <div className="filter-group">
                    <label>采样大模型</label>
                    <select 
                      value={selectedModel} 
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="filter-select"
                    >
                      <option value="">全部模型</option>
                      {models.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>采样器 (Sampler)</label>
                    <select 
                      value={selectedSampler} 
                      onChange={(e) => setSelectedSampler(e.target.value)}
                      className="filter-select"
                    >
                      <option value="">全部采样器</option>
                      {samplers.map(sampler => (
                        <option key={sampler} value={sampler}>{sampler}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group checkbox-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={onlyWithMetadata}
                        onChange={(e) => setOnlyWithMetadata(e.target.checked)}
                        className="filter-checkbox"
                      />
                      <span>仅显示含有 ComfyUI 元数据</span>
                    </label>
                  </div>

                  {/* Reset Filters button */}
                  {(selectedModel || selectedSampler || onlyWithMetadata) && (
                    <button 
                      className="btn-secondary reset-filters-btn"
                      onClick={() => {
                        setSelectedModel('');
                        setSelectedSampler('');
                        setOnlyWithMetadata(false);
                        setSearchQuery('');
                      }}
                    >
                      重置筛选
                    </button>
                  )}
                </div>
              )}

              {/* Bottom Row: Category Tabs */}
              <div className="category-tabs-container">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`category-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                  >
                    {cat === 'all' ? '全部媒体' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    <span className="tab-count-badge">
                      {cat === 'all' 
                        ? images.length 
                        : images.filter(img => img.category === cat).length
                      }
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Showcase Grid */}
            {loading ? (
              <div className="gallery-loading-placeholder">
                <div className="loading-spinner"></div>
                <p>扫描并提取本地媒体元数据中，请稍候...</p>
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="gallery-empty-state glass-panel">
                <ImageIcon size={48} className="empty-icon" />
                <h3>没有找到匹配的媒体</h3>
                <p>尝试清除搜索词或更改筛选条件，或者放入媒体文件运行扫描脚本。</p>
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setSelectedModel('');
                    setSelectedSampler('');
                    setOnlyWithMetadata(false);
                  }}
                >
                  清除所有筛选
                </button>
              </div>
            ) : (
              <div className="masonry-grid animate-fade-in">
                {filteredImages.map(img => (
                  <div 
                    key={img.id} 
                    className="masonry-item glass-card"
                    onClick={() => setSelectedImage(img)}
                  >
                    <div className={`image-card-img-wrapper ${img.type || 'image'}-wrapper`}>
                      {img.type === 'video' ? (
                        <div className="video-container">
                          <video 
                            src={img.path} 
                            preload="metadata"
                            muted 
                            loop 
                            playsInline 
                            className="grid-video"
                            onMouseEnter={(e) => {
                              e.target.play().catch(err => console.log("Video play interrupted", err));
                            }}
                            onMouseLeave={(e) => {
                              e.target.pause();
                            }}
                          />
                          <div className="media-badge-overlay video">
                            <span className="badge-icon">▶</span>
                            <span>视频</span>
                          </div>
                        </div>
                      ) : img.type === 'audio' ? (
                        <div className="grid-audio-placeholder">
                          <div className="audio-wave-animation">
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                          <div className="audio-icon-wrapper">
                            <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="audio-icon"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                          </div>
                          <div className="media-badge-overlay audio">
                            <span className="badge-icon">♫</span>
                            <span>音频</span>
                          </div>
                        </div>
                      ) : (
                        <img src={img.path} alt={img.filename} loading="lazy" />
                      )}
                      <div className="card-overlay">
                        {img.metadata?.hasMetadata && (
                          <span className="overlay-badge glass-panel"><Sparkles size={12} /> ComfyUI</span>
                        )}
                        <button className="card-view-btn btn-primary">
                          {img.type === 'video' || img.type === 'audio' ? '播放与参数' : '查看生成参数'}
                        </button>
                      </div>
                    </div>
                    <div className="image-card-info">
                      <div className="card-title-row">
                        <span className={`category-badge category-${img.category}`}>
                          {img.category}
                        </span>
                        <span className="card-size-label">{img.size}</span>
                      </div>
                      <p className="card-filename">{img.filename}</p>
                      {img.metadata?.hasMetadata && img.metadata.prompt && (
                        <p className="card-prompt-preview">
                          {img.metadata.prompt}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROMPT GENERATOR TAB */}
        {activeTab === 'generator' && (
          <div className="generator-tab animate-fade-in">
            {/* Header section */}
            <div className="generator-header glass-panel">
              <span className="hero-badge"><Sparkles size={14} /> Danbooru Prompt Engine</span>
              <h2>Pony / Illustrious / Anime 提示词生成器</h2>
              <p>
                基于原 Pony 标签及 Danbooru 词库进行科学分类。选择目标模型和画面分级，一键拼接、调整权重，快速生成最适合的提示词组合。
              </p>
            </div>

            {/* Model & Config settings */}
            <div className="generator-config-bar glass-panel">
              <div className="config-section">
                <label className="config-label">1. 目标大模型风格</label>
                <div className="model-presets-grid">
                  <button 
                    className={`model-preset-btn ${genModel === 'pony' ? 'active' : ''}`}
                    onClick={() => { setGenModel('pony'); }}
                  >
                    <div className="preset-name">Pony Diffusion V6</div>
                    <div className="preset-desc">基于 score 评分的前缀风格</div>
                  </button>
                  <button 
                    className={`model-preset-btn ${genModel === 'illustrious' ? 'active' : ''}`}
                    onClick={() => { setGenModel('illustrious'); }}
                  >
                    <div className="preset-name">Illustrious XL</div>
                    <div className="preset-desc">角色/版权在前，画质修饰在后</div>
                  </button>
                  <button 
                    className={`model-preset-btn ${genModel === 'anime' ? 'active' : ''}`}
                    onClick={() => { setGenModel('anime'); }}
                  >
                    <div className="preset-name">Standard Anime</div>
                    <div className="preset-desc">通用二次元 Danbooru 格式</div>
                  </button>
                </div>
              </div>

              <div className="config-row-two">
                <div className="config-section flex-1">
                  <label className="config-label">2. 画面分级 (Rating)</label>
                  <div className="rating-selector">
                    <button className={`rating-btn safe ${genRating === 'safe' ? 'active' : ''}`} onClick={() => setGenRating('safe')}>Safe (全年龄)</button>
                    <button className={`rating-btn sensitive ${genRating === 'sensitive' ? 'active' : ''}`} onClick={() => setGenRating('sensitive')}>Sensitive (微存)</button>
                    <button className={`rating-btn nsfw ${genRating === 'nsfw' ? 'active' : ''}`} onClick={() => setGenRating('nsfw')}>NSFW (成人级)</button>
                    <button className={`rating-btn explicit ${genRating === 'explicit' ? 'active' : ''}`} onClick={() => setGenRating('explicit')}>Explicit (露骨)</button>
                  </div>
                </div>

                <div className="config-section">
                  <label className="config-label">3. 搜索范围</label>
                  <div className="search-scope-selector">
                    <button 
                      className={`scope-btn ${searchScope === 'global' ? 'active' : ''}`}
                      onClick={() => setSearchScope('global')}
                    >
                      全局搜索
                    </button>
                    <button 
                      className={`scope-btn ${searchScope === 'category' ? 'active' : ''}`}
                      onClick={() => setSearchScope('category')}
                    >
                      当前分类
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="config-row-three">
                <div className="config-section">
                  <label className="config-label">4. 灵感与随机推荐 (根据标签库智能推荐不同风格)</label>
                  <div className="random-chips-container">
                    <button className={`random-chip-btn style-all ${activeRandomStyle === 'random' ? 'active' : ''}`} onClick={() => handleRandomGenerate('random')} title="随机生成任意风格的提示词">
                      <Shuffle size={13} />
                      <span>🎲 随机任意风格</span>
                    </button>
                    <button className={`random-chip-btn style-anime ${activeRandomStyle === 'anime' ? 'active' : ''}`} onClick={() => handleRandomGenerate('anime')} title="推荐生成日系二次元动漫提示词">
                      <span>🌸 日系动漫</span>
                    </button>
                    <button className={`random-chip-btn style-realistic ${activeRandomStyle === 'realistic' ? 'active' : ''}`} onClick={() => handleRandomGenerate('realistic')} title="推荐生成写实人像摄影提示词">
                      <span>📸 写实人像</span>
                    </button>
                    <button className={`random-chip-btn style-cyberpunk ${activeRandomStyle === 'cyberpunk' ? 'active' : ''}`} onClick={() => handleRandomGenerate('cyberpunk')} title="推荐生成未来科技感赛博朋克提示词">
                      <span>🌃 赛博朋克</span>
                    </button>
                    <button className={`random-chip-btn style-fantasy ${activeRandomStyle === 'fantasy' ? 'active' : ''}`} onClick={() => handleRandomGenerate('fantasy')} title="推荐生成魔法玄幻与奇幻世界提示词">
                      <span>🔮 奇幻魔法</span>
                    </button>
                    <button className={`random-chip-btn style-chinese ${activeRandomStyle === 'chinese' ? 'active' : ''}`} onClick={() => handleRandomGenerate('chinese')} title="推荐生成国风与古代华服系列提示词">
                      <span>🎋 国风华服</span>
                    </button>
                    <button className={`random-chip-btn style-scifi ${activeRandomStyle === 'scifi' ? 'active' : ''}`} onClick={() => handleRandomGenerate('scifi')} title="推荐生成外太空与科幻未来机甲提示词">
                      <span>🚀 科幻太空</span>
                    </button>
                    <button className={`random-chip-btn style-pastoral ${activeRandomStyle === 'pastoral' ? 'active' : ''}`} onClick={() => handleRandomGenerate('pastoral')} title="推荐生成自然清新田园与治愈系提示词">
                      <span>🍃 清新田园</span>
                    </button>
                    <button className={`random-chip-btn style-multi ${activeRandomStyle === 'multi' ? 'active' : ''}`} onClick={() => handleRandomGenerate('multi')} title="推荐生成双人或多人互动合照提示词">
                      <span>👥 多人合照</span>
                    </button>
                    <button className={`random-chip-btn style-bdsm ${activeRandomStyle === 'bdsm' ? 'active' : ''}`} onClick={() => handleRandomGenerate('bdsm')} title="根据法典推荐生成 BDSM 绳艺与束缚调教提示词">
                      <span>⛓️ 束缚调教</span>
                    </button>
                    <button className={`random-chip-btn style-stealth ${activeRandomStyle === 'stealth' ? 'active' : ''}`} onClick={() => handleRandomGenerate('stealth')} title="根据法典推荐生成隐奸与桌下/上下分裂暗示性提示词">
                      <span>🎭 隐奸推荐</span>
                    </button>
                    <button className={`random-chip-btn style-lewd ${activeRandomStyle === 'lewd' ? 'active' : ''}`} onClick={() => handleRandomGenerate('lewd')} title="推荐生成限制级羞羞提示词">
                      <span>🔞 羞羞推荐</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main grid panels */}
            <div className="generator-layout">
              {/* Left Column: Categories and Tag selection */}
              <div className="generator-tags-panel glass-panel">
                <div className="generator-tags-selector">
                  {/* Category sidebar list */}
                  <div className="generator-categories-list">
                    {tagDatabase ? Object.keys(tagDatabase).map(catKey => {
                      const catData = tagDatabase[catKey];
                      return (
                        <button
                          key={catKey}
                          className={`category-item-btn ${selectedGenCategory === catKey ? 'active' : ''}`}
                          onClick={() => setSelectedGenCategory(catKey)}
                        >
                          <span className="category-title">{catData.displayName}</span>
                          <span className="category-count-label">{catData.tags.length}</span>
                        </button>
                      );
                    }) : (
                      <div className="loading-text">加载分类中...</div>
                    )}
                  </div>

                  {/* Tag Grid and Search */}
                  <div className="generator-tags-display">
                    <div className="tags-search-header">
                      <div className="search-box-wrapper">
                        <Search size={16} className="search-icon" />
                        <input 
                          type="text" 
                          placeholder={searchScope === 'global' ? "在全部 28 个分类中搜索标签..." : `在“${tagDatabase?.[selectedGenCategory]?.displayName || ''}”分类中搜索...`}
                          className="search-input tag-search"
                          value={genSearchQuery}
                          onChange={(e) => setGenSearchQuery(e.target.value)}
                        />
                        {genSearchQuery && (
                          <button className="clear-search-btn" onClick={() => setGenSearchQuery('')}>
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="tags-grid-container">
                      {tagDatabase ? (
                        (() => {
                          let filteredTags = [];
                          if (genSearchQuery.trim()) {
                            const query = genSearchQuery.toLowerCase();
                            if (searchScope === 'global') {
                              Object.keys(tagDatabase).forEach(catKey => {
                                tagDatabase[catKey].tags.forEach(tag => {
                                  const en = Array.isArray(tag) ? tag[0] : tag;
                                  const zh = Array.isArray(tag) ? tag[1] : '';
                                  if (en.toLowerCase().includes(query) || (zh && zh.toLowerCase().includes(query))) {
                                    filteredTags.push({ raw: en, zh: zh, category: catKey });
                                  }
                                });
                              });
                            } else {
                              tagDatabase[selectedGenCategory].tags.forEach(tag => {
                                const en = Array.isArray(tag) ? tag[0] : tag;
                                const zh = Array.isArray(tag) ? tag[1] : '';
                                if (en.toLowerCase().includes(query) || (zh && zh.toLowerCase().includes(query))) {
                                  filteredTags.push({ raw: en, zh: zh, category: selectedGenCategory });
                                }
                              });
                            }
                          } else {
                            filteredTags = tagDatabase[selectedGenCategory].tags.map(tag => {
                              const en = Array.isArray(tag) ? tag[0] : tag;
                              const zh = Array.isArray(tag) ? tag[1] : '';
                              return { raw: en, zh: zh, category: selectedGenCategory };
                            });
                          }

                          const showLimit = genSearchQuery.trim() ? 500 : 150;
                          const displayed = filteredTags.slice(0, showLimit);

                          return (
                            <>
                              {filteredTags.length > showLimit && (
                                <div className="tags-limit-info">
                                  <span>显示前 {showLimit} 项（共 {filteredTags.length} 项符合条件），输入关键词搜索精确结果。</span>
                                </div>
                              )}
                              {displayed.length === 0 ? (
                                <div className="no-tags-found">
                                  <span>没有找到匹配的标签</span>
                                </div>
                              ) : (
                                <div className="tags-pills-grid">
                                  {displayed.map((tagObj, idx) => {
                                    const isSelected = selectedTags.some(t => t.raw === tagObj.raw);
                                    const cleanName = parseTag(tagObj.raw).clean;
                                    const displayName = tagObj.zh ? `${cleanName} (${tagObj.zh})` : cleanName;
                                    return (
                                      <button
                                        key={`${tagObj.raw}-${idx}`}
                                        className={`tag-pill-btn ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleToggleTag(tagObj.raw, tagObj.category)}
                                        title={`${tagObj.raw} ${tagObj.zh ? '| ' + tagObj.zh : ''} (${tagObj.category})`}
                                      >
                                        <span className="tag-pill-name">{displayName}</span>
                                        {isSelected && <span className="tag-pill-check">✓</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </>
                          );
                        })()
                      ) : (
                        <div className="tags-loading">正在载入标签库，请稍候...</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Prompt Builder / Selected list / Prompt output */}
              <div className="generator-builder-panel glass-panel">
                <div className="builder-header">
                  <h3>Prompt Builder (当前已选 {selectedTags.length} 个词)</h3>
                  {selectedTags.length > 0 && (
                    <button className="clear-all-tags-btn" onClick={() => { setSelectedTags([]); setActiveRandomStyle(null); }}>
                      <Trash2 size={14} /> 清空已选
                    </button>
                  )}
                </div>

                {/* Selected Tags list with weights */}
                <div className="builder-selected-tags">
                  {selectedTags.length === 0 ? (
                    <div className="empty-builder-message">
                      <HelpCircle size={24} className="help-icon" />
                      <p>左侧点击标签即可添加到此处。</p>
                      <p className="sub-hint">您可以自定义模型及画面分级，在此调整权重和顺序。</p>
                    </div>
                  ) : (
                    <div className="selected-chips-flow">
                      {selectedTags.map((tagObj, idx) => {
                        return (
                          <div key={`${tagObj.raw}-${idx}`} className="selected-tag-chip">
                            <span className="chip-category-label">{tagDatabase?.[tagObj.category]?.displayName || tagObj.category}</span>
                            <span className="chip-name">{tagObj.zh ? `${tagObj.clean} (${tagObj.zh})` : tagObj.clean}</span>
                            
                            <div className="weight-adjuster">
                              <button 
                                className="weight-btn minus" 
                                onClick={() => handleAdjustWeight(tagObj.raw, -0.1)}
                                title="减小权重 (-0.1)"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="weight-val">{tagObj.weight.toFixed(1)}</span>
                              <button 
                                className="weight-btn plus" 
                                onClick={() => handleAdjustWeight(tagObj.raw, 0.1)}
                                title="增大权重 (+0.1)"
                              >
                                <Plus size={10} />
                              </button>
                            </div>

                            <div className="order-adjuster">
                              <button 
                                className="order-btn" 
                                disabled={idx === 0}
                                onClick={() => {
                                  const list = [...selectedTags];
                                  const temp = list[idx];
                                  list[idx] = list[idx - 1];
                                  list[idx - 1] = temp;
                                  setSelectedTags(list);
                                }}
                                title="向前移动"
                              >
                                ◀
                              </button>
                              <button 
                                className="order-btn" 
                                disabled={idx === selectedTags.length - 1}
                                onClick={() => {
                                  const list = [...selectedTags];
                                  const temp = list[idx];
                                  list[idx] = list[idx + 1];
                                  list[idx + 1] = temp;
                                  setSelectedTags(list);
                                }}
                                title="向后移动"
                              >
                                ▶
                              </button>
                            </div>

                            <button 
                              className="chip-delete-btn" 
                              onClick={() => setSelectedTags(selectedTags.filter(t => t.raw !== tagObj.raw))}
                              title="移除标签"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Live output boxes */}
                <div className="builder-outputs">
                  {(() => {
                    const { positive, negative } = generatePrompts();
                    return (
                      <>
                        <div className="prompt-output-box positive-output">
                          <div className="output-header">
                            <span className="output-label">Positive Prompt (正向提示词)</span>
                            <button 
                              className={`copy-btn ${copiedField === 'genPositive' ? 'copied' : ''}`}
                              onClick={() => copyToClipboard(positive, 'genPositive', 'Positive prompt copied!')}
                            >
                              {copiedField === 'genPositive' ? <Check size={14} /> : <Copy size={14} />}
                              <span>{copiedField === 'genPositive' ? '已复制' : '复制正向提示词'}</span>
                            </button>
                          </div>
                          <textarea 
                            className="output-textarea"
                            value={positive}
                            readOnly
                            placeholder="生成的正向提示词将显示在这里..."
                          />
                        </div>

                        <div className="prompt-output-box negative-output">
                          <div className="output-header">
                            <span className="output-label">Negative Prompt (负向提示词)</span>
                            <button 
                              className={`copy-btn ${copiedField === 'genNegative' ? 'copied' : ''}`}
                              onClick={() => copyToClipboard(negative, 'genNegative', 'Negative prompt copied!')}
                            >
                              {copiedField === 'genNegative' ? <Check size={14} /> : <Copy size={14} />}
                              <span>{copiedField === 'genNegative' ? '已复制' : '复制负向提示词'}</span>
                            </button>
                          </div>
                          <textarea 
                            className="output-textarea negative"
                            value={negative}
                            readOnly
                            placeholder="生成的负向提示词将显示在这里..."
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI PROMPT MASTER TAB */}
        {activeTab === 'ai-generator' && (
          <div className="ai-generator-tab animate-fade-in">
            {/* Header section */}
            <div className="generator-header glass-panel">
              <span className="hero-badge"><Sparkles size={14} /> AI Creative Assistant</span>
              <h2>AI 自然语言提示词大师</h2>
              <p>
                专为 Z-Image, Flux, SD3, Midjourney 等对自然语言理解能力出色的模型打造。通过大模型（支持配置本地 Ollama 或外部接口）自动将您的核心脑洞扩展并润色为精细化的创意画质描述词，支持中英双语对照。
              </p>
            </div>

            {/* API Settings Panel (Collapsible Glass Panel) */}
            <div className="glass-panel llm-settings-panel">
              <div className="settings-header" onClick={() => setShowLlmSettings(!showLlmSettings)}>
                <div className="header-title">
                  <Settings size={18} />
                  <span>大模型 API 配置 {llmPreset === 'ollama' ? '(本地 Ollama)' : llmPreset === 'deepseek' ? '(DeepSeek)' : llmPreset === 'openai' ? '(OpenAI)' : '(自定义)'}</span>
                </div>
                <button className="collapse-btn">
                  {showLlmSettings ? '收起配置' : '展开配置'}
                </button>
              </div>

              {showLlmSettings && (
                <div className="settings-content animate-fade-in">
                  <div className="presets-selector">
                    <label className="config-label">预设服务商</label>
                    <div className="presets-grid">
                      <button className={`preset-pill ${llmPreset === 'ollama' ? 'active' : ''}`} onClick={() => handleLlmPresetChange('ollama')}>Ollama (本地)</button>
                      <button className={`preset-pill ${llmPreset === 'deepseek' ? 'active' : ''}`} onClick={() => handleLlmPresetChange('deepseek')}>DeepSeek (远程)</button>
                      <button className={`preset-pill ${llmPreset === 'openai' ? 'active' : ''}`} onClick={() => handleLlmPresetChange('openai')}>OpenAI (远程)</button>
                      <button className={`preset-pill ${llmPreset === 'custom' ? 'active' : ''}`} onClick={() => setLlmPreset('custom')}>自定义接口</button>
                    </div>
                  </div>

                  <div className="config-fields-grid">
                    <div className="input-group">
                      <label className="field-label">API 接口地址 (Base URL)</label>
                      <input 
                        type="text" 
                        value={llmApiUrl} 
                        onChange={(e) => setLlmApiUrl(e.target.value)} 
                        placeholder="http://localhost:11434/v1"
                      />
                    </div>
                    <div className="input-group">
                      <label className="field-label">API Key 密钥 {llmPreset === 'ollama' && '(本地模型通常不需要)'}</label>
                      <input 
                        type="password" 
                        value={llmApiKey} 
                        onChange={(e) => setLlmApiKey(e.target.value)} 
                        placeholder={llmPreset === 'ollama' ? '无需填写' : 'sk-...'}
                      />
                    </div>
                    <div className="input-group">
                      <div className="label-row">
                        <label className="field-label">模型名称 (Model Name)</label>
                        <button 
                          className="text-link-btn" 
                          onClick={handleFetchLoadedModels} 
                          title="自动从服务商接口拉取当前已加载的模型名称"
                        >
                          自动获取已加载模型
                        </button>
                      </div>
                      <input 
                        type="text" 
                        value={llmModel} 
                        onChange={(e) => setLlmModel(e.target.value)} 
                        placeholder="llama3:latest"
                      />
                    </div>
                  </div>

                  <div className="settings-actions">
                    <button className="test-conn-btn" onClick={testLlmConnection} disabled={aiConnectionTest === 'testing'}>
                      {aiConnectionTest === 'testing' ? '正在测试...' : '测试接口连接'}
                    </button>
                    
                    {aiConnectionTest === 'success' && (
                      <span className="status-badge success"><Check size={14} /> 连接正常</span>
                    )}
                    {aiConnectionTest === 'error' && (
                      <div className="status-badge error">
                        <AlertCircle size={14} /> <span>连接失败: {aiConnectionError}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Main AI Generator Workspace */}
            <div className="ai-workspace-layout">
              {/* Left Column: Style Configs */}
              <div className="ai-configs-panel glass-panel">
                <div className="ai-section">
                  <h3 className="section-title">Step 1. 选择艺术风格</h3>
                  <div className="ai-style-grid">
                    {AI_STYLES.map(style => (
                      <button 
                        key={style.id}
                        className={`ai-style-card ${aiSelectedStyle === style.id ? 'active' : ''}`}
                        onClick={() => {
                          setAiSelectedStyle(style.id);
                          const defaultIdeas = {
                            cyberpunk: '一个戴着发光耳机和未来护目镜的少女，独自坐在赛博朋克雨夜街头小吃摊前吃拉面，背景是层叠的霓虹灯牌与高科技摩天大楼。',
                            anime: '一个金色双马尾的魔法少女，手握散发着璀璨光芒的魔杖，站在满天繁星的夜空之下，周围环绕着漂浮的魔法符文。',
                            realistic: '一个饱经沧桑的老人面部特写，逆光照亮了他脸上的皱纹，眼神深邃而故事感十足，包含清晰的毛孔与毛发细节。',
                            fantasy: '一头巨大的独角兽在发光的荧光森林湖畔饮水，湖水倒映着天空中粉蓝色的星云，周围是漂浮的发光水母与奇异植物。',
                            cinematic: '一名身穿黑色风衣的神秘侦探在阴雨连绵的伦敦深夜街头漫步，路灯昏暗，路面积水倒映着远处红色双层巴士的虚影。',
                            watercolor: '一只可爱的橘猫静静地躺在洒满阳光的窗台睡懒觉，窗外是盛开的粉色樱花，画面具有手绘水彩渲染的透明感。',
                            oilpainting: '一个优雅的贵妇人在烛光摇曳的巴洛克书房中阅读一封古老的信件，身上是华丽的丝绸长裙，光影具有伦勃朗式的明暗对比。',
                            '3drender': '一个圆滚滚的粘土材质小宇航员，骑着一只粉红色的太空飞猪，在布满糖果色星球的宇宙中漫游，具有可爱的Chibi 3D粘土风格。',
                            chinese: '一个身穿白色汉服的剑客，负手伫立在云雾缭绕的险峻山巅之上，周围是苍劲的古松，远山在水墨留白中若隐若现。',
                            steampunk: '一个巨大的黄铜飞艇悬浮在维多利亚时代的机械都市上空，都市中耸立着巨大的齿轮塔与吐着白烟的铜制管道，复古感十足。'
                          };
                          setAiUserIdea(defaultIdeas[style.id] || '');
                        }}
                      >
                        <div className="style-name">{style.name}</div>
                        <div className="style-name-en">{style.nameEn}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ai-section mt-4">
                  <h3 className="section-title">Step 2. 画面构图视角</h3>
                  <div className="ai-options-pills">
                    {AI_COMPOSITIONS.map(comp => (
                      <button 
                        key={comp.id}
                        className={`option-pill ${aiSelectedComposition === comp.id ? 'active' : ''}`}
                        onClick={() => setAiSelectedComposition(comp.id)}
                      >
                        <span>{comp.name}</span>
                        <span className="pill-en">{comp.nameEn}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ai-section mt-4">
                  <h3 className="section-title">Step 3. 画面光影氛围</h3>
                  <div className="ai-options-pills">
                    {AI_LIGHTINGS.map(light => (
                      <button 
                        key={light.id}
                        className={`option-pill ${aiSelectedLighting === light.id ? 'active' : ''}`}
                        onClick={() => setAiSelectedLighting(light.id)}
                      >
                        <span>{light.name}</span>
                        <span className="pill-en">{light.nameEn}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Idea Input & Output Results */}
              <div className="ai-results-panel glass-panel">
                <div className="ai-section">
                  <h3 className="section-title">Step 4. 输入您的创意脑洞</h3>
                  <div className="idea-input-wrapper">
                    <textarea 
                      className="idea-textarea"
                      value={aiUserIdea}
                      onChange={(e) => setAiUserIdea(e.target.value)}
                      placeholder="在这里输入想要绘制的画面场景或脑洞，可以用中文或英文。例如：
一个穿着中国传统华服的白发机甲美少女，在漫天红叶飞舞的古风阁楼屋顶上练剑，夜空中有巨大的赛博朋克霓虹月亮，氛围极其浪漫唯美..."
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <div className="generate-btn-container">
                  <button 
                    className={`ai-generate-submit-btn ${aiIsGenerating ? 'generating' : ''}`}
                    onClick={handleGenerateAIPrompt}
                    disabled={aiIsGenerating}
                  >
                    <Sparkles size={18} />
                    <span>{aiIsGenerating ? 'AI 正在全力以赴扩充中...' : '开始 AI 智能扩充提示词'}</span>
                  </button>
                </div>

                {/* Loading and Results Area */}
                <div className="ai-result-view-area">
                  {aiIsGenerating ? (
                    <div className="ai-loading-placeholder">
                      <div className="loading-spinner"></div>
                      <p>正在调度本地/云端大模型进行深度语义理解...</p>
                      <p className="loading-subtext">我们将基于您选择的「{AI_STYLES.find(s => s.id === aiSelectedStyle)?.name}」风格、「{AI_COMPOSITIONS.find(c => c.id === aiSelectedComposition)?.name}」构图与「{AI_LIGHTINGS.find(l => l.id === aiSelectedLighting)?.name}」光影进行细节化艺术渲染。</p>
                    </div>
                  ) : aiResultPrompt ? (
                    <div className="ai-result-success animate-fade-in">
                      <div className="result-card">
                        <div className="result-card-header">
                          <h4>✨ 英文优化提示词 (Copy to Generate)</h4>
                          <button 
                            className="result-copy-btn"
                            onClick={() => {
                              navigator.clipboard.writeText(aiResultPrompt);
                              showToast('英文提示词已成功复制到剪贴板！');
                            }}
                          >
                            <Copy size={14} /> <span>复制 Prompt</span>
                          </button>
                        </div>
                        <div className="result-text-box">
                          {aiResultPrompt}
                        </div>
                      </div>

                      {aiResultTranslation && (
                        <div className="result-card mt-3">
                          <div className="result-card-header">
                            <h4>📝 中文对照释义 (Chinese Translation)</h4>
                            <button 
                              className="result-copy-btn"
                              onClick={() => {
                                navigator.clipboard.writeText(aiResultTranslation);
                                showToast('中文释义已复制到剪贴板！');
                              }}
                            >
                              <Copy size={14} /> <span>复制翻译</span>
                            </button>
                          </div>
                          <div className="result-text-box translation-box">
                            {aiResultTranslation}
                          </div>
                        </div>
                      )}
                      
                      <div className="result-tips">
                        <p>💡 提示：本工具生成的自然语言提示词已完美适配 Z-Image、Flux.1、Stable Diffusion 3 以及 Midjourney 模型。直接复制并在上述生图工具中运行，可获得无与伦比的精细度和场景还原度！</p>
                      </div>
                    </div>
                  ) : (
                    <div className="ai-result-empty">
                      <p>✨ 创意结果将在这里呈现</p>
                      <p className="subtext">在上方输入脑洞，点击“开始 AI 智能扩充提示词”，大模型即可为您润色生成电影级的英文 Prompt 与中文解释对照。</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GUIDE TAB */}
        {activeTab === 'guide' && (
          <div className="guide-tab animate-fade-in">
            <div className="guide-layout">
              {/* Sidebar Checklist */}
              <div className="guide-sidebar glass-panel">
                <h3>📋 目录</h3>
                <ul>
                  <li><a href="#req">1. 系统需求与架构</a></li>
                  <li><a href="#how-it-works">2. 扫描与渲染原理</a></li>
                  <li><a href="#use">3. 使用说明</a></li>
                  <li><a href="#metadata">4. ComfyUI 元数据说明</a></li>
                  <li><a href="#deploy">5. 部署指南</a></li>
                </ul>
              </div>

              {/* Main Guide Content */}
              <div className="guide-content-wrapper glass-panel">
                <section id="req">
                  <h2>1. 系统需求与架构</h2>
                  <p>本网站为 <strong>全静态纯前端展示页面</strong>，无需任何数据库或动态后端服务。所有的媒体及其元数据在部署/打包时被一次性解析并生成前端索引文件。</p>
                  <ul>
                    <li><strong>前端框架:</strong> React 19, Vite 8, Vanilla CSS</li>
                    <li><strong>运行环境:</strong> 浏览器支持现代 HTML5, Node.js v16+ (仅用于扫描本地媒体)</li>
                    <li><strong>无后端优势:</strong> 零服务器压力，可直接托管至 GitHub Pages、Gitee Pages、Vercel 或本地直接浏览器双击预览。</li>
                  </ul>
                </section>

                <hr />

                <section id="how-it-works">
                  <h2>2. 扫描与渲染原理</h2>
                  <div className="principle-box">
                    <p>网站数据流如下：</p>
                    <ol>
                      <li>用户将 ComfyUI 生成的媒体分类存放在 <code>/public/media/[分类目录]/</code>。</li>
                      <li>在根目录执行 <code>npm run scan</code>。</li>
                      <li>Node 脚本 <code>scan-media.js</code> 会读取所有子文件夹，解析 PNG Chunks 中的 <code>tEXt/iTXt</code> 字段，或 WebP 的 <code>XMP</code> 属性。</li>
                      <li>若媒体被压缩剥离了元数据，脚本会自动检查同名 <code>.json</code> 侧边栏文件。</li>
                      <li>脚本生成 <code>public/media-data.json</code> 前端数据库，React 启动后直接 Fetch 该数据并提供搜索、过滤、展示。</li>
                    </ol>
                  </div>
                </section>

                <hr />

                <section id="use">
                  <h2>3. 使用说明</h2>
                  <div className="guide-methods-container">
                    
                    <div className="guide-method-card glass-panel">
                      <div className="method-badge gradient-bg">最简单 (免 Node)</div>
                      <h3>📁 方法一：网页前端直连切换 (推荐)</h3>
                      <p>直接在网页上操作，无需运行任何脚本或可执行文件：</p>
                      <ol>
                        <li>点击顶部导航栏的 <strong>“选择本地目录”</strong> 按钮。</li>
                        <li>在浏览器弹出的文件选择器中，选择您的 ComfyUI <code>output</code> 文件夹（或任何包含分类子目录的媒体文件夹）。</li>
                        <li>在浏览器上方弹出权限询问时，点击 <strong>“允许访问”</strong> 授予只读权限。</li>
                        <li>网页端程序会直接在本地解压缩 PNG/WebP 媒体并提取所有提示词参数，极速载入浏览！</li>
                      </ol>
                      <p className="note-text"><em>注：因安全限制，刷新页面后需重新选择目录授权。若想永久展示，请使用方法二。</em></p>
                    </div>

                    <div className="guide-method-card glass-panel">
                      <div className="method-badge secondary">双击运行 (便携可执行程序)</div>
                      <h3>⚡ 方法二：双击本地可执行程序</h3>
                      <p>项目根目录下内置了打包好的无 Node.js 运行时依赖包：</p>
                      <ul>
                        <li><strong>Windows:</strong> 双击项目根目录下 <code>bin/scanner-win.exe</code> 运行。</li>
                        <li><strong>macOS:</strong> 在终端执行 <code>bin/scanner-macos</code>（首次如遇权限拦截需在系统设置中允许，或 <code>chmod +x</code> 授权）。</li>
                      </ul>
                      <ol>
                        <li>首次运行：在弹出的黑框控制台中，<strong>直接拖入您的媒体文件夹</strong>并回车，程序会自动为您创建无占用的软链接绑定。</li>
                        <li>更新目录：未来当您增删媒体时，<strong>只需再次双击它</strong>，数秒内即可自动在后台同步完所有元数据。</li>
                        <li>若要彻底更换绑定目录，可加上参数 <code>--switch</code> 启动，或直接删除项目根目录的 <code>directory-config.json</code>。</li>
                      </ol>
                    </div>

                    <div className="guide-method-card glass-panel">
                      <div className="method-badge outline">开发者模式</div>
                      <h3>🛠️ 方法三：常规 Node.js 命令扫描</h3>
                      <p>适合前端开发与部署流程：</p>
                      <ol>
                        <li>将您的 ComfyUI 外部媒体文件夹挂载到 <code>/public/media/</code> (支持直接在 media 目录下新建子文件夹来分类)。</li>
                        <li>在项目根目录下执行命令行：<code>npm run scan</code>。</li>
                        <li>扫描完成后，执行 <code>npm run dev</code> 启动本地预览，或执行 <code>npm run build</code> 构建平铺静态包。</li>
                      </ol>
                    </div>

                  </div>
                </section>

                <hr />

                <section id="metadata">
                  <h2>4. ComfyUI 元数据解析机制</h2>
                  <p>ComfyUI 将其工作流及生成节点配置以下列格式存储在媒体中：</p>
                  <ul>
                    <li><strong>PNG 格式:</strong> 存储在二进制头部的 <code>tEXt</code> 文本区块中，关键字为 <code>prompt</code> (生成图 graph API) 和 <code>workflow</code> (前端 UI 连线图)。</li>
                    <li><strong>WebP 格式:</strong> 存储在 RIFF 块的 <code>XMP </code> 元数据段，以 XML 标签包含属性 <code>comfyui:prompt</code> 及 <code>comfyui:workflow</code>。</li>
                  </ul>
                  <p>本项目的扫描引擎会自动解析上述区块，并智能提取 <code>KSampler</code> 节点相连的输入节点，过滤正向/负向提示词，提取 Seed、采样器、步数等核心生成参数，极其直观。</p>
                </section>

                <hr />

                <section id="deploy">
                  <h2>5. 静态部署与平铺包分发指南</h2>
                  <p>由于本项目为完全零后端架构，极易部署和打包分享：</p>
                  
                  <div className="deploy-method">
                    <h3>📦 1. 离线平铺分发包 (适合免 Node 发送给他人使用)</h3>
                    <ol>
                      <li>在开发根目录下执行打包命令：<code>npm run build</code></li>
                      <li>编译产物保存在 <code>dist/</code> 目录下。</li>
                      <li><strong>打包免 Node 运行环境</strong>：将项目中的 <code>bin/scanner-win.exe</code> 复制到 <code>dist/</code> 文件夹下，然后将整个 <code>dist/</code> 文件夹打包发送给他人。</li>
                      <li><strong>使用方法</strong>：他人解压后，双击 <code>dist/</code> 中的 <code>scanner-win.exe</code>，程序会自动检测到处于打包平铺环境，并在 <code>dist/media</code> 创建软链接并实时写出 <code>dist/media-data.json</code>。使用 Live Server 容器或静态 web 服务器启动即可脱离 Node 环境使用！</li>
                    </ol>
                  </div>

                  <div className="deploy-method" style={{ marginTop: '1.5rem' }}>
                    <h3>🚀 2. Vercel / Netlify 线上部署</h3>
                    <ol>
                      <li>将您的 PromptMedia 仓库推送至您的 GitHub 账号下。</li>
                      <li>在 Vercel 或 Netlify 仪表盘中，点击“新建项目”并选择您的 GitHub 仓库。</li>
                      <li>构建指令（Build Command）填写：<code>npm run build</code>。</li>
                      <li>打包目录（Output Directory）填写：<code>dist</code>。</li>
                      <li>点击部署，您的 AI 提示词分类媒体库就会立刻全球上线！</li>
                    </ol>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-copyright" style={{ width: '100%', textAlign: 'center' }}>
            <span>© {new Date().getFullYear()} <span className="gradient-text font-bold">PromptMedia</span>. All Rights Reserved.</span>
          </div>
        </div>
      </footer>

      {/* DETAIL MODAL VIEWER */}
      {selectedImage && (
        <div className="modal-overlay animate-fade-in" onClick={() => setSelectedImage(null)}>
          <div className="modal-wrapper glass-panel" onClick={(e) => e.stopPropagation()}>
            
            {/* Close button */}
            <button className="modal-close-btn" onClick={() => setSelectedImage(null)}>
              <X size={24} />
            </button>

            {/* Navigation arrows */}
            <button 
              className="modal-nav-btn prev" 
              onClick={handlePrevImage}
              disabled={getFilteredImages().findIndex(img => img.id === selectedImage.id) === 0}
            >
              <ChevronLeft size={36} />
            </button>
            <button 
              className="modal-nav-btn next" 
              onClick={handleNextImage}
              disabled={getFilteredImages().findIndex(img => img.id === selectedImage.id) === getFilteredImages().length - 1}
            >
              <ChevronRight size={36} />
            </button>

            {/* Modal Grid Split: Left = Image, Right = Parameters */}
            <div className="modal-content-grid">
              
              {/* Left Side: Media display */}
              <div className="modal-left-panel">
                <div className="modal-image-container">
                  {selectedImage.type === 'video' ? (
                    <video 
                      src={selectedImage.path} 
                      controls 
                      autoPlay 
                      loop 
                      className="modal-video" 
                      style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px' }}
                    />
                  ) : selectedImage.type === 'audio' ? (
                    <div className="modal-audio-container glass-panel">
                      <div className="audio-disc-animation">
                        <svg viewBox="0 0 24 24" width="80" height="80" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="disc-icon"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                      </div>
                      <audio 
                        src={selectedImage.path} 
                        controls 
                        autoPlay 
                        className="modal-audio" 
                        style={{ width: '100%', marginTop: '2rem' }}
                      />
                    </div>
                  ) : (
                    <img src={selectedImage.path} alt={selectedImage.filename} />
                  )}
                </div>
                <div className="modal-image-actions">
                  <span className={`category-badge category-${selectedImage.category}`}>
                    {selectedImage.category}
                  </span>
                  <div className="action-buttons-group">
                    <button 
                      className="btn-primary"
                      onClick={() => downloadImage(selectedImage.path, selectedImage.filename)}
                    >
                      <Download size={16} /> <span>下载文件</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side: Detailed Parameters */}
              <div className="modal-right-panel">
                <div className="modal-header-info">
                  <h2>{selectedImage.filename}</h2>
                  <div className="meta-row">
                    <span className="meta-item"><Calendar size={14} /> {new Date(selectedImage.updatedAt).toLocaleString()}</span>
                    <span className="meta-item"><FileText size={14} /> {selectedImage.size}</span>
                  </div>
                </div>

                {/* If image has ComfyUI Metadata, render detailed parameters */}
                {selectedImage.metadata?.hasMetadata ? (
                  <div className="metadata-container">
                    
                    {/* Prompt Box */}
                    {selectedImage.metadata.prompt && (
                      <div className="parameter-card prompt-card">
                        <div className="card-header">
                          <span className="parameter-label">🎨 Positive Prompt (正向提示词)</span>
                          <button 
                            className={`copy-btn ${copiedField === 'prompt' ? 'copied' : ''}`}
                            onClick={() => copyToClipboard(selectedImage.metadata.prompt, 'prompt', 'Positive prompt copied!')}
                          >
                            {copiedField === 'prompt' ? <Check size={14} /> : <Copy size={14} />}
                            <span>{copiedField === 'prompt' ? '已复制' : '复制提示词'}</span>
                          </button>
                        </div>
                        <div className="card-content prompt-text">
                          {selectedImage.metadata.prompt}
                        </div>
                      </div>
                    )}

                    {/* Negative Prompt Box */}
                    {selectedImage.metadata.negativePrompt && (
                      <div className="parameter-card negative-prompt-card">
                        <div className="card-header">
                          <span className="parameter-label">🚫 Negative Prompt (负向提示词)</span>
                          <button 
                            className={`copy-btn ${copiedField === 'negPrompt' ? 'copied' : ''}`}
                            onClick={() => copyToClipboard(selectedImage.metadata.negativePrompt, 'negPrompt', 'Negative prompt copied!')}
                          >
                            {copiedField === 'negPrompt' ? <Check size={14} /> : <Copy size={14} />}
                            <span>{copiedField === 'negPrompt' ? '已复制' : '复制'}</span>
                          </button>
                        </div>
                        <div className="card-content prompt-text negative">
                          {selectedImage.metadata.negativePrompt}
                        </div>
                      </div>
                    )}

                    {/* Param Grid */}
                    <div className="params-value-grid">
                      
                      <div className="param-value-item">
                        <span className="param-label">Seed (种子)</span>
                        <div className="param-value-with-copy">
                          <span className="param-value font-mono">{selectedImage.metadata.seed}</span>
                          <button 
                            className="inline-copy-btn"
                            onClick={() => copyToClipboard(selectedImage.metadata.seed?.toString(), 'seed', 'Seed copied!')}
                          >
                            {copiedField === 'seed' ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>

                      <div className="param-value-item">
                        <span className="param-label">Steps (步数)</span>
                        <span className="param-value">{selectedImage.metadata.steps}</span>
                      </div>

                      <div className="param-value-item">
                        <span className="param-label">CFG Scale (权重)</span>
                        <span className="param-value">{selectedImage.metadata.cfg}</span>
                      </div>

                      <div className="param-value-item">
                        <span className="param-label">Sampler (采样器)</span>
                        <span className="param-value font-mono">{selectedImage.metadata.sampler}</span>
                      </div>

                      <div className="param-value-item">
                        <span className="param-label">Scheduler (调度器)</span>
                        <span className="param-value font-mono">{selectedImage.metadata.scheduler}</span>
                      </div>

                      <div className="param-value-item">
                        <span className="param-label">Denoise (去噪)</span>
                        <span className="param-value">{selectedImage.metadata.denoise}</span>
                      </div>

                      <div className="param-value-item full-width">
                        <span className="param-label">大模型 (Checkpoint)</span>
                        <span className="param-value font-mono">{selectedImage.metadata.model || 'Unknown model'}</span>
                      </div>

                      <div className="param-value-item">
                        <span className="param-label">分辨率 (Size)</span>
                        <span className="param-value">{selectedImage.metadata.width} × {selectedImage.metadata.height}</span>
                      </div>
                    </div>

                    {/* Raw JSON / Workflow viewer section */}
                    <div className="raw-workflow-section">
                      <div className="raw-tabs">
                        <button 
                          className={`raw-tab-btn ${rawTab === 'prompt' ? 'active' : ''}`}
                          onClick={() => setRawTab('prompt')}
                        >
                          <Code size={14} /> Prompt API Graph (节点配置)
                        </button>
                        <button 
                          className={`raw-tab-btn ${rawTab === 'workflow' ? 'active' : ''}`}
                          onClick={() => setRawTab('workflow')}
                        >
                          <Info size={14} /> Workflow UI Graph (工作流)
                        </button>
                      </div>
                      
                      <div className="raw-content">
                        {rawTab === 'prompt' ? (
                          <div className="raw-json-wrapper">
                            <div className="raw-json-header">
                              <span>ComfyUI API Format Graph JSON</span>
                              <button 
                                className="copy-btn btn-secondary"
                                onClick={() => copyToClipboard(JSON.stringify(selectedImage.metadata.rawPrompt, null, 2), 'rawPrompt', 'API Graph copied!')}
                              >
                                {copiedField === 'rawPrompt' ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copiedField === 'rawPrompt' ? '已复制' : '复制 API Graph'}</span>
                              </button>
                            </div>
                            <pre>
                              <code>{JSON.stringify(selectedImage.metadata.rawPrompt, null, 2)}</code>
                            </pre>
                          </div>
                        ) : (
                          <div className="raw-json-wrapper">
                            <div className="raw-json-header">
                              <span>ComfyUI Workflow UI Graph JSON</span>
                              <button 
                                className="copy-btn btn-secondary"
                                onClick={() => copyToClipboard(JSON.stringify(selectedImage.metadata.rawWorkflow, null, 2), 'rawWorkflow', 'Workflow Graph copied!')}
                              >
                                {copiedField === 'rawWorkflow' ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copiedField === 'rawWorkflow' ? '已复制' : '复制 Workflow JSON'}</span>
                              </button>
                            </div>
                            <pre>
                              <code>{JSON.stringify(selectedImage.metadata.rawWorkflow, null, 2)}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="no-metadata-placeholder glass-panel">
                    <Info size={24} className="info-icon" />
                    <h4>没有找到 ComfyUI 元数据</h4>
                    <p>该媒体可能是在其他软件中编辑过，或者已被剥离了元数据信息。</p>
                    <p className="hint">
                      您可以为其添加一个同名的 <code>.json</code> 侧边栏文件（例如 <code>{selectedImage.filename.substring(0, selectedImage.filename.lastIndexOf('.'))}.json</code>）并再次扫描，网站便会自动读取并展示参数！
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default App;
