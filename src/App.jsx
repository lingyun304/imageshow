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
  RefreshCw
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

function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'cyber-dark';
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
      setSelectedTags([...selectedTags, { raw: rawTag, clean, weight, category }]);
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
                className={`theme-pill-btn ${theme === 'cyber-dark' ? 'active' : ''}`}
                onClick={() => setTheme('cyber-dark')}
                title="科技暗黑"
              >
                <Moon size={14} />
                <span>暗黑</span>
              </button>
              <button 
                className={`theme-pill-btn ${theme === 'fresh-mint' ? 'active' : ''}`}
                onClick={() => setTheme('fresh-mint')}
                title="清新雅致"
              >
                <Leaf size={14} />
                <span>清新</span>
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
                                  if (tag.toLowerCase().includes(query)) {
                                    filteredTags.push({ raw: tag, category: catKey });
                                  }
                                });
                              });
                            } else {
                              tagDatabase[selectedGenCategory].tags.forEach(tag => {
                                if (tag.toLowerCase().includes(query)) {
                                  filteredTags.push({ raw: tag, category: selectedGenCategory });
                                }
                              });
                            }
                          } else {
                            filteredTags = tagDatabase[selectedGenCategory].tags.map(tag => ({ raw: tag, category: selectedGenCategory }));
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
                                    return (
                                      <button
                                        key={`${tagObj.raw}-${idx}`}
                                        className={`tag-pill-btn ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleToggleTag(tagObj.raw, tagObj.category)}
                                        title={`${tagObj.raw} (${tagObj.category})`}
                                      >
                                        <span className="tag-pill-name">{cleanName}</span>
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
                    <button className="clear-all-tags-btn" onClick={() => setSelectedTags([])}>
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
                            <span className="chip-name">{tagObj.clean}</span>
                            
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
