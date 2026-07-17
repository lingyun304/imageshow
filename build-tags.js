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

// Vocabulary for word-by-word splitting and fallback translation
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
  "penis": "阴茎", "ass": "屁股", "butt": "臀部", "buttocks": "屁股", "stomach": "小腹/肚子",

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
  "knitted": "针织", "swimwear": "泳衣", "choker": "颈圈", "bowtie": "蝴蝶结领结", "sash": "腰带/饰带",
  "robe": "长袍/睡袍", "jumpsuit": "连体裤", "camisole": "吊带背心", "capelet": "小披肩", "shawl": "披肩",
  "tank": "背心/吊带", "cuffs": "袖口/手铐", "unworn": "未穿戴的/脱下的", "footwear": "鞋类/鞋子",

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
  "pose": "姿势", "lift": "提起/举起",

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
  "prop": "道具", "object": "物品", "ornament": "饰品/装饰", "jewellery": "珠宝/首饰",
  "photography": "摄影", "chain": "链条/链子", "wrist": "手腕",

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
  "acrylic": "丙烯", "ink": "墨水", "pencil": "铅笔", "marker": "马克笔", "pastel": "粉彩",

  // Themes Category Base Words
  "abstract": "抽象", "adventure": "冒险", "alien": "外星人", "ancient": "古代", "apocalyptic": "末日",
  "aquatic": "水生/水下", "arabian": "阿拉伯", "art_deco": "装饰艺术", "asian": "亚洲", "astral": "星界/星空",
  "autumn": "秋天", "aviation": "航空", "cyberpunk": "赛博朋克", "steampunk": "蒸汽朋克", "gothic": "哥特",
  "medieval": "中世纪", "military": "军事", "space": "太空", "vintage": "复古", "retro": "怀旧",
  "theme": "主题", "style": "风格", "cosplay": "角色扮演",
  "apocalypse": "末日", "nouveau": "新", "decor": "装饰", "deco": "装饰", "astronaut": "宇航员",
  "baroque": "巴洛克", "birthday": "生日", "botanical": "植物", "cartoon": "卡通", "casual": "休闲",
  "celestial": "天空/神圣", "celtic": "凯尔特", "classic": "经典", "cinematic": "电影级", "dark": "黑暗",
  "dreamy": "梦幻", "elegant": "优雅", "enchanted": "迷人/魔法", "ethereal": "空灵", "fantasy": "幻想/奇幻",
  "futuristic": "未来感", "garden": "花园", "girly": "少女", "halloween": "万圣节",
  "historical": "历史", "holiday": "节日", "horror": "恐怖", "humorous": "幽默", "industrial": "工业",
  "luxury": "奢华", "magical": "魔法", "modern": "现代", "monochromatic": "单色",
  "mystical": "神秘", "nature": "自然", "neon": "霓虹", "nostalgic": "怀旧", "ocean": "海洋",
  "outer": "外", "pastel": "粉彩/柔和", "pirate": "海盗", "playful": "俏皮/顽皮",
  "rustic": "乡村/质朴", "sci-fi": "科幻", "seasonal": "季节性", "surreal": "超现实", "techno": "高科技",
  "tropical": "热带", "western": "西方", "whimsical": "怪诞/奇幻", "winter": "冬季",

  // Emotions & Expressions Base Words
  "happy": "开心", "sad": "伤心", "angry": "生气", "surprised": "惊讶", "scared": "害怕",
  "excited": "兴奋", "bored": "无聊", "tired": "疲倦", "confused": "困惑", "proud": "自豪",
  "shy": "害羞", "disgusted": "厌恶", "jealous": "嫉妒", "guilty": "内疚", "anxious": "焦虑",
  "calm": "冷静", "serious": "严肃", "determined": "坚定", "thoughtful": "深思", "curious": "好奇",
  "hopeful": "希望", "apathetic": "冷漠", "relieved": "宽慰", "disappointed": "失望", "lonely": "孤独",
  "loved": "被爱", "silly": "滑稽", "nervous": "紧张", "sleepy": "困倦", "shocked": "震惊",
  "frightened": "惊吓", "grateful": "感激",


  // Animals Category Base Words
  "aardvark": "土豚", "abominable_snowman": "雪人", "alligator": "短吻鳄", "angel": "天使", "ant": "蚂蚁",
  "albatross": "信天翁", "alpaca": "羊驼", "ape": "大猩猩/类人猿", "armadillo": "犰狳", "baboon": "狒狒",
  "badger": "獾", "bat": "蝙蝠", "bear": "熊", "bee": "蜜蜂", "beetle": "甲虫", "bird": "鸟",
  "bison": "野牛", "boar": "野猪", "buffalo": "水牛", "butterfly": "蝴蝶", "camel": "骆驼",
  "cat": "猫", "centaur": "半人马", "chameleon": "避役/变色龙", "cheetah": "猎豹", "chicken": "鸡",
  "chimpanzee": "黑猩猩", "cobra": "眼镜蛇", "cockroach": "蟑螂", "cow": "奶牛", "coyote": "郊狼",
  "crab": "螃蟹", "crane": "鹤", "crocodile": "鳄鱼", "crow": "乌鸦", "deer": "鹿", "demon": "恶魔",
  "dinosaur": "恐龙", "dog": "狗", "dolphin": "海豚", "donkey": "驴", "dragon": "龙", "duck": "鸭子",
  "eagle": "鹰", "elephant": "大象", "elk": "驼鹿", "falcon": "隼/鹰", "ferret": "雪貂", "fish": "鱼",
  "flamingo": "火烈鸟", "fly": "苍蝇", "fox": "狐狸", "frog": "青蛙", "giraffe": "长颈鹿", "goat": "山羊",
  "goose": "鹅", "gorilla": "大猩猩", "grasshopper": "蚱蜢", "grizzly_bear": "灰熊", "hamster": "仓鼠",
  "hare": "野兔", "hawk": "鹰/隼", "hedgehog": "刺猬", "hippopotamus": "河马", "horse": "马",
  "hyena": "鬣狗", "jaguar": "美洲豹", "kangaroo": "袋鼠", "koala": "考拉", "leopard": "豹",
  "lion": "狮子", "lizard": "蜥蜴", "llama": "大羊驼", "lobster": "龙虾", "monkey": "猴子",
  "moose": "驼鹿", "mosquito": "蚊子", "moth": "蛾", "mouse": "老鼠", "mule": "骡子", "octopus": "章鱼",
  "ostrich": "鸵鸟", "owl": "猫头鹰", "panda": "熊猫", "panther": "黑豹", "parrot": "鹦鹉",
  "peacock": "孔雀", "pelican": "鹈鹕", "penguins": "企鹅", "penguin": "企鹅", "pig": "猪", "pigeon": "鸽子",
  "platypus": "鸭嘴兽", "rabbit": "兔子", "raccoon": "浣熊", "rat": "大鼠", "raven": "渡鸦",
  "reindeer": "驯鹿", "rhinoceros": "犀牛", "salamander": "蝾螈", "salmon": "鲑鱼/三文鱼", "seagull": "海鸥",
  "seahorse": "海马", "seal": "海豹", "shark": "鲨鱼", "sheep": "绵羊", "snake": "蛇", "spider": "蜘蛛",
  "squid": "鱿鱼", "squirrel": "松鼠", "swan": "天鹅", "tiger": "老虎", "toad": "蟾蜍", "turkey": "火鸡",
  "turtle": "乌龟", "walrus": "海象", "wasp": "黄蜂", "weasel": "鼬/黄鼠狼", "whale": "鲸鱼", "wolf": "狼",
  "yak": "牦牛", "zebra": "斑马", "creature": "生物", "bug": "昆虫", "insect": "昆虫",

  // Fabrics Category Base Words
  "acetate": "醋酸纤维", "alpaca_wool": "羊驼毛", "angora_wool": "安哥拉兔毛", "bamboo": "竹纤维",
  "cashmere_wool": "山羊绒", "chiffon": "雪纺", "cotton": "棉布", "denim": "牛仔布", "flannel": "法兰绒",
  "lace": "蕾丝", "leather": "皮革", "linen": "亚麻", "nylon": "尼龙", "polyester": "聚酯纤维/涤纶",
  "satin": "缎面", "silk": "丝绸", "velvet": "天鹅绒", "wool": "羊毛", "canvas": "帆布", "corduroy": "灯芯绒",
  "fleece": "抓绒", "jersey": "平针织物", "spandex": "氨纶", "tweed": "粗花呢", "viscose": "粘胶纤维",
  "fabric": "面料/材质",

  // Perspectives
  "first_person": "第一人称", "second_person": "第二人称", "third_person": "第三人称", "limited": "有限",
  "omniscient": "全知", "bird_eye": "鸟瞰", "worm_eye": "虫眼/仰视", "fish_eye": "鱼眼", "panoramic": "全景",
  "close_up": "特写", "wide_angle": "广角", "macro": "微距", "split_screen": "分屏", "isometric": "等距",
  "orthographic": "正交", "three_quarter": "三分之三/侧面", "profile": "侧面", "front": "正面",
  "back_perspective": "背面", "side": "侧面", "perspective": "视角",

  // Body Types
  "ectomorph": "外胚型", "mesomorph": "中胚型", "endomorph": "内胚型", "hourglass": "沙漏型",
  "pear": "梨型", "apple": "苹果型", "rectangle": "矩形", "inverted_triangle": "倒三角型",
  "athletic": "运动型", "muscular": "肌肉型", "slim": "苗条", "slender": "纤细", "petite": "娇小",
  "tall_body_type": "高挑型", "short_body_type": "矮小型", "chubby": "丰满/圆润", "plump": "丰满",
  "curvy": "凹凸有致", "lean": "精瘦", "fit": "健美", "body_type": "体型",

  // Seasons
  "spring": "春", "summer": "夏", "autumn": "秋", "winter": "冬", "early_spring": "早春",
  "late_spring": "晚春", "early_summer": "初夏", "late_summer": "晚夏", "early_autumn": "初秋",
  "late_autumn": "深秋", "early_winter": "初冬", "late_winter": "深冬", "dry_season": "干燥季节",
  "wet_season": "潮湿季节", "monsoon_season": "雨季", "season": "季节",

  // Tattoos base words
  "traditional": "传统", "american": "美式", "neo": "新", "japanese": "日式", "irezumi": "入墨",
  "horimono": "雕物", "tebori": "手雕", "hannya": "般若", "koi": "锦鲤", "cherry": "樱桃",
  "blossom": "樱花", "sakura": "樱花", "geisha": "艺伎", "lotus": "莲花", "chrysanthemum": "菊花",
  "peony": "牡丹", "skull": "骷髅", "maori": "毛利", "polynesian": "波利尼西亚", "samoan": "萨摩亚",
  "mandala": "曼荼罗", "geometric": "几何", "blackwork": "黑灰", "dotwork": "点刺", "script": "文字",
  "lettering": "刻字", "quote": "引用", "trash": "垃圾/废土", "polka": "波尔卡", "realism": "写实",
  "surrealism": "超现实", "biomechanical": "生物机械", "anchor": "锚", "feather": "羽毛", "arrow": "箭",
  "dreamcatcher": "捕梦网", "life": "生命", "astrological": "占星", "constellation": "星座",
  "nebula": "星云", "universe": "宇宙", "cosmic": "宇宙", "ufo": "飞碟", "rocket": "火箭",
  "earth": "地球", "jupiter": "木星", "saturn": "土星", "tattoo": "纹身",

  // Lighting base words
  "ambient": "环境", "diffused": "漫反射/弥散", "sharp": "锐利", "streaks": "光条", "dynamic": "动态",
  "lights": "光", "cinematic": "电影级", "luminous": "明亮/发光", "intricate": "复杂/精致",
  "dramatic": "戏剧性", "gentle": "温柔/柔和", "radiance": "光辉", "candlelit": "烛光", "ambiance": "氛围",
  "cool": "冷", "moonlit": "月光", "lighting": "光照", "glow": "发光", "hue": "色调",

  // Quality base words
  "details": "细节", "many": "许多", "extreme": "极致", "detailed": "细节", "full": "充满",
  "of": "的", "range": "范围", "colors": "颜色", "insane": "疯狂", "quality": "质量",
  "resolution": "分辨率", "photorealistic": "照片级真实", "absurdres": "极高分辨率", "8k": "8K",
  "photograph": "照片", "32k": "32K", "raw": "原始/无修", "photo": "照片", "toned": "健美",
  "masterpiece": "杰作",

  // Body Types extra base words
  "inverted": "倒", "triangle": "三角", "ruler": "直尺", "curves": "曲线", "plus": "大",
  "size": "码", "plus-size": "丰满", "skinny": "纤瘦", "lollipop": "棒棒糖", "bell": "铃铛",
  "strawberry": "草莓", "oval": "椭圆", "diamond": "钻石", "shaped": "型", "heart-shaped": "心型",
  "trapezoid": "梯形", "cone": "圆锥", "figure": "身材", "eight": "八", "figure-eight": "八字",

  // Perspectives extra base words
  "first": "第一", "second": "第二", "third": "第三", "person": "人称", "objective": "客观",
  "subjective": "主观", "close": "近景", "distant": "远景", "bird": "鸟", "overhead": "顶视",
  "ground": "地面", "level": "高度/平视", "eye-level": "平视", "angle": "角度", "worm": "虫",
  "panoramic": "全景", "wide": "广", "macro": "微距", "split": "分", "screen": "屏",
  "isometric": "等距", "orthographic": "正交", "three-quarter": "四分之三", "profile": "侧面",
  "worms_eye": "仰视", "birds_eye": "俯视",

  // Age base words
  "child": "儿童", "teenager": "青少年", "adult": "成年", "elderly": "老年", "senior": "长者",
  "baby": "婴儿", "toddler": "幼童", "infant": "婴儿", "middle-aged": "中年",

  // Fabric extra words
  "faux": "人造", "floral": "碎花", "gabardine": "华达呢", "georgette": "乔其纱", "jacquard": "提花",
  "mesh": "网眼", "microfiber": "超细纤维", "mohair": "马海毛",

  // Season extra words
  "early": "初", "late": "深",

  // Weather extra words
  "weather": "天气", "sultry": "闷热", "hypothermia": "失温", "hyperthermia": "高温", "risk": "风险",
  "rime": "雾凇", "ice": "冰", "lake": "湖泊", "effect": "效应", "snow": "雪", "polar": "极地",
  "vortex": "涡旋", "flash": "山洪/突发", "flood": "洪水", "rip": "裂/裂流", "current": "流/水流",
  "high": "高", "low": "低", "tide": "潮/潮汐", "tsunami": "海啸", "wave": "波浪",

  // Nationalities
  "african": "非洲", "american": "美国", "albanian": "阿尔巴尼亚", "algerian": "阿尔及利亚",
  "andorran": "安道尔", "angolan": "安格拉", "argentinian": "阿根廷", "armenian": "亚美尼亚",
  "australian": "澳大利亚", "austrian": "奥地利", "azerbaijani": "阿塞拜疆", "bahamian": "巴哈马",
  "bangladeshi": "孟加拉国", "barbadian": "巴巴多斯", "belgian": "比利时", "belizian": "伯利兹",
  "beninese": "贝宁", "bhutanese": "不丹", "bolivian": "玻利维亚", "bosnian": "波斯尼亚",
  "brazilian": "巴西", "british": "英国", "bulgarian": "保加利亚", "cambodian": "柬埔寨",
  "canadian": "加拿大", "chilean": "智利", "chinese": "中国", "colombian": "哥伦比亚",
  "croatian": "克罗地亚", "cuban": "古巴", "cypriot": "塞浦路斯", "czech": "捷克", "danish": "丹麦",
  "egyptian": "埃及", "english": "英国", "estonian": "爱沙尼亚", "ethiopian": "埃塞俄比亚",
  "filipino": "菲律宾", "finnish": "芬兰", "french": "法国", "georgian": "格鲁吉亚", "german": "德国",
  "greek": "希腊", "hungarian": "匈牙利", "icelandic": "冰岛", "indian": "印度", "indonesian": "印度尼西亚",
  "iranian": "伊朗", "iraqi": "伊拉克", "irish": "爱尔兰", "israeli": "以色列", "italian": "意大利",
  "jamaican": "烟台", "japanese": "日本", "jordanian": "约旦", "kazakh": "哈萨克斯坦", "kenyan": "肯尼亚",
  "korean": "韩国", "kuwaiti": "科威特", "latvian": "拉脱维亚", "lebanese": "黎巴嫩", "libyan": "利比亚",
  "lithuanian": "立陶宛", "luxembourger": "卢森堡", "macedonian": "马其顿", "malagasy": "马达加斯加",
  "malaysian": "马来西亚", "maltese": "马耳他", "mexican": "墨西哥", "mongolian": "蒙古",
  "moroccan": "摩洛哥", "nepalese": "尼泊尔", "dutch": "荷兰", "new_zealander": "新西兰",
  "nigerian": "尼日利亚", "norwegian": "挪威", "pakistani": "巴基斯坦", "palestinian": "巴勒斯坦",
  "peruvian": "秘鲁", "polish": "波兰", "portuguese": "葡萄牙", "romanian": "罗马尼亚",
  "russian": "俄罗斯", "saudi": "沙特", "scottish": "苏格兰", "singaporean": "新加坡",
  "slovak": "斯洛伐克", "slovenian": "斯洛文尼亚", "somali": "索马里", "spanish": "西班牙",
  "sudanese": "苏丹", "swedish": "瑞典", "swiss": "瑞士", "syrian": "叙利亚", "taiwanese": "中国台湾",
  "thai": "泰国", "tunisian": "突尼斯", "turkish": "土耳其", "ukrainian": "乌克兰", "uruguayan": "乌拉圭",
  "venezuelan": "委内瑞拉", "vietnamese": "越南", "welsh": "威尔士", "yemeni": "也门",
  "zambian": "赞比亚", "zimbabwean": "津巴布韦"
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
  // Replace commas and other punctuation with spaces to avoid joining words incorrectly
  return clean.toLowerCase().replace(/[,;]+/g, ' ').replace(/\s+/g, '_');
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

    // Helper to format string into Title Case (Capitalize words, preserve parenthesized tags)
    const formatTitleCase = (str) => {
      if (!str) return '';
      return str
        .split('_')
        .map(word => {
          if (word.startsWith('(') && word.endsWith(')')) {
            const inner = word.substring(1, word.length - 1);
            return '(' + inner.charAt(0).toUpperCase() + inner.slice(1) + ')';
          }
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
    };

    const popularTranslations = {
      // Artists
      "kantoku": "监督",
      "wlop": "WLOP",
      "mika_pikazo": "Mika Pikazo",
      "ixy": "Ixy",
      "shinkai_makoto": "新海诚",
      "miyazaki_hayao": "宫崎骏",
      "tony_taka": "Tony Taka",
      "fuzichoco": "藤原",
      "ask": "Ask",
      "artgerm": "Artgerm",
      "alphonse_mucha": "阿尔丰斯·慕夏",
      "greg_rutkowski": "格雷格·鲁特科夫斯基",
      "claude_monet": "克劳德·莫奈",
      "vincent_van_gogh": "文森特·梵高",
      "picasso": "毕加索",
      "leonardo_da_vinci": "列奥纳多·达·芬奇",
      "hokusai": "葛饰北斋",

      // Copyrights (IPs)
      "genshin_impact": "原神",
      "arknights": "明日方舟",
      "azur_lane": "碧蓝航线",
      "fate_grand_order": "命运-冠位指定 (FGO)",
      "fate_stay_night": "命运守护夜 (FSN)",
      "league_of_legends": "英雄联盟 (LOL)",
      "honkai_star_rail": "崩坏：星穹铁道",
      "honkai_impact_3rd": "崩坏3",
      "blue_archive": "蓝色档案",
      "neon_genesis_evangelion": "新世纪福音战士 (EVA)",
      "sailor_moon": "美少女战士",
      "pokemon": "宝可梦",
      "cardcaptor_sakura": "魔卡少女樱",
      "vocaloid": "Vocaloid",
      "touhou_project": "东方Project",
      "chainsaw_man": "电锯人",
      "demons_layer": "鬼灭之刃",
      "jujutsu_kaisen": "咒术回战",
      "my_hero_academia": "我的英雄学院",
      "one_piece": "航海王/海贼王",
      "naruto": "火影忍者",
      "dragon_ball": "龙珠",
      "bleach": "死神",
      "attack_on_titan": "进击的巨人",
      "cyberpunk_edgerunners": "赛博朋克：边缘跑手",
      "k-on!": "轻音少女",
      "monogatari_series": "物语系列"
    };

    // Helper to extract short, clean translation from vocab or static map
    const getShortTranslation = (word) => {
      if (!word) return null;
      // Strip possessives and non-alphanumeric chars
      const cleanW = word.replace(/'s$/, '').replace(/[^a-z0-9-]/gi, '').toLowerCase();
      if (!cleanW) return null;
      
      if (vocab[cleanW]) return vocab[cleanW];
      if (staticMap[cleanW]) {
        const first = staticMap[cleanW].split(/[，,、/;；]/)[0].trim();
        return first.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').trim();
      }
      return null;
    };

    // Advanced translation engine combining static, rules, and splits
    const translateTag = (rawTag, category = '') => {
      const clean = parseTag(rawTag);

      // Special handling for Artist and Copyright
      if (category === 'Artist' || category === 'Copyright') {
        if (popularTranslations[clean]) {
          return `${popularTranslations[clean]} (${formatTitleCase(clean)})`;
        }
        if (staticMap[clean]) {
          return `${staticMap[clean]} (${formatTitleCase(clean)})`;
        }
        return formatTitleCase(clean);
      }
      
      // 1. Direct match in static map
      if (staticMap[clean]) {
        return staticMap[clean];
      }
      
      // 2. Age Rule (e.g. 12_years_old -> 12岁)
      if (/^(\d+)_years?_old$/.test(clean)) {
        return clean.replace(/^(\d+)_years?_old$/, "$1岁");
      }

      // 3. Suffix Rules for specific categories
      const suffixes = [
        { suffix: '_theme', zhSuffix: '主题' },
        { suffix: '_animal', zhSuffix: '动物' },
        { suffix: '_creature', zhSuffix: '生物' },
        { suffix: '_object', zhSuffix: '物品' },
        { suffix: '_prop', zhSuffix: '道具' },
        { suffix: '_bug_insect', zhSuffix: '昆虫' },
        { suffix: '_emotion', zhSuffix: '情绪' },
        { suffix: '_environment', zhSuffix: '环境' },
        { suffix: '_wool_fabric', zhSuffix: '羊毛面料' },
        { suffix: '_fabric', zhSuffix: '面料' },
        { suffix: '_weather', zhSuffix: '天气' },
        { suffix: '_perspective', zhSuffix: '视角' },
        { suffix: '_body_type', zhSuffix: '体型' },
        { suffix: '_season', zhSuffix: '季节' },
        { suffix: '_lighting', zhSuffix: '光照' },
        { suffix: '_tattoo', zhSuffix: '纹身' },
        { suffix: '_style', zhSuffix: '风格' },
        { suffix: '_art', zhSuffix: '艺术' },
        { suffix: '_design', zhSuffix: '设计' },
        { suffix: '_designs', zhSuffix: '设计' }
      ];

      for (const { suffix, zhSuffix } of suffixes) {
        if (clean.endsWith(suffix)) {
          const base = clean.substring(0, clean.length - suffix.length);
          const baseWords = base.split('_').filter(w => w.length > 0);
          const translatedBaseWords = baseWords.map(w => getShortTranslation(w));
          if (translatedBaseWords.every(w => w !== null)) {
            return translatedBaseWords.join('') + zhSuffix;
          }
        }
      }
      
      // 4. Try word-by-word translate if contains underscores
      if (clean.includes('_')) {
        const words = clean.split('_').filter(w => w.length > 0);
        const hasPattern = (words.includes('sitting') && words.includes('on')) ||
                           (words.includes('standing') && words.includes('on')) ||
                           (words.includes('looking') && words.includes('at')) ||
                           (words.includes('holding') && words.includes('a')) ||
                           words.includes('holding');

        const translatedWords = words.map(w => {
          const t = getShortTranslation(w);
          if (t) return t;
          if (/^[0-9]+$/.test(w)) return w;
          return null;
        });

        if (hasPattern && translatedWords.every(tw => tw !== null)) {
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
        }

        // Fallback: translate only the recognized words, keep unrecognized ones in English, format with spaces
        const translatedCount = translatedWords.filter(tw => tw !== null).length;
        if (translatedCount > 0) {
          const mixedWords = words.map((w, idx) => {
            if (translatedWords[idx] !== null) {
              return translatedWords[idx];
            }
            return w;
          });
          
          let result = '';
          for (let i = 0; i < mixedWords.length; i++) {
            const current = mixedWords[i];
            const isChinese = /[\u4e00-\u9fa5]/.test(current);
            if (i > 0) {
              const prev = mixedWords[i - 1];
              const prevIsChinese = /[\u4e00-\u9fa5]/.test(prev);
              if (!prevIsChinese || !isChinese) {
                result += ' ' + current;
              } else {
                result += current;
              }
            } else {
              result += current;
            }
          }
          
          result = result.trim();
          result = result.replace(/色发$/, '发');
          result = result.replace(/色眼$/, '眼');
          result = result.replace(/色皮肤$/, '色皮肤');
          result = result.replace(/色肤色$/, '色皮肤');
          return result;
        }
      }

      // 5. If it's a single word and we have a vocab translation, use it!
      const singleTrans = getShortTranslation(clean);
      if (singleTrans) {
        return singleTrans;
      }

      return null;
    };

    const files = fs.readdirSync(DATA_DIR);
    const result = {};

    for (const file of files) {
      const filePath = path.join(DATA_DIR, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile()) {
        const categoryName = file;
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
            const zh = translateTag(line, categoryName);
            
            // If we have a translation that is different from the english text
            if (zh && zh.toLowerCase() !== clean) {
              tags.push([line, zh]);
            } else {
              tags.push(line);
            }
          }
        }

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
