import React from 'react';
import {
  Sparkles,
  Layers,
  ImageIcon,
  Terminal,
  Video,
  Database,
  FolderOpen,
  Leaf,
  Moon,
  Zap
} from 'lucide-react';

export function Header({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  onImportDirectory,
  onLoadScannedData,
  isLocalImport,
  importing
}) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); setActiveTab('home'); }}>
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
                <Layers size={15} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                首页
              </button>
            </li>
            <li>
              <button
                className={`nav-link-btn nav-link ${activeTab === 'gallery' ? 'active' : ''}`}
                onClick={() => setActiveTab('gallery')}
              >
                <ImageIcon size={15} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                分类媒体库
              </button>
            </li>
            <li>
              <button
                className={`nav-link-btn nav-link ${activeTab === 'generator' ? 'active' : ''}`}
                onClick={() => setActiveTab('generator')}
              >
                <Sparkles size={15} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                提示词生成器
              </button>
            </li>
            <li>
              <button
                className={`nav-link-btn nav-link ${activeTab === 'ai-generator' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai-generator')}
              >
                <Terminal size={15} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                AI 提示词大师
              </button>
            </li>
            <li>
              <button
                className={`nav-link-btn nav-link ${activeTab === 'video' ? 'active' : ''}`}
                onClick={() => setActiveTab('video')}
              >
                <Video size={15} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                视频生成
              </button>
            </li>
          </ul>

          {/* Directory Switcher Controls */}
          <div className="directory-actions">
            {isLocalImport ? (
              <button
                className="nav-action-btn load-default-btn"
                onClick={onLoadScannedData}
                title="切换回后端扫描的媒体数据库"
              >
                <Database size={14} />
                <span>载入默认库</span>
              </button>
            ) : (
              <button
                className="nav-action-btn import-local-btn"
                onClick={onImportDirectory}
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
  );
}
