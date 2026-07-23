export const mediaCategoryTranslations = {
  all: { zh: '全部媒体', en: 'All' },
  cyberpunk: { zh: '赛博朋克', en: 'Cyberpunk' },
  fantasy: { zh: '奇幻', en: 'Fantasy' },
  nature: { zh: '自然', en: 'Nature' },
  vedio: { zh: '视频', en: 'Video' },
  video: { zh: '视频', en: 'Video' },
  audio: { zh: '音频', en: 'Audio' },
  test: { zh: '测试', en: 'Test' },
  test2: { zh: '测试2', en: 'Test 2' },
  uncategorized: { zh: '未分类', en: 'Uncategorized' }
};

export function getMediaCategoryDisplayName(cat) {
  if (!cat) return '';
  const normalized = cat.toLowerCase();
  if (mediaCategoryTranslations[normalized]) {
    return `${mediaCategoryTranslations[normalized].zh} (${mediaCategoryTranslations[normalized].en})`;
  }
  const isChinese = /[\u4e00-\u9fa5]/.test(cat);
  if (isChinese) {
    return cat;
  }
  const enName = cat.charAt(0).toUpperCase() + cat.slice(1);
  return enName;
}
