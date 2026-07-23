import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  FileText,
  Copy,
  Check,
  Code,
  Info
} from 'lucide-react';
import { getMediaCategoryDisplayName } from '../../constants/translations';

export function MediaDetailModal({
  selectedImage,
  setSelectedImage,
  handlePrevImage,
  handleNextImage,
  isFirstImage,
  isLastImage,
  copyToClipboard,
  copiedField
}) {
  const [rawTab, setRawTab] = useState('prompt'); // 'prompt', 'workflow'

  if (!selectedImage) return null;

  const downloadImage = (path, filename) => {
    const link = document.createElement('a');
    link.href = path;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
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
          disabled={isFirstImage}
        >
          <ChevronLeft size={36} />
        </button>
        <button
          className="modal-nav-btn next"
          onClick={handleNextImage}
          disabled={isLastImage}
        >
          <ChevronRight size={36} />
        </button>

        {/* Modal Grid Split: Left = Media, Right = Parameters */}
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
              <span className={`category-badge category-${selectedImage.category.toLowerCase()}`}>
                {getMediaCategoryDisplayName(selectedImage.category)}
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
                <span className="meta-item"><Calendar size={14} /> {new Date(selectedImage.updatedAt || Date.now()).toLocaleString()}</span>
                <span className="meta-item"><FileText size={14} /> {selectedImage.size}</span>
              </div>
            </div>

            {/* If image has ComfyUI Metadata, render detailed parameters */}
            {selectedImage.metadata?.hasMetadata ? (
              <div className="metadata-container">
                {/* Positive Prompt Box */}
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
  );
}
