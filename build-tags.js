import fs from 'fs';
import path from 'path';

const DATA_DIR = './tag/Data';
const OUTPUT_FILE = './public/tag-data.json';

const categoryTranslations = {
  "Accessory": "饰品/配饰",
  "Age": "年龄/时间",
  "Animals_Creatures": "动物/生物",
  "Artist": "画师风格",
  "Backgrounds": "背景",
  "Body_Types": "身体/体型",
  "Character": "特定角色",
  "Copyright": "版权/作品",
  "Emotions_Expressions": "情绪/表情",
  "Environment_Setting": "场景/设定",
  "Ethnicity_Nationality": "人种/国籍",
  "General": "通用标签",
  "Lighting": "光影/光照",
  "MagicPrompt-Ideogram": "Ideogram提示词",
  "Meta": "画幅/元数据",
  "NSFW": "NSFW/限制级",
  "Perspective": "视角/构图",
  "Poses": "动作/姿势",
  "Props_Objects": "道具/物品",
  "Quality": "画质/质量",
  "Season": "季节",
  "Tattoos": "纹身/印记",
  "Themes": "主题/风格",
  "Weather": "天气/气候",
  "civitAI-Prompt": "Civitai热门词",
  "clothes": "衣服/服装",
  "clothing_materials": "衣服材质",
  "hair": "头发/发型"
};

function buildTags() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      console.error(`Directory ${DATA_DIR} does not exist.`);
      process.exit(1);
    }

    const files = fs.readdirSync(DATA_DIR);
    const result = {};

    for (const file of files) {
      const filePath = path.join(DATA_DIR, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile()) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split(/\r?\n/);
        const tags = [];
        const seen = new Set();

        for (let line of lines) {
          line = line.trim();
          if (!line || line.startsWith('#')) continue;
          
          if (!seen.has(line)) {
            seen.add(line);
            tags.push(line);
          }
        }

        const categoryName = file;
        const displayName = categoryTranslations[categoryName] || categoryName;
        result[categoryName] = {
          displayName,
          tags: tags
        };
      }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`Successfully generated tags JSON at ${OUTPUT_FILE} with ${Object.keys(result).length} categories.`);
  } catch (error) {
    console.error('Error compiling tags:', error);
  }
}

buildTags();
