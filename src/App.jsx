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
  Zap
} from 'lucide-react';
import './App.css';

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

  // Fetch scanned image data
  useEffect(() => {
    fetch('/images-data.json')
      .then(res => {
        if (!res.ok) {
          throw new Error('Image metadata JSON not found. Please run the scanner.');
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
            <span className="nav-logo-text gradient-text">PromptGallery</span>
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
                  分类画廊
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
                  PromptGallery 是一款专为 ComfyUI 与 AI 艺术创作者打造的本地图像分类展示网站。
                  无需繁琐的后端部署，通过扫描本地文件夹即可瞬间提取 PNG/WebP 图像元数据中的生成参数。
                </p>
                <div className="hero-buttons">
                  <button className="btn-primary" onClick={() => setActiveTab('gallery')}>
                    浏览分类画廊 <ArrowRight size={18} />
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
                  <div className="stat-label">已扫描本地图像</div>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon-wrapper cyan"><Layers size={24} /></div>
                <div className="stat-info">
                  <div className="stat-num">{loading ? '...' : totalCategories}</div>
                  <div className="stat-label">图片分类目录</div>
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
                  <p>只需按照分类创建本地文件夹（例如 nature, portraits），并将生成的图片放入，系统会自动将文件夹名称映射为网站的分类标签，结构清晰，完全脱机运行。</p>
                </div>
                <div className="info-card glass-panel">
                  <h3>🧠 ComfyUI 元数据提取</h3>
                  <p>原生支持 PNG 与 WebP 文件块分析，直接提取并还原 ComfyUI 生成图片时嵌入的完整提示词、负向提示词、Seed、Steps、采样器、大模型等参数。</p>
                </div>
                <div className="info-card glass-panel">
                  <h3>🔗 零后端静态体验</h3>
                  <p>通过极致优化的打包逻辑，整个网站均为前端静态页面。仅通过一个本地 Node 扫描脚本即可实时同步最新图片并生成前端数据库，速度飞快，部署极简。</p>
                </div>
              </div>
            </section>

            {/* Category Quick Preview */}
            <section className="category-preview-section">
              <h2 className="section-title">图片类别预览</h2>
              <div className="category-grid">
                {loading ? (
                  <div className="loading-spinner">加载分类中...</div>
                ) : (
                  categories.filter(cat => cat !== 'all').map(cat => {
                    const catImages = images.filter(img => img.category === cat);
                    const coverImg = catImages[0]?.path || '';
                    return (
                      <div 
                        key={cat} 
                        className="cat-preview-card glass-panel"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setActiveTab('gallery');
                        }}
                        style={{
                          backgroundImage: coverImg ? `linear-gradient(to bottom, rgba(10, 15, 30, 0.4), rgba(7, 9, 14, 0.95)), url(${coverImg})` : 'none'
                        }}
                      >
                        <div className="cat-preview-content">
                          <Folder className="cat-icon" size={24} />
                          <h3>{cat.charAt(0).toUpperCase() + cat.slice(1)}</h3>
                          <span className="cat-count">{catImages.length} 张图片</span>
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
                    {cat === 'all' ? '全部图片' : cat.charAt(0).toUpperCase() + cat.slice(1)}
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
                <p>扫描并提取本地图片元数据中，请稍候...</p>
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="gallery-empty-state glass-panel">
                <ImageIcon size={48} className="empty-icon" />
                <h3>没有找到匹配的图片</h3>
                <p>尝试清除搜索词或更改筛选条件，或者放入图片运行扫描脚本。</p>
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
                    <div className="image-card-img-wrapper">
                      <img src={img.path} alt={img.filename} loading="lazy" />
                      <div className="card-overlay">
                        {img.metadata?.hasMetadata && (
                          <span className="overlay-badge glass-panel"><Sparkles size={12} /> ComfyUI</span>
                        )}
                        <button className="card-view-btn btn-primary">
                          查看生成参数
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
                  <p>本网站为 <strong>全静态纯前端展示页面</strong>，无需任何数据库或动态后端服务。所有的图片及其元数据在部署/打包时被一次性解析并生成前端索引文件。</p>
                  <ul>
                    <li><strong>前端框架:</strong> React 19, Vite 8, Vanilla CSS</li>
                    <li><strong>运行环境:</strong> 浏览器支持现代 HTML5, Node.js v16+ (仅用于扫描本地图片)</li>
                    <li><strong>无后端优势:</strong> 零服务器压力，可直接托管至 GitHub Pages、Gitee Pages、Vercel 或本地直接浏览器双击预览。</li>
                  </ul>
                </section>

                <hr />

                <section id="how-it-works">
                  <h2>2. 扫描与渲染原理</h2>
                  <div className="principle-box">
                    <p>网站数据流如下：</p>
                    <ol>
                      <li>用户将 ComfyUI 生成的图片分类存放在 <code>/public/images/[分类目录]/</code>。</li>
                      <li>在根目录执行 <code>npm run scan</code>。</li>
                      <li>Node 脚本 <code>scan-images.js</code> 会读取所有子文件夹，解析 PNG Chunks 中的 <code>tEXt/iTXt</code> 字段，或 WebP 的 <code>XMP</code> 属性。</li>
                      <li>若图片被压缩剥离了元数据，脚本会自动检查同名 <code>.json</code> 侧边栏文件。</li>
                      <li>脚本生成 <code>public/images-data.json</code> 前端数据库，React 启动后直接 Fetch 该数据并提供搜索、过滤、展示。</li>
                    </ol>
                  </div>
                </section>

                <hr />

                <section id="use">
                  <h2>3. 使用说明</h2>
                  <div className="code-box">
                    <h3>第一步：放置图片</h3>
                    <p>在 <code>/public/images/</code> 下按照你想要的分类建立文件夹，将生成的 PNG/JPG/WebP 图片放进去，如：</p>
                    <pre>
{`public/images/
├── cyberpunk/
│   ├── image_01.png
│   └── street.jpg
└── nature/
    └── forest.webp`}
                    </pre>

                    <h3 style={{ marginTop: '1.5rem' }}>第二步：运行扫描脚本</h3>
                    <p>打开终端，在项目根目录下执行以下命令：</p>
                    <pre>
                      <code>npm run scan</code>
                    </pre>
                    <p className="note-text"><em>提示：每次往文件夹添加或删除图片，均需运行一次扫描脚本以更新网站数据库。</em></p>

                    <h3 style={{ marginTop: '1.5rem' }}>第三步：启动预览网站</h3>
                    <pre>
                      <code>npm run dev</code>
                    </pre>
                    <p>打开控制台输出的本地链接（通常为 <code>http://localhost:5173</code>）即可查看网站。</p>
                  </div>
                </section>

                <hr />

                <section id="metadata">
                  <h2>4. ComfyUI 元数据解析机制</h2>
                  <p>ComfyUI 将其工作流及生成节点配置以下列格式存储在图片中：</p>
                  <ul>
                    <li><strong>PNG 格式:</strong> 存储在二进制头部的 <code>tEXt</code> 文本区块中，关键字为 <code>prompt</code> (生成图 graph API) 和 <code>workflow</code> (前端 UI 连线图)。</li>
                    <li><strong>WebP 格式:</strong> 存储在 RIFF 块的 <code>XMP </code> 元数据段，以 XML 标签包含属性 <code>comfyui:prompt</code> 及 <code>comfyui:workflow</code>。</li>
                  </ul>
                  <p>本项目的扫描引擎会自动解析上述区块，并智能提取 <code>KSampler</code> 节点相连的输入节点，过滤正向/负向提示词，提取 Seed、采样器、步数等核心生成参数，极其直观。</p>
                </section>

                <hr />

                <section id="deploy">
                  <h2>5. 静态部署指南</h2>
                  <p>由于本项目不需要后端，可以通过以下几种方式部署并分享你的画廊：</p>
                  
                  <div className="deploy-method">
                    <h3>🚀 Vercel 部署 (推荐)</h3>
                    <ol>
                      <li>将项目上传至 GitHub。</li>
                      <li>在 Vercel 导入你的 GitHub 仓库。</li>
                      <li>构建设置选择默认（Build Command: <code>npm run build</code>, Output Directory: <code>dist</code>）。</li>
                      <li>Vercel 会自动编译 React，你的画廊即刻上线！</li>
                    </ol>
                  </div>

                  <div className="deploy-method">
                    <h3>📦 静态打包 (适合本地离线打包或 Nginx)</h3>
                    <ol>
                      <li>在终端执行：<code>npm run build</code></li>
                      <li>打包生成的文件将保存在 <code>/dist/</code> 目录下。</li>
                      <li>你可以将 <code>/dist/</code> 目录下的所有文件上传到你自己的 Nginx / Apache 服务器，或者打包发给朋友直接双击 index.html (需通过 Live Server 容器) 预览。</li>
                    </ol>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

      </main>

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
              
              {/* Left Side: Image display */}
              <div className="modal-left-panel">
                <div className="modal-image-container">
                  <img src={selectedImage.path} alt={selectedImage.filename} />
                </div>
                <div className="modal-image-actions">
                  <span className={`category-badge category-${selectedImage.category}`}>
                    {selectedImage.category}
                  </span>
                  <div className="action-buttons-group">
                    <button 
                      className="btn-secondary"
                      onClick={() => downloadImage(selectedImage.path, selectedImage.filename)}
                    >
                      <Download size={16} /> <span>下载原图</span>
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
                    <p>该图片可能是在其他软件中编辑过，或者已被剥离了元数据信息。</p>
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
