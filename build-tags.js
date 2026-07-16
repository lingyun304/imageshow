import fs from 'fs';
import path from 'path';
import https from 'https';

const DATA_DIR = './tag/Data';
const OUTPUT_FILE = './public/tag-data.json';
const CSV_FILE = './tag/zh-CN.csv';
const TRANSLATION_URL = 'https://cdn.jsdelivr.net/gh/byzod/a1111-sd-webui-tagcomplete-CN@master/tags/Tags-zh-full-pack.csv';

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

// Predefined vocabulary for splitting and word-by-word fallback translation
const vocab = {
  // Colors
  "blonde": "金色", "brown": "棕色", "black": "黑色", "blue": "蓝色", "white": "白色", "pink": "粉色",
  "grey": "灰色", "gray": "灰色", "purple": "紫色", "red": "红色", "green": "绿色", "orange": "橙色",
  "aqua": "水蓝色", "silver": "银色", "yellow": "黄色", "multicolored": "彩色", "rainbow": "彩虹色",
  "light-blue": "浅蓝色", "dark-blue": "深蓝色", "light-green": "浅绿色", "dark-green": "深绿色",
  "light-purple": "浅紫色", "dark-purple": "深紫色", "light-brown": "浅棕色", "dark-brown": "深棕色",
  "light-red": "浅红色", "dark-red": "深红色", "gold": "金色", "golden": "金色", "crimson": "深红色",
  "scarlet": "绯红色", "emerald": "祖母绿", "turquoise": "绿松石色", "cyan": "青色", "navy": "海军蓝",
  "magenta": "洋红色", "violet": "紫罗兰色", "beige": "米色", "chestnut": "栗色", "indigo": "靛蓝色",
  "apricot": "杏黄色", "amber": "琥珀色", "platinum": "白金色", "gradient": "渐变", "two-tone": "双色",
  "split-color": "分色", "streaked": "挑染", "dark": "深", "light": "浅", "bright": "亮", "pale": "苍白",

  // Hair & Body
  "hair": "发", "eyes": "眼", "eye": "眼", "skin": "肤色", "pubic": "阴毛", "chest": "胸部", "breast": "乳房",
  "breasts": "乳房", "armpit": "腋下", "armpits": "腋下", "legs": "双腿", "leg": "腿部", "arms": "双臂", "arm": "手臂",
  "hands": "双手", "hand": "手部", "feet": "双脚", "foot": "脚部", "head": "头部", "ears": "耳朵", "ear": "耳",
  "face": "脸部", "mouth": "嘴部", "lip": "唇", "lips": "嘴唇", "tongue": "舌头", "cheek": "面颊", "cheeks": "脸颊",
  "eyebrows": "眉毛", "eyebrow": "眉毛", "forehead": "额头", "chin": "下巴", "throat": "喉咙", "neck": "颈部",
  "nape": "后颈", "waist": "腰部", "hip": "臀部", "hips": "臀部", "navel": "肚脐", "belly": "肚子", "thigh": "大腿",
  "thighs": "大腿", "knee": "膝盖", "knees": "膝盖", "finger": "手指", "fingers": "手指", "toe": "脚趾", "toes": "脚趾",
  "horn": "角", "horns": "双角", "wing": "翅膀", "wings": "双翼", "tail": "尾巴", "tails": "多尾", "body": "身体",
  "muscle": "肌肉", "hairy": "多毛", "nipple": "乳头", "nipples": "乳头", "clitoris": "阴蒂", "vagina": "阴道",
  "penis": "阴茎", "ass": "屁股", "butt": "臀部", "buttocks": "屁股", "stomach": "胃部/小腹",

  // Clothes / Outfits
  "clothes": "衣服", "clothing": "服装", "dress": "连衣裙", "skirt": "半身裙", "shirt": "衬衫", "pants": "裤子",
  "shorts": "短裤", "jacket": "夹克/外套", "coat": "大衣", "uniform": "制服", "suit": "西装", "swimsuit": "泳装",
  "bikini": "比基尼", "underwear": "内衣", "panties": "内裤", "bra": "胸罩", "socks": "袜子", "stockings": "长筒袜",
  "thighhighs": "过膝袜", "thighhigh": "过膝袜", "gloves": "手套", "shoes": "鞋子", "boots": "靴子", "sneakers": "运动鞋",
  "hat": "帽子", "cap": "鸭舌帽", "ribbon": "丝带/蝴蝶结", "bow": "蝴蝶结", "collar": "衣领", "tie": "领带",
  "necktie": "领带", "apron": "围裙", "cape": "披风", "cloak": "斗篷", "mask": "面具", "glasses": "眼镜",
  "eyewear": "眼镜", "hairclip": "发夹", "hairpin": "发簪", "hairband": "发带", "scrunchie": "发圈", "headband": "头带",
  "tiara": "王冠", "crown": "皇冠", "necklace": "项链", "bracelet": "手链", "ring": "戒指", "earring": "耳环",
  "earrings": "耳环", "armband": "臂章", "legband": "腿环", "garter": "吊袜带", "belt": "腰带", "scarf": "围巾",
  "sweater": "毛衣", "hoodie": "连帽衫", "cardigan": "针织开衫", "blouse": "女衬衫", "t-shirt": "T恤", "vest": "背心",
  "corset": "束身衣", "kimono": "和服", "yukata": "浴衣", "cheongsam": "旗袍", "hanfu": "汉服", "maid": "女仆装",
  "school": "学校", "sailor": "水手", "gym": "运动/体操", "serafuku": "水手服", "leotard": "紧身衣", "bodysuit": "连体衣",
  "bunny": "兔女郎", "lingerie": "性感内衣", "undressing": "脱衣服", "dressed": "穿好衣服的", "naked": "裸体",
  "top": "上衣", "bottom": "下装", "sleeveless": "无袖", "short-sleeved": "短袖", "long-sleeved": "长袖",
  "oversized": "宽松的", "tight": "紧身的", "loose": "宽松", "open": "敞开/开襟", "closed": "闭合",
  "frilled": "荷叶边", "ruffled": "褶边", "pleated": "百褶", "laced": "系带的", "lace": "蕾丝",
  "striped": "条纹", "printed": "印花", "patterned": "花纹", "plaid": "格子", "checkered": "棋盘格",
  "transparent": "透明", "translucent": "半透明", "sheer": "薄纱/透视", "see-through": "透视", "wet": "湿漉漉的",
  "shiny": "闪亮", "glowing": "发光", "metallic": "金属质感", "leather": "皮革", "latex": "乳胶",
  "silk": "丝绸", "denim": "牛仔", "fur": "毛皮", "velvet": "天鹅绒", "rubber": "橡胶", "woolen": "羊毛",
  "knitted": "针织",

  // Actions & Poses
  "sitting": "坐", "standing": "站", "lying": "躺", "kneeling": "跪", "squatting": "蹲", "running": "奔跑",
  "walking": "行走", "jumping": "跳跃", "flying": "飞翔", "floating": "悬浮", "dancing": "舞蹈",
  "holding": "拿着/抱着", "carrying": "抱着/携带", "touching": "触摸", "reaching": "伸手", "grabbing": "抓",
  "pulling": "拉", "pushing": "推", "pointing": "指向", "showing": "展示", "covering": "遮挡/盖住",
  "opening": "打开", "closing": "关闭", "looking": "看", "peeking": "窥视", "staring": "凝视",
  "gazing": "注视", "watching": "观看", "view": "视角/视图", "angle": "角度", "shot": "镜头",
  "from_side": "侧面", "from_behind": "背面", "from_above": "俯视", "from_below": "仰视", "close-up": "特写",
  "portrait": "肖像", "full_body": "全身", "upper_body": "半身/上半身", "lower_body": "下半身", "head_portrait": "头像",
  "sitting_on": "坐在...上", "standing_on": "站在...上", "lying_on": "躺在...上", "kneeling_on": "跪在...上",
  "looking_at": "看着", "looking_away": "视线避开", "looking_back": "回头看", "looking_up": "抬头看",
  "looking_down": "低头看", "viewer": "观众/镜头", "each_other": "彼此/互相", "selfie": "自拍",
  "adjusting": "调整/整理", "tying": "系/扎", "brushing": "刷/梳理", "washing": "洗", "cleaning": "清洁",
  "eating": "吃", "drinking": "喝", "kissing": "接吻", "biting": "咬", "licking": "舔",
  "smiling": "微笑", "laughing": "大笑", "crying": "哭泣", "screaming": "尖叫", "yawning": "打哈欠",
  "blushing": "脸红", "pouting": "撇嘴", "frowning": "皱眉", "wink": "眨眼/眨眼示意", "winking": "眨眼",
  "sleeping": "睡觉", "resting": "休息", "stretching": "伸展", "bending": "弯腰", "leaning": "倚靠",

  // Environment & Props
  "background": "背景", "indoor": "室内", "indoors": "室内", "outdoor": "室外", "outdoors": "室外",
  "sky": "天空", "cloud": "云", "clouds": "云朵", "sun": "太阳", "moon": "月亮", "star": "星星",
  "stars": "繁星", "night": "夜晚", "day": "白天", "morning": "早晨", "evening": "傍晚",
  "sunset": "落日/日落", "sunrise": "日出", "light": "光/光线", "shadow": "阴影", "shadows": "阴影",
  "water": "水", "sea": "海洋", "ocean": "海洋", "beach": "沙滩", "sand": "沙子", "river": "河流",
  "lake": "湖泊", "pool": "泳池", "forest": "森林", "wood": "木/树林", "woods": "树林", "tree": "树",
  "trees": "树木", "flower": "花", "flowers": "花朵", "grass": "草", "grassland": "草地",
  "mountain": "山", "mountains": "群山", "rock": "岩石", "rocks": "岩石", "stone": "石头",
  "nature": "自然", "field": "原野/田野", "garden": "花园", "park": "公园", "city": "城市",
  "street": "街道", "road": "道路", "building": "建筑物", "house": "房子", "room": "房间",
  "bedroom": "卧室", "classroom": "教室", "bathroom": "浴室", "kitchen": "厨房", "office": "办公室",
  "bar": "酒吧", "cafe": "咖啡馆", "shop": "商店", "station": "车站", "bridge": "桥梁",
  "chair": "椅子", "table": "桌子", "desk": "书桌", "bed": "床", "sofa": "沙发", "window": "窗户",
  "door": "门", "wall": "墙壁", "floor": "地板", "curtain": "窗帘", "mirror": "镜子",
  "book": "书", "phone": "手机", "camera": "相机", "cup": "杯子", "glass": "玻璃杯",
  "sword": "剑", "weapon": "武器", "gun": "枪", "shield": "盾牌", "magic": "魔法",

  // Qualifiers & Quantifiers
  "one": "一个", "two": "两个", "three": "三个", "multiple": "多个", "single": "单个",
  "double": "双/两个", "triple": "三个", "many": "许多", "few": "少量", "several": "几个",
  "very": "非常", "extremely": "极其", "highly": "高度", "slightly": "稍微", "almost": "几乎",
  "completely": "完全", "partially": "部分", "long": "长", "short": "短", "tall": "高",
  "big": "大", "large": "大", "huge": "巨大", "giant": "巨型", "small": "小",
  "tiny": "极小", "little": "小", "thick": "粗/厚", "thin": "细/薄", "wide": "宽",
  "narrow": "窄", "heavy": "重", "lightweight": "轻量", "soft": "软", "hard": "硬",
  "smooth": "光滑", "rough": "粗糙", "clean": "干净", "dirty": "脏", "neat": "整洁",
  "messy": "凌乱", "beautiful": "美丽", "pretty": "漂亮", "cute": "可爱", "handsome": "英俊",
  "ugly": "丑陋", "old": "老", "young": "年轻", "new": "新", "ancient": "古代",
  "modern": "现代", "future": "未来", "sci-fi": "科幻", "fantasy": "奇幻", "realistic": "写实",

  // Metas & Others
  "score": "评分", "rating": "评级", "safe": "安全/全年龄", "sensitive": "敏感/微存",
  "nsfw": "限制级/R18", "explicit": "露骨/R18G", "questionable": "可疑/R15",
  "source": "来源", "anime": "动漫", "game": "游戏", "comic": "漫画", "novel": "小说",
  "original": "原创", "commission": "约稿", "official": "官方", "fanart": "同人",
  "parody": "二创", "crossover": "跨界联名", "monochrome": "单色/黑白", "grayscale": "灰度",
  "sketch": "草图/手稿", "lineart": "线稿", "color": "彩色", "colored": "上色的",
  "digital": "数码绘", "traditional": "手绘/传统", "watercolor": "水彩", "oil_painting": "油画",
  "acrylic": "丙烯", "ink": "墨水", "pencil": "铅笔", "marker": "马克笔", "pastel": "粉彩"
};

function parseTag(rawTag) {
  let clean = rawTag.trim();
  const match = clean.match(/^\(+(.+?):([0-9.]+)\)+$/);
  if (match) {
    clean = match[1].trim();
  } else {
    const parenMatch = clean.match(/^\(+(.+?)\)+$/);
    if (parenMatch) {
      clean = parenMatch[1].trim();
    }
  }
  return clean.toLowerCase();
}

function downloadTranslationFile(url, dest) {
  return new Promise((resolve) => {
    console.log(`Downloading translation dictionary from ${url}...`);
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        console.warn(`Failed to download: Status Code ${response.statusCode}. Will run without downloading.`);
        resolve(false);
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Successfully downloaded translation dictionary to ${dest}`);
        resolve(true);
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      console.warn(`Download connection error: ${err.message}. Will run offline.`);
      resolve(false);
    });
  });
}

async function buildTags() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      console.error(`Directory ${DATA_DIR} does not exist.`);
      process.exit(1);
    }

    // 1. Download translation CSV if not exists
    if (!fs.existsSync(CSV_FILE)) {
      const parentDir = path.dirname(CSV_FILE);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      await downloadTranslationFile(TRANSLATION_URL, CSV_FILE);
    }

    // 2. Load translations from CSV
    const staticMap = {};
    if (fs.existsSync(CSV_FILE)) {
      try {
        const content = fs.readFileSync(CSV_FILE, 'utf-8');
        const lines = content.split(/\r?\n/);
        for (let line of lines) {
          line = line.trim();
          if (!line) continue;
          const commaIndex = line.indexOf(',');
          if (commaIndex === -1) continue;
          const en = line.substring(0, commaIndex).trim().toLowerCase();
          let zh = line.substring(commaIndex + 1).trim();
          if (zh.startsWith('"') && zh.endsWith('"')) {
            zh = zh.substring(1, zh.length - 1);
          }
          staticMap[en] = zh;
        }
        console.log(`Loaded ${Object.keys(staticMap).length} static translation mappings.`);
      } catch (err) {
        console.error('Error reading translation CSV:', err);
      }
    }

    // Translation function
    const translateTag = (rawTag) => {
      const clean = parseTag(rawTag);
      
      // 1. Direct match in static map
      if (staticMap[clean]) {
        return staticMap[clean];
      }
      
      // 2. Try word-by-word translate if contains underscores
      if (clean.includes('_')) {
        const words = clean.split('_');
        const translatedWords = words.map(w => {
          if (vocab[w]) return vocab[w];
          if (/^[0-9]+$/.test(w)) return w;
          return null;
        });
        
        // If all words are translated, combine them!
        if (translatedWords.every(tw => tw !== null)) {
          if (words.includes('sitting') && words.includes('on')) {
            const index = words.indexOf('on');
            const target = translatedWords.slice(index + 1).join('');
            return `坐在${target}上`;
          }
          if (words.includes('standing') && words.includes('on')) {
            const index = words.indexOf('on');
            const target = translatedWords.slice(index + 1).join('');
            return `站在${target}上`;
          }
          if (words.includes('looking') && words.includes('at')) {
            const index = words.indexOf('at');
            const target = translatedWords.slice(index + 1).join('');
            return `看着${target}`;
          }
          if (words.includes('holding') && words.includes('a')) {
            const index = words.indexOf('a');
            const target = translatedWords.slice(index + 1).join('');
            return `拿着一个${target}`;
          }
          if (words.includes('holding')) {
            const index = words.indexOf('holding');
            const target = translatedWords.slice(index + 1).join('');
            return `拿着${target}`;
          }
          
          let result = translatedWords.join('');
          result = result.replace(/色发$/, '发');
          result = result.replace(/色眼$/, '眼');
          result = result.replace(/色皮肤$/, '色肤色');
          result = result.replace(/色肤色$/, '色皮肤');
          return result;
        }
      }
      return null;
    };

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
            const clean = parseTag(line);
            const zh = translateTag(line);
            
            // If we have a translation that is different from the english text
            if (zh && zh.toLowerCase() !== clean) {
              tags.push([line, zh]);
            } else {
              tags.push(line);
            }
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
