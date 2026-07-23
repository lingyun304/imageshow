import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { getMediaCategoryDisplayName } from '../../constants/translations';

export function GalleryFilter({
  categories,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onlyWithMetadata,
  setOnlyWithMetadata,
  selectedModel,
  setSelectedModel,
  selectedSampler,
  setSelectedSampler,
  availableModels,
  availableSamplers,
  showFiltersPanel,
  setShowFiltersPanel,
  images,
  resetFilters
}) {
  const hasActiveFilters = Boolean(selectedModel || selectedSampler || onlyWithMetadata);

  return (
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
          className={`btn-secondary filter-toggle-btn ${showFiltersPanel || hasActiveFilters ? 'active-filters' : ''}`}
          onClick={() => setShowFiltersPanel(!showFiltersPanel)}
        >
          <SlidersHorizontal size={18} />
          <span>筛选</span>
          {hasActiveFilters && (
            <span className="filter-badge-dot"></span>
          )}
        </button>
      </div>

      {/* Collapsible Advanced Filters Panel */}
      {(showFiltersPanel || hasActiveFilters) && (
        <div className="advanced-filters-panel animate-fade-in">
          <div className="filter-group">
            <label>采样大模型</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="filter-select"
            >
              <option value="">全部模型</option>
              {availableModels.map(model => (
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
              {availableSamplers.map(sampler => (
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
          {hasActiveFilters && (
            <button
              className="btn-secondary reset-filters-btn"
              onClick={resetFilters}
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
            {getMediaCategoryDisplayName(cat)}
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
  );
}
