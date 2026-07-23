import React from 'react';
import {
  Video,
  Plus,
  Settings,
  Trash2,
  X,
  Eye,
  EyeOff,
  Film,
  Upload,
  Sparkles,
  Shuffle,
  AlertCircle,
  Check,
  Copy,
  RefreshCw,
  Download
} from 'lucide-react';
import { VIDEO_MODELS, VIDEO_PROMPT_EXAMPLES_BY_MODE } from '../../constants/videoModels';

export function VideoGenerator({
  videoSubTab,
  setVideoSubTab,
  videoFilterSubTab,
  setVideoFilterSubTab,
  videoFilterModel,
  setVideoFilterModel,
  availableVideoModels,
  videoModel,
  setVideoModel,
  showAddModelModal,
  setShowAddModelModal,
  newModelName,
  setNewModelName,
  newModelTag,
  setNewModelTag,
  handleAddCustomModel,
  handleDeleteCustomModel,
  showVideoApiSettings,
  setShowVideoApiSettings,
  dashscopeApiKey,
  setDashscopeApiKey,
  showDashscopeKey,
  setShowDashscopeKey,
  videoApiUrl,
  setVideoApiUrl,
  videoFilePreview,
  setVideoFilePreview,
  videoEditRefImage,
  setVideoEditRefImage,
  videoRefImages,
  handleRemoveRefImage,
  videoImagePreview,
  setVideoImagePreview,
  videoPrompt,
  setVideoPrompt,
  videoResolution,
  setVideoResolution,
  videoAspectRatio,
  setVideoAspectRatio,
  videoDuration,
  setVideoDuration,
  videoDurationMode,
  setVideoDurationMode,
  videoAudioSetting,
  setVideoAudioSetting,
  videoSeed,
  setVideoSeed,
  videoIsGenerating,
  videoProgressStatus,
  handleGenerateVideo,
  videoResults,
  checkSingleTask,
  handleVideoImageUpload,
  handleVideoFileUpload,
  copyToClipboard,
  copiedField
}) {
  return (
    <div className="video-generator-tab animate-fade-in">
      {/* Top Sub-Navigation Header */}
      <div className="video-top-header glass-panel">
        <div className="video-header-left">
          <div className="video-header-title">
            <Video size={20} className="title-icon" />
            <span>视觉模型</span>
          </div>
          <div className="video-header-modes">
            <button
              className={`mode-btn ${videoSubTab === 'i2v' ? 'active' : ''}`}
              onClick={() => setVideoSubTab('i2v')}
            >
              图生视频
            </button>
            <button
              className={`mode-btn ${videoSubTab === 't2v' ? 'active' : ''}`}
              onClick={() => setVideoSubTab('t2v')}
            >
              文生视频
            </button>
            <button
              className={`mode-btn ${videoSubTab === 'r2v' ? 'active' : ''}`}
              onClick={() => setVideoSubTab('r2v')}
            >
              参考生视频
            </button>
            <button
              className={`mode-btn ${videoSubTab === 'edit' ? 'active' : ''}`}
              onClick={() => setVideoSubTab('edit')}
            >
              视频编辑
            </button>
          </div>
        </div>

        <div className="video-header-right">
          <div className="video-filter-tabs">
            <button
              className={`v-filter-pill ${videoFilterSubTab === 'all' ? 'active' : ''}`}
              onClick={() => setVideoFilterSubTab('all')}
            >
              全部
            </button>
            <button
              className={`v-filter-pill ${videoFilterSubTab === 'i2v' ? 'active' : ''}`}
              onClick={() => setVideoFilterSubTab('i2v')}
            >
              图生视频
            </button>
            <button
              className={`v-filter-pill ${videoFilterSubTab === 't2v' ? 'active' : ''}`}
              onClick={() => setVideoFilterSubTab('t2v')}
            >
              文生视频
            </button>
            <button
              className={`v-filter-pill ${videoFilterSubTab === 'r2v' ? 'active' : ''}`}
              onClick={() => setVideoFilterSubTab('r2v')}
            >
              参考生视频
            </button>
            <button
              className={`v-filter-pill ${videoFilterSubTab === 'edit' ? 'active' : ''}`}
              onClick={() => setVideoFilterSubTab('edit')}
            >
              视频编辑
            </button>
          </div>

          <div className="video-model-filter-dropdown">
            <select
              value={videoFilterModel}
              onChange={(e) => setVideoFilterModel(e.target.value)}
              className="v-model-select"
            >
              <option value="all">全部模型</option>
              {availableVideoModels.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div className="video-workspace-layout mt-4">
        {/* Left Column: Video Controls Sidebar */}
        <div className="video-controls-panel glass-panel">
          {/* Model Selector Dropdown */}
          <div className="video-form-group">
            <label className="v-form-label">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>生成模型</span>
                <button
                  className="v-settings-btn"
                  onClick={() => setShowAddModelModal(!showAddModelModal)}
                  title="添加自定义新模型"
                  style={{ color: 'var(--primary-hover)', fontWeight: '600' }}
                >
                  <Plus size={13} /> 添加模型
                </button>
              </div>
              <button className="v-settings-btn" onClick={() => setShowVideoApiSettings(!showVideoApiSettings)} title="配置 API Key">
                <Settings size={14} /> 接口设置
              </button>
            </label>
            <div className="v-model-picker-wrapper" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                className="v-model-picker"
                style={{ flex: 1 }}
                value={videoModel}
                onChange={(e) => setVideoModel(e.target.value)}
              >
                {availableVideoModels
                  .filter(m => !m.mode || m.mode === videoSubTab)
                  .map(model => {
                    const isCustom = !VIDEO_MODELS.some(base => base.id === model.id);
                    return (
                      <option key={model.id} value={model.id}>
                        🎬 {model.id} ({model.tag}){isCustom ? ' [自定义]' : ''}
                      </option>
                    );
                  })}
              </select>
              {!VIDEO_MODELS.some(base => base.id === videoModel) && (
                <button
                  className="v-settings-btn"
                  onClick={() => handleDeleteCustomModel(videoModel)}
                  title="删除选中的自定义模型"
                  style={{
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Trash2 size={13} /> 删除
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Custom Model Creator Form */}
          {showAddModelModal && (
            <div className="v-api-settings-panel glass-panel animate-fade-in mb-3">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>✨ 添加自定义视频模型</span>
                <button className="text-link-btn" onClick={() => setShowAddModelModal(false)}><X size={14} /></button>
              </div>
              <div className="input-group">
                <label className="field-label">模型标识 / 名称 (Model ID)</label>
                <input
                  type="text"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  placeholder="例如: wanx2.1-i2v-plus / cogvideo-fun"
                />
              </div>
              <div className="input-group mt-2">
                <label className="field-label">显示名称 / 描述标签 (Tag)</label>
                <input
                  type="text"
                  value={newModelTag}
                  onChange={(e) => setNewModelTag(e.target.value)}
                  placeholder="例如: 通义万相 2.1 高清图生"
                />
              </div>
              <button
                className="v-action-btn primary mt-3"
                onClick={handleAddCustomModel}
                style={{ width: '100%', padding: '8px' }}
              >
                确认添加新模型
              </button>
            </div>
          )}

          {/* Collapsible API Settings Panel */}
          {showVideoApiSettings && (
            <div className="v-api-settings-panel glass-panel animate-fade-in mb-3">
              <div className="input-group">
                <label className="field-label">阿里 DashScope API Key</label>
                <div className="v-key-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showDashscopeKey ? 'text' : 'password'}
                    value={dashscopeApiKey}
                    onChange={(e) => setDashscopeApiKey(e.target.value)}
                    placeholder="sk-..."
                    style={{ width: '100%', paddingRight: '36px' }}
                  />
                  <button
                    type="button"
                    className="v-toggle-key-btn"
                    onClick={() => setShowDashscopeKey(!showDashscopeKey)}
                    title={showDashscopeKey ? '隐藏 API Key' : '查看 API Key 信息'}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px'
                    }}
                  >
                    {showDashscopeKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span className="field-hint">调用视频合成 API 必需提供有效的 DashScope API Key。</span>
              </div>
              <div className="input-group mt-2">
                <label className="field-label">视频合成 API Base URL</label>
                <input
                  type="text"
                  value={videoApiUrl}
                  onChange={(e) => setVideoApiUrl(e.target.value)}
                  placeholder="https://llm-ioipmcjm1v2f40ks.cn-beijing.maas.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis"
                />
              </div>
            </div>
          )}

          {/* Media Upload Section */}
          {videoSubTab === 'edit' ? (
            <>
              <div className="video-form-group">
                <label className="v-form-label">
                  <span>上传原视频 (video1)</span>
                  <span className="v-required">* 必须</span>
                </label>
                <div className="v-image-upload-box">
                  {videoFilePreview ? (
                    <div className="v-uploaded-preview">
                      <video src={videoFilePreview} controls style={{ width: '100%', maxHeight: '160px', objectFit: 'contain', background: '#000' }} />
                      <span className="v-ref-badge" style={{ bottom: '8px', left: '8px' }}>video1</span>
                      <button className="remove-img-btn" onClick={() => setVideoFilePreview(null)} title="移除视频">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="v-upload-dropzone">
                      <Film size={26} className="upload-icon" />
                      <span>点击或拖拽原视频 (video1) 至此处上传</span>
                      <span className="upload-subtext">支持 MP4, WebM, MOV 格式 (建议 1080P/720P)</span>
                      <input type="file" accept="video/*" onChange={handleVideoFileUpload} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
              </div>

              <div className="video-form-group mt-2">
                <label className="v-form-label">
                  <span>上传编辑参考图 (image1)</span>
                  <span className="upload-subtext" style={{ fontWeight: 'normal' }}>1张参考图</span>
                </label>
                <div className="v-image-upload-box">
                  {videoEditRefImage ? (
                    <div className="v-uploaded-preview">
                      <img src={videoEditRefImage} alt="Edit Reference" />
                      <span className="v-ref-badge" style={{ bottom: '8px', left: '8px' }}>image1</span>
                      <button className="remove-img-btn" onClick={() => setVideoEditRefImage(null)} title="移除参考图">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="v-upload-dropzone" style={{ padding: '1rem' }}>
                      <Upload size={22} className="upload-icon" />
                      <span>点击或拖拽上传编辑参考图 (image1)</span>
                      <span className="upload-subtext">支持 JPG, PNG, WEBP</span>
                      <input type="file" accept="image/*" onChange={handleVideoImageUpload} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
              </div>
            </>
          ) : videoSubTab === 'r2v' ? (
            <div className="video-form-group">
              <label className="v-form-label">
                <span>上传参考图片矩阵 (image1 ~ image9)</span>
                <span className="v-required">* 最多9张</span>
              </label>
              <div className="v-multi-ref-grid">
                {videoRefImages.map((imgUrl, idx) => (
                  <div key={idx} className="v-ref-thumb-card">
                    <img src={imgUrl} alt={`ref-image${idx + 1}`} />
                    <span className="v-ref-badge">image{idx + 1}</span>
                    <button className="remove-img-btn" onClick={() => handleRemoveRefImage(idx)} title={`移除 image${idx + 1}`}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {videoRefImages.length < 9 && (
                  <label className="v-ref-add-dropzone" style={{ minHeight: videoRefImages.length === 0 ? '90px' : 'auto' }} title="点击上传参考图片 (支持一次选择多张，最多9张)">
                    <Upload size={20} className="upload-icon" style={{ marginBottom: '2px' }} />
                    <span>{videoRefImages.length === 0 ? '点击或拖拽参考图 (支持多选，最多9张)' : `+ 参考图 (image${videoRefImages.length + 1})`}</span>
                    <span className="upload-subtext">已上传 {videoRefImages.length}/9 张</span>
                    <input type="file" accept="image/*" multiple onChange={handleVideoImageUpload} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>
          ) : videoSubTab === 'i2v' && (
            <div className="video-form-group">
              <label className="v-form-label">
                <span>上传源图 (image1)</span>
                <span className="v-required">* 1张</span>
              </label>
              <div className="v-image-upload-box">
                {videoImagePreview ? (
                  <div className="v-uploaded-preview">
                    <img src={videoImagePreview} alt="Uploaded source" />
                    <span className="v-ref-badge" style={{ bottom: '8px', left: '8px' }}>image1</span>
                    <button className="remove-img-btn" onClick={() => setVideoImagePreview(null)} title="移除图片">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="v-upload-dropzone">
                    <Upload size={24} className="upload-icon" />
                    <span>点击或将源图 (image1) 拖拽至此处上传</span>
                    <span className="upload-subtext">支持 JPG, PNG, WEBP (建议比例 16:9 或 1:1)</span>
                    <input type="file" accept="image/*" onChange={handleVideoImageUpload} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Prompt Textarea */}
          <div className="video-form-group">
            <label className="v-form-label">
              <span>提示词</span>
              <span className="v-required">*</span>
            </label>
            <textarea
              className="v-prompt-textarea"
              rows={4}
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              placeholder={
                videoSubTab === 'edit'
                  ? '例如：参考image1，将video1中正在行驶的白色邮轮替换为图中所示的太空飞船...'
                  : videoSubTab === 'r2v'
                    ? '例如：The princess image2 was imprisoned in bedroom and be threaten by the dragon man image1...'
                    : '请输入对视频画面的详细动效描述...'
              }
            />

            {/* Variable Tag Quick Insertion Bar */}
            {videoSubTab !== 't2v' && (
              <div className="v-insert-tags-row">
                <span className="example-label" style={{ marginRight: '2px' }}>插入变量标签:</span>
                {videoSubTab === 'edit' && (
                  <>
                    <button
                      type="button"
                      className="v-insert-tag-pill"
                      onClick={() => setVideoPrompt(prev => prev + ' video1')}
                      title="插入原视频引用名称 video1"
                    >
                      + video1
                    </button>
                    <button
                      type="button"
                      className="v-insert-tag-pill"
                      onClick={() => setVideoPrompt(prev => prev + ' image1')}
                      title="插入参考图引用名称 image1"
                    >
                      + image1
                    </button>
                  </>
                )}
                {videoSubTab === 'i2v' && (
                  <button
                    type="button"
                    className="v-insert-tag-pill"
                    onClick={() => setVideoPrompt(prev => prev + ' image1')}
                    title="插入源图引用名称 image1"
                  >
                    + image1
                  </button>
                )}
                {videoSubTab === 'r2v' && (
                  Array.from({ length: Math.min(Math.max(videoRefImages.length + 1, 3), 9) }).map((_, idx) => {
                    const tagBracket = `[Image ${idx + 1}]`;
                    const tagLower = `image${idx + 1}`;
                    return (
                      <React.Fragment key={idx}>
                        <button
                          type="button"
                          className="v-insert-tag-pill"
                          onClick={() => setVideoPrompt(prev => prev + ` ${tagBracket}`)}
                          title={`插入参考图引用名称 ${tagBracket}`}
                        >
                          + {tagBracket}
                        </button>
                        <button
                          type="button"
                          className="v-insert-tag-pill"
                          onClick={() => setVideoPrompt(prev => prev + ` ${tagLower}`)}
                          title={`插入参考图引用名称 ${tagLower}`}
                        >
                          + {tagLower}
                        </button>
                      </React.Fragment>
                    );
                  })
                )}
              </div>
            )}

            {/* Sample Prompt Chips based on current Mode */}
            <div className="v-example-prompts">
              <span className="example-label">示例 Prompt 预设</span>
              <div className="example-chips-flow">
                {(VIDEO_PROMPT_EXAMPLES_BY_MODE[videoSubTab] || VIDEO_PROMPT_EXAMPLES_BY_MODE.t2v).map((item, idx) => (
                  <button
                    key={idx}
                    className="v-example-chip"
                    onClick={() => setVideoPrompt(item.text)}
                    title={item.text}
                  >
                    ✨ {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Options Grid */}
          <div className="v-options-grid">
            <div className="v-option-item">
              <label className="v-option-label">分辨率</label>
              <div className="v-pills-row">
                <button
                  type="button"
                  className={`v-select-pill ${videoResolution === '720P' ? 'active' : ''}`}
                  onClick={() => setVideoResolution('720P')}
                >
                  720P
                </button>
                <button
                  type="button"
                  className={`v-select-pill ${videoResolution === '1080P' ? 'active' : ''}`}
                  onClick={() => setVideoResolution('1080P')}
                >
                  1080P
                </button>
              </div>
            </div>

            <div className="v-option-item">
              <label className="v-option-label">画幅比例</label>
              <div className="v-ratio-grid">
                {['16:9', '9:16', '1:1', '4:3', '3:4'].map(r => (
                  <button
                    key={r}
                    type="button"
                    className={`v-ratio-btn ${videoAspectRatio === r ? 'active' : ''}`}
                    onClick={() => setVideoAspectRatio(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="v-option-item">
              <label className="v-option-label">
                <span>生成时长</span>
                {!(videoSubTab === 'edit' && videoDurationMode === 'align') && (
                  <span className="v-slider-value">{videoDuration} 秒</span>
                )}
              </label>

              {videoSubTab === 'edit' && (
                <div className="v-pills-row" style={{ marginBottom: '0.4rem' }}>
                  <button
                    type="button"
                    className={`v-select-pill ${videoDurationMode === 'align' ? 'active' : ''}`}
                    onClick={() => setVideoDurationMode('align')}
                  >
                    对齐原视频
                  </button>
                  <button
                    type="button"
                    className={`v-select-pill ${videoDurationMode === 'custom' ? 'active' : ''}`}
                    onClick={() => setVideoDurationMode('custom')}
                  >
                    自定义时长
                  </button>
                </div>
              )}

              {videoSubTab === 'edit' && videoDurationMode === 'align' ? (
                <div className="v-align-duration-hint">
                  ⚙️ 已开启“自动对齐原视频播放时长”模式
                </div>
              ) : (
                <div className="v-duration-slider-row">
                  <input
                    type="range"
                    min={3}
                    max={15}
                    step={1}
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(Number(e.target.value))}
                    className="v-range-slider"
                  />
                </div>
              )}
            </div>

            <div className="v-option-item">
              <label className="v-option-label">音效声音</label>
              <div className="v-pills-row">
                <button
                  type="button"
                  className={`v-select-pill ${videoAudioSetting === 'auto' ? 'active' : ''}`}
                  onClick={() => setVideoAudioSetting('auto')}
                >
                  自动智能合成
                </button>
                <button
                  type="button"
                  className={`v-select-pill ${videoAudioSetting === 'origin' ? 'active' : ''}`}
                  onClick={() => setVideoAudioSetting('origin')}
                >
                  沿用原声/无音效
                </button>
              </div>
            </div>

            <div className="v-option-item">
              <label className="v-option-label">随机种子 (Seed)</label>
              <div className="v-seed-input-wrapper">
                <input
                  type="number"
                  className="v-seed-input"
                  value={videoSeed}
                  onChange={(e) => setVideoSeed(Number(e.target.value))}
                />
                <button
                  type="button"
                  className="v-seed-random-btn"
                  onClick={() => setVideoSeed(Math.floor(Math.random() * 1000000000))}
                  title="生成随机 Seed"
                >
                  <Shuffle size={14} /> 随机
                </button>
              </div>
            </div>
          </div>

          {/* Submit Generate Button */}
          <div className="video-submit-container">
            <button
              className={`v-generate-btn ${videoIsGenerating ? 'generating' : ''}`}
              onClick={handleGenerateVideo}
              disabled={videoIsGenerating}
            >
              <Sparkles size={18} />
              <span>{videoIsGenerating ? '任务派发中...' : '生成视频'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Output Video Gallery Grid */}
        <div className="video-display-panel glass-panel">
          <div className="v-display-header">
            <h3>生成结果与渲染任务 ({
              videoResults.filter(v =>
                (videoFilterModel === 'all' || v.model === videoFilterModel) &&
                (videoFilterSubTab === 'all' || v.subTab === videoFilterSubTab)
              ).length
            })</h3>
          </div>

          {/* Generating Loading Overlay State */}
          {videoIsGenerating && (
            <div className="video-generating-card glass-panel animate-fade-in mb-4">
              <div className="v-loading-spinner-wrapper">
                <div className="loading-spinner"></div>
                <Film size={28} className="spinner-center-icon" />
              </div>
              <div className="v-generating-info">
                <h4>正在通过阿里 {videoModel} 渲染视频...</h4>
                <p className="status-step-text">{videoProgressStatus}</p>
                <div className="v-progress-bar-bg">
                  <div className="v-progress-bar-fill"></div>
                </div>
              </div>
            </div>
          )}

          {/* Video Cards Grid */}
          <div className="video-results-grid">
            {videoResults
              .filter(v =>
                (videoFilterModel === 'all' || v.model === videoFilterModel) &&
                (videoFilterSubTab === 'all' || v.subTab === videoFilterSubTab)
              )
              .map(item => (
                <div key={item.id} className="video-item-card glass-panel animate-fade-in">
                  <div className="v-card-media-wrapper">
                    {item.status === 'PENDING' || item.status === 'RUNNING' ? (
                      <div
                        className="v-task-pending-placeholder"
                        style={item.imagePreview ? {
                          backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.6) 0%, rgba(15,23,42,0.9) 100%), url(${item.imagePreview})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        } : {}}
                      >
                        <div className="loading-spinner"></div>
                        <span className="v-pending-text">⏳ 正在渲染 ({item.status || 'RUNNING'})</span>
                        <span className="v-pending-subtext">{item.progressText || '后台计算中...'}</span>
                        <span className="v-pending-taskid">Task ID: {item.taskId}</span>
                      </div>
                    ) : item.status === 'FAILED' ? (
                      <div
                        className="v-task-failed-placeholder"
                        style={item.imagePreview ? {
                          backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.7) 0%, rgba(15,23,42,0.95) 100%), url(${item.imagePreview})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        } : {}}
                      >
                        <AlertCircle size={28} style={{ color: 'var(--accent-rose, #ef4444)' }} />
                        <span className="v-failed-text">⚠️ 渲染产生错误</span>
                        <span className="v-failed-subtext">{item.errorMsg || '任务异常中断'}</span>
                        <span className="v-pending-taskid">Task ID: {item.taskId}</span>
                      </div>
                    ) : (
                      <video
                        src={item.path}
                        poster={item.imagePreview || ''}
                        controls
                        loop
                        preload="metadata"
                        className="v-card-video"
                      />
                    )}
                    <div className="v-card-badges">
                      <span className="v-badge model-badge">{item.model}</span>
                      <span className="v-badge quality-badge">{item.resolution}</span>
                      <span className="v-badge ratio-badge">{item.aspectRatio}</span>
                      {item.status && <span className={`v-badge status-badge-${item.status.toLowerCase()}`}>{item.status}</span>}
                    </div>
                  </div>

                  <div className="v-card-details">
                    <div className="v-card-title-row">
                      <h4>{item.title}</h4>
                      <span className="v-card-time">{item.createdAt}</span>
                    </div>

                    <p className="v-card-prompt">{item.prompt}</p>

                    <div className="v-card-meta-bar">
                      <span className="v-meta-tag">时长: {item.duration}s</span>
                      <span className="v-meta-tag">Seed: {item.seed}</span>
                    </div>

                    <div className="v-card-actions">
                      <button
                        className="v-action-btn"
                        onClick={() => {
                          copyToClipboard(item.prompt, item.id, '视频提示词已复制！');
                        }}
                      >
                        {copiedField === item.id ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedField === item.id ? '已复制' : '复制 Prompt'}</span>
                      </button>

                      {item.status === 'PENDING' || item.status === 'RUNNING' || item.status === 'FAILED' ? (
                        <button
                          className="v-action-btn primary"
                          onClick={() => checkSingleTask(item.id, item.taskId, dashscopeApiKey, videoApiUrl)}
                        >
                          <RefreshCw size={14} />
                          <span>刷新状态</span>
                        </button>
                      ) : (
                        <a
                          href={item.path}
                          download={`${item.model}_${item.id}.mp4`}
                          className="v-action-btn primary"
                        >
                          <Download size={14} />
                          <span>下载视频</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
