import React from 'react';
import { ImageIcon, Sparkles } from 'lucide-react';
import { getMediaCategoryDisplayName } from '../../constants/translations';

export function GalleryGrid({
  loading,
  filteredImages,
  setSelectedImage,
  resetFilters
}) {
  if (loading) {
    return (
      <div className="gallery-loading-placeholder">
        <div className="loading-spinner"></div>
        <p>扫描并提取本地媒体元数据中，请稍候...</p>
      </div>
    );
  }

  if (filteredImages.length === 0) {
    return (
      <div className="gallery-empty-state glass-panel">
        <ImageIcon size={48} className="empty-icon" />
        <h3>没有找到匹配的媒体</h3>
        <p>尝试清除搜索词或更改筛选条件，或者放入媒体文件运行扫描脚本。</p>
        {resetFilters && (
          <button className="btn-secondary" onClick={resetFilters}>
            清除所有筛选
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="masonry-grid animate-fade-in">
      {filteredImages.map((img) => (
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
                    e.target.play().catch((err) => console.log('Video play interrupted', err));
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
              <span className={`category-badge category-${img.category.toLowerCase()}`}>
                {getMediaCategoryDisplayName(img.category)}
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
  );
}
