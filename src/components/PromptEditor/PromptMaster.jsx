import React from 'react';
import {
  Sparkles,
  Settings,
  X,
  Check,
  AlertCircle,
  Copy
} from 'lucide-react';
import { AI_STYLES, AI_COMPOSITIONS, AI_LIGHTINGS } from '../../constants/aiPrompts';

export function PromptMaster({
  llmApiUrl,
  setLlmApiUrl,
  llmApiKey,
  setLlmApiKey,
  llmModel,
  setLlmModel,
  llmPreset,
  setLlmPreset,
  showLlmSettings,
  setShowLlmSettings,
  aiConnectionTest,
  aiConnectionError,
  testLlmConnection,
  aiSelectedStyle,
  setAiSelectedStyle,
  aiSelectedComposition,
  setAiSelectedComposition,
  aiSelectedLighting,
  setAiSelectedLighting,
  aiUserIdea,
  setAiUserIdea,
  aiIsGenerating,
  handleGenerateAIPrompt,
  aiResultPrompt,
  aiResultTranslation,
  showToast,
  handleFetchLoadedModels
}) {
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

  const selectedStyleName = AI_STYLES.find(s => s.id === aiSelectedStyle)?.name || '默认';
  const selectedCompName = AI_COMPOSITIONS.find(c => c.id === aiSelectedComposition)?.name || '默认';
  const selectedLightName = AI_LIGHTINGS.find(l => l.id === aiSelectedLighting)?.name || '默认';

  return (
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
                <button
                  className={`preset-pill ${llmPreset === 'ollama' ? 'active' : ''}`}
                  onClick={() => handleLlmPresetChange('ollama')}
                >
                  Ollama (本地)
                </button>
                <button
                  className={`preset-pill ${llmPreset === 'deepseek' ? 'active' : ''}`}
                  onClick={() => handleLlmPresetChange('deepseek')}
                >
                  DeepSeek (远程)
                </button>
                <button
                  className={`preset-pill ${llmPreset === 'openai' ? 'active' : ''}`}
                  onClick={() => handleLlmPresetChange('openai')}
                >
                  OpenAI (远程)
                </button>
                <button
                  className={`preset-pill ${llmPreset === 'custom' ? 'active' : ''}`}
                  onClick={() => setLlmPreset('custom')}
                >
                  自定义接口
                </button>
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
                  {handleFetchLoadedModels && (
                    <button
                      className="text-link-btn"
                      onClick={handleFetchLoadedModels}
                      title="自动从服务商接口拉取当前已加载的模型名称"
                    >
                      自动获取已加载模型
                    </button>
                  )}
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
            <h3 className="section-title">Step 3. 光影氛围渲染</h3>
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
            <h3 className="section-title">Step 4. 输入您的创意脑洞描述</h3>
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
                <p className="loading-subtext">
                  我们将在您选择的【{selectedStyleName}】风格、【{selectedCompName}】构图与【{selectedLightName}】光影上进行细节化艺术渲染。
                </p>
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
                        showToast('英文提示词已成功复制到剪贴板！', 'success');
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
                          showToast('中文释义已复制到剪贴板！', 'success');
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
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
