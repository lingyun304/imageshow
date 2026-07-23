import React from 'react';
import {
  Sparkles,
  Search,
  X,
  Shuffle,
  Trash2,
  HelpCircle,
  Plus,
  Minus
} from 'lucide-react';
import { parseTag } from '../../utils/tagParser';

export function TagBuilder({
  genModel,
  setGenModel,
  genRating,
  setGenRating,
  searchScope,
  setSearchScope,
  handleRandomGenerate,
  activeRandomStyle,
  tagDatabase,
  selectedGenCategory,
  setSelectedGenCategory,
  genSearchQuery,
  setGenSearchQuery,
  selectedTags,
  setSelectedTags,
  handleToggleTag,
  handleAdjustWeight,
  setActiveRandomStyle
}) {
  return (
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
              onClick={() => setGenModel('pony')}
            >
              <div className="preset-name">Pony Diffusion V6</div>
              <div className="preset-desc">基于 score 评分的前缀风格</div>
            </button>
            <button
              className={`model-preset-btn ${genModel === 'illustrious' ? 'active' : ''}`}
              onClick={() => setGenModel('illustrious')}
            >
              <div className="preset-name">Illustrious XL</div>
              <div className="preset-desc">角色/版权在前，画质修饰在后</div>
            </button>
            <button
              className={`model-preset-btn ${genModel === 'anime' ? 'active' : ''}`}
              onClick={() => setGenModel('anime')}
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
                    <span className="category-title">{catData.displayName} ({catKey})</span>
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
                    placeholder={searchScope === 'global' ? "在全部 28 个分类中搜索标签..." : `在“${tagDatabase?.[selectedGenCategory] ? `${tagDatabase[selectedGenCategory].displayName} (${selectedGenCategory})` : ''}”分类中搜索...`}
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

        {/* Right Column: Prompt Builder / Selected list */}
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
                      <span className="chip-category-label">{tagDatabase?.[tagObj.category] ? `${tagDatabase[tagObj.category].displayName} (${tagObj.category})` : tagObj.category}</span>
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
                        className="remove-chip-btn"
                        onClick={() => handleToggleTag(tagObj.raw, tagObj.category)}
                        title="移除此标签"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
