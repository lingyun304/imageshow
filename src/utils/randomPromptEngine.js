import { parseTag } from './tagParser';

export function generateRandomPrompts({
  styleKey,
  tagDatabase,
  genRating,
  setGenModel,
  setGenRating,
  setSelectedTags,
  setActiveRandomStyle,
  showToast
}) {
  if (!tagDatabase) {
    showToast('标签库尚未加载完成，请稍后再试！', 'warning');
    return;
  }
  setActiveRandomStyle(styleKey);

  const styles = {
    anime: {
      model: 'pony',
      keywords: {
        Themes: ['anime', 'manga', 'illustration', 'comic', '二次元', '动漫', '插画'],
        Backgrounds: ['classroom', 'school', 'sky', 'cloud', 'cherry blossom', 'street', 'room', '教室', '学校', '天空', '云', '樱花', '街道', '房间'],
        Environment_Setting: ['classroom', 'school', 'sky', 'cloud', 'cherry blossom', 'street', 'room', '教室', '学校', '天空', '云', '樱花', '街道', '房间'],
        clothes: ['school uniform', 'sailor', 'skirt', 'dress', 'cardigan', '制服', '水手服', '裙', '毛衣']
      }
    },
    realistic: {
      model: 'illustrious',
      keywords: {
        Themes: ['photorealistic', 'realistic', 'portrait', 'photography', 'photo', '写实', '写真', '肖像', '摄影'],
        Backgrounds: ['city', 'street', 'cafe', 'park', 'room', 'interior', 'beach', '城市', '街道', '咖啡', '公园', '室内', '房间', '沙滩'],
        Environment_Setting: ['city', 'street', 'cafe', 'park', 'room', 'interior', 'beach', '城市', '街道', '咖啡', '公园', '室内', '房间', '沙滩'],
        clothes: ['casual', 't-shirt', 'jeans', 'sweater', 'jacket', 'dress', '休闲', '恤', '牛仔裤', '针织', '外套', '连衣裙'],
        Lighting: ['soft light', 'studio', 'sunlight', 'bokeh', 'depth of field', '柔光', '工作室', '日光', '背景虚化']
      }
    },
    cyberpunk: {
      model: 'pony',
      keywords: {
        Themes: ['cyberpunk', 'neon', 'futuristic', 'synthwave', '赛博', '霓虹', '未来', '科幻'],
        Backgrounds: ['city', 'street', 'alley', 'night', 'rain', 'skyscraper', '城市', '街道', '后街', '雨', '夜', '摩天大楼'],
        Environment_Setting: ['city', 'street', 'alley', 'night', 'rain', 'skyscraper', '城市', '街道', '后街', '雨', '夜', '摩天大楼'],
        clothes: ['techwear', 'leather', 'visor', 'jacket', 'hoodie', '机能', '皮衣', '面罩', '夹克', '连帽衫'],
        Lighting: ['neon', 'glowing', 'backlight', '霓虹', '发光', '逆光']
      }
    },
    fantasy: {
      model: 'anime',
      keywords: {
        Themes: ['fantasy', 'magic', 'mythical', 'fairy', 'witch', '奇幻', '魔法', '魔幻', '精灵', '女巫'],
        Backgrounds: ['forest', 'ruins', 'castle', 'island', 'cave', 'sky', '森林', '遗迹', '城堡', '岛', '洞穴', '天空'],
        Environment_Setting: ['forest', 'ruins', 'castle', 'island', 'cave', 'sky', '森林', '遗迹', '城堡', '岛', '洞穴', '天空'],
        clothes: ['robe', 'cape', 'cloak', 'dress', 'armor', '长袍', '披风', '斗篷', '连衣裙', '铠甲'],
        Props_Objects: ['staff', 'book', 'wand', 'sword', 'crystal', '法杖', '书', '魔杖', '剑', '水晶']
      }
    },
    chinese: {
      model: 'anime',
      keywords: {
        Themes: ['traditional', 'chinese', 'oriental', 'historical', '国风', '古风', '中国', '武侠'],
        Backgrounds: ['garden', 'bamboo', 'temple', 'bridge', 'pond', 'mountain', '庭院', '竹林', '寺庙', '桥', '池塘', '山'],
        Environment_Setting: ['garden', 'bamboo', 'temple', 'bridge', 'pond', 'mountain', '庭院', '竹林', '寺庙', '桥', '池塘', '山'],
        clothes: ['hanfu', 'cheongsam', 'robe', 'silk', '汉服', '旗袍', '长袍', '丝绸'],
        Props_Objects: ['fan', 'lantern', 'sword', 'umbrella', 'flute', '扇', '灯笼', '剑', '伞', '笛']
      }
    },
    scifi: {
      model: 'illustrious',
      keywords: {
        Themes: ['sci-fi', 'space', 'futuristic', 'mecha', 'alien', '科幻', '太空', '未来', '机甲', '外星'],
        Backgrounds: ['spaceship', 'planet', 'stars', 'station', 'nebula', '飞船', '星球', '星空', '空间站', '星云'],
        Environment_Setting: ['spaceship', 'planet', 'stars', 'station', 'nebula', '飞船', '星球', '星空', '空间站', '星云'],
        clothes: ['spacesuit', 'armor', 'bodysuit', 'suit', '宇航服', '铠甲', '连体衣', '制服']
      }
    },
    pastoral: {
      model: 'anime',
      keywords: {
        Themes: ['cozy', 'pastoral', 'nature', 'cottagecore', 'peaceful', '田园', '自然', '温馨', '宁静'],
        Backgrounds: ['meadow', 'field', 'cottage', 'forest', 'garden', 'grass', '草地', '花田', '小屋', '森林', '花园'],
        Environment_Setting: ['meadow', 'field', 'cottage', 'forest', 'garden', 'grass', '草地', '花田', '小屋', '森林', '花园'],
        clothes: ['sundress', 'hat', 'cardigan', 'apron', '连衣裙', '草帽', '开衫', '围裙'],
        Weather: ['golden hour', 'sunny', 'sunlight', 'warm', '黄金时刻', '晴天', '阳光', '温暖']
      }
    },
    multi: {
      model: 'pony',
      keywords: {
        Themes: ['group', 'multi-person', 'multiple girls', 'multiple boys', 'duo', 'trio', 'harem', 'couple', '聚会', '合照', '多人', '双人', '三人', '情侣'],
        Backgrounds: ['classroom', 'beach', 'cafe', 'park', 'city street', 'festival', 'party', '教室', '沙滩', '咖啡馆', '公园', '街道', '祭典', '聚会'],
        Environment_Setting: ['classroom', 'beach', 'cafe', 'park', 'city street', 'festival', 'party', '教室', '沙滩', '咖啡馆', '公园', '街道', '祭典', '聚会'],
        clothes: ['matching clothes', 'uniform', 'casual wear', 'dress', '制服', '休闲装', '连衣裙']
      }
    },
    bdsm: {
      model: 'pony',
      rating: 'explicit',
      keywords: {
        Themes: ['bdsm', 'bondage', 'shibari', 'kinbaku', 'hemp rope', 'red rope', 'rope marks', 'skindentation', 'restrained', 'tied up', '束缚', '绳艺', '绳捆', '绳痕'],
        Backgrounds: ['dungeon', 'prison cell', 'dark room', 'stone wall', '地牢', '牢房', '暗室', '石墙'],
        Environment_Setting: ['dungeon', 'prison cell', 'dark room', 'stone wall', '地牢', '牢房', '暗室', '石墙'],
        clothes: ['handcuffs', 'ball gag', 'ring gag', 'blindfold', 'chains', 'leash', 'collar', 'harness', 'bit gag', '手铐', '口球', '眼罩', '皮鞭', '项圈', '牵引绳']
      }
    },
    stealth: {
      model: 'pony',
      rating: 'explicit',
      keywords: {
        Themes: ['stealth sex', 'implied sex', 'under table', 'frosted glass', 'head out of frame', 'lower body only', 'pussy juice trail', 'legs trembling', 'cum string', 'view between legs', 'under covers', '隐奸', '暗示', '桌下', '磨砂玻璃', '无脸', '仅下半身', '腿部发抖', '拉丝', '被子下'],
        Backgrounds: ['restaurant', 'office', 'classroom', 'couch', 'living room', 'apartment window', '餐厅', '办公室', '教室', '沙发', '客厅', '公寓窗口'],
        Environment_Setting: ['restaurant', 'office', 'classroom', 'couch', 'living room', 'apartment window', '餐厅', '办公室', '教室', '沙发', '客厅', '公寓窗口'],
        clothes: ['no panties', 'no bra', 'half dressed', 'clothes lift', 'skirt lift', 'undressing', 'see through', 'wet clothes', '没穿内裤', '没穿胸罩', '衣衫不整', '掀起裙子', '掀起衬衫', '透视装', '湿身诱惑']
      }
    },
    lewd: {
      model: 'pony',
      rating: 'explicit',
      keywords: {
        NSFW: ['nude', 'sex', 'cum', 'uncensored', 'ahegao', 'oral', 'anal', 'vaginal', 'paizuri', 'creampie', 'breast', 'buttocks', 'masturbation', 'bondage', 'groping', 'pussy', 'nipples', 'naked'],
        Themes: ['nsfw', 'nude', 'uncensored', 'areola', 'pussy', 'penis', 'naked', '裸', '阿黑颜', 'ahegao'],
        Backgrounds: ['bed', 'room', 'hotel', 'bathroom', 'shower', 'indoors', 'outdoors', '床', '房间', '酒店', '镜子', '浴室', '淋浴', '室内', '室外'],
        Environment_Setting: ['bed', 'room', 'hotel', 'bathroom', 'shower', 'indoors', 'outdoors', '床', '房间', '酒店', '镜子', '浴室', '淋浴', '室内', '室外'],
        clothes: ['no panties', 'no bra', 'panty pull', 'skirt lift', 'skirt-lift', 'shirt lift', 'half dressed', 'undressing', 'see through', 'wet clothes', 'micro bikini', 'sling bikini', 'pasties', 'torn clothes', 'exposed breasts', 'exposed_breasts', 'wardrobe malfunction', '没穿内裤', '没穿胸罩', '拉扯内裤', '掀起裙子', '掀起衬衫', '半脱状态', '正在脱衣服', '透视装', '湿身诱惑', '比基尼', '死库水', '乳贴', '衣服破裂', '胸部外露', '走光']
      }
    }
  };

  let activeStyleKey = styleKey;
  if (activeStyleKey === 'random') {
    const keys = Object.keys(styles);
    const filteredKeys = (genRating === 'nsfw' || genRating === 'explicit')
      ? keys
      : keys.filter(k => k !== 'lewd' && k !== 'bdsm' && k !== 'stealth');
    activeStyleKey = filteredKeys[Math.floor(Math.random() * filteredKeys.length)];
  }

  const styleConfig = styles[activeStyleKey] || styles.anime;
  setGenModel(styleConfig.model);
  if (styleConfig.rating) {
    setGenRating(styleConfig.rating);
  }

  const selectedList = [];

  const expandNudityTags = (list) => {
    const hasNude = list.some(t =>
      t.raw === 'nude' || t.raw === 'naked' || t.raw === 'completely nude' || t.raw === 'fully nude'
    );
    if (!hasNude) return list;

    const has1girl = list.some(t => t.raw === '1girl');
    const has1boy = list.some(t => t.raw === '1boy');
    const has2girls = list.some(t => t.raw === '2girls');
    const has3girls = list.some(t => t.raw === '3girls');
    const hasGroup = list.some(t => t.raw === 'group' || t.raw === 'multi-person' || t.raw === 'harem' || t.raw === 'gangbang');

    let newList = list.filter(t =>
      t.raw !== 'nude' && t.raw !== 'naked' && t.raw !== 'completely nude' && t.raw !== 'fully nude'
    );

    const addTag = (raw, zh, category = 'NSFW') => {
      const { clean, weight } = parseTag(raw);
      if (!newList.some(t => t.raw === raw)) {
        newList.push({ raw, clean, weight, category, zh });
      }
    };

    if (has1girl && has1boy) {
      addTag('naked boy', '赤裸男孩');
      addTag('naked girl', '赤裸女孩');
      addTag('both nude', '两人皆裸');
    } else if (has2girls) {
      addTag('naked girls', '赤裸女孩们');
      addTag('both nude', '两人皆裸');
    } else if (has3girls) {
      addTag('naked girls', '赤裸女孩们');
      addTag('all nude', '全员皆裸');
    } else if (hasGroup) {
      addTag('naked group', '赤裸群组');
      addTag('all nude', '全员皆裸');
    } else if (has1boy) {
      addTag('naked boy', '赤裸男孩');
    } else {
      addTag('naked girl', '赤裸女孩');
    }

    return newList;
  };

  const isMultiCharacter = (activeStyleKey === 'multi') ||
    (['lewd', 'bdsm', 'stealth'].includes(activeStyleKey) && Math.random() < 0.6);

  if (['lewd', 'bdsm', 'stealth'].includes(activeStyleKey)) {
    const adultTags = [];

    const addAdultTag = (raw, zh, category = 'NSFW') => {
      const { clean, weight } = parseTag(raw);
      if (!adultTags.some(t => t.raw === raw)) {
        adultTags.push({ raw, clean, weight, category, zh });
      }
    };

    if (activeStyleKey === 'bdsm') {
      setGenModel('pony');
      setGenRating('explicit');

      if (isMultiCharacter) {
        const bdsmStarters = [
          [['1girl', '一个女孩'], ['1boy', '一个男孩'], ['couple', '情侣/双人'], ['femdom', '女尊'], ['submissive', '顺从']],
          [['2girls', '两个女孩'], ['duo', '双人'], ['shibari', '日式绳艺'], ['bound torso', '捆绑躯干']],
          [['1girl', '一个女孩'], ['1boy', '一个男孩'], ['couple', '情侣/双人'], ['maledom', '男尊'], ['slave', '奴隶']]
        ];
        const choice = bdsmStarters[Math.floor(Math.random() * bdsmStarters.length)];
        choice.forEach(([r, z]) => addAdultTag(r, z, 'General'));
      } else {
        addAdultTag('1girl', '1个女孩', 'General');
        addAdultTag('solo', '单人', 'General');
      }

      const bdsmPosesPool = [
        ['kneeling', '跪姿'],
        ['on all fours', '四肢着地'],
        ['arms behind back', '双手反剪'],
        ['wrists bound', '绑住手腕'],
        ['arms bound', '绑住手臂'],
        ['hogtied', '五花大绑'],
        ['spread eagle', '大字形捆绑'],
        ['suspension', '悬吊'],
        ['bound to chair', '绑在椅子上'],
        ['crawling', '双膝跪地爬行'],
        ['lying on back', '仰躺'],
        ['lying on stomach', '趴着'],
        ['kneeling on one knee', '单膝跪地'],
        ['tied to pole', '绑在柱子上'],
        ['fetal position', '蜷缩姿势']
      ];

      const templates = [
        [
          ['shibari', '日式绳艺'], ['kinbaku', '绳捆'], ['hemp rope', '麻绳'],
          ['bound torso', '捆绑躯干'], ['rope marks', '绳痕'],
          ['skindentation', '勒痕'],
          ['girl face visible', '女孩脸部可见'], ['at least one face visible', '至少有一张脸可见']
        ],
        [
          ['ball gag', '口球'], ['ring gag', '口圈'], ['drooling', '流口水'],
          ['saliva trail', '唾液线'],
          ['tears', '泪水'], ['struggling', '挣扎'], ['choker', '项圈'], ['leash', '牵引绳'],
          ['girl face visible', '女孩脸部可见'], ['at least one face visible', '至少有一张脸可见']
        ],
        [
          ['bound', '被绑'],
          ['handcuffs', '手铐'], ['blindfold', '眼罩'], ['scared', '害怕'],
          ['crying', '哭泣'], ['whip marks', '鞭痕'],
          ['girl face visible', '女孩脸部可见'], ['at least one face visible', '至少有一张脸可见']
        ]
      ];

      const chosenTemplate = templates[Math.floor(Math.random() * templates.length)];
      chosenTemplate.forEach(([r, z]) => addAdultTag(r, z));

      const chosenPose = bdsmPosesPool[Math.floor(Math.random() * bdsmPosesPool.length)];
      addAdultTag(chosenPose[0], chosenPose[1]);

      const bdsmBackgrounds = [
        ['dungeon', '地牢'], ['prison cell', '牢房'], ['dark room', '暗室'], ['stone wall', '石墙'],
        ['bdsm club', '俱乐部'], ['laboratory', '实验室'], ['torture chamber', '审讯室'], ['castle dungeon', '城堡地牢'],
        ['abandoned warehouse', '废弃仓库'], ['cage', '铁笼'], ['ruins', '遗迹'], ['shrine', '神社'],
        ['execution chamber', '刑讯室'], ['attic', '阁楼'], ['basement', '地下室'], ['red light district', '红灯区']
      ];
      const bg = bdsmBackgrounds[Math.floor(Math.random() * bdsmBackgrounds.length)];
      addAdultTag(bg[0], bg[1], 'Backgrounds');

      const light = [
        ['dim lighting', '昏暗光线'], ['dramatic shadow', '戏剧性阴影'], ['moody', '阴郁的']
      ][Math.floor(Math.random() * 3)];
      addAdultTag(light[0], light[1], 'Lighting');

      const bdsmClothingPool = [
        [['nude', '裸体']],
        [['nude', '裸体'], ['fishnet stockings', '渔网袜', 'clothes']],
        [['nude', '裸体'], ['thighhighs', '大腿袜', 'clothes']],
        [['latex bodysuit', '乳胶紧身衣', 'clothes']],
        [['leather lingerie', '皮革内衣', 'clothes']],
        [['bondage suit', '束缚衣', 'clothes']],
        [['apron', '围裙', 'clothes'], ['apron only', '仅穿围裙']],
        [['school uniform', '学校制服', 'clothes'], ['half dressed', '半脱衣物']],
        [['wet clothes', '湿透的衣服', 'clothes']],
        [['sukemizu', '透水死库水', 'clothes']]
      ];
      const chosenClothes = bdsmClothingPool[Math.floor(Math.random() * bdsmClothingPool.length)];
      chosenClothes.forEach(c => addAdultTag(c[0], c[1], c[2] || 'NSFW'));

    } else if (activeStyleKey === 'stealth') {
      setGenModel('pony');
      setGenRating('explicit');

      if (isMultiCharacter) {
        addAdultTag('1girl', '一个女孩', 'General');
        addAdultTag('1boy', '一个男孩', 'General');
      } else {
        addAdultTag('1girl', '一个女孩', 'General');
        addAdultTag('solo', '单人', 'General');
      }

      const stealthPosesPool = [
        ['under table', '桌子底下'],
        ['sitting on lap', '坐在大腿上'],
        ['straddling', '跨坐'],
        ['leaning forward', '身体前倾'],
        ['bent over', '弯腰/翘臀'],
        ['standing sex', '站立姿'],
        ['against wall', '靠墙站立'],
        ['kneeling under desk', '跪在桌下'],
        ['lying under covers', '躺在被子下'],
        ['sitting on desk', '坐在办公桌上'],
        ['lifting person', '被抱起'],
        ['hanging legs', '悬空双腿']
      ];

      const templates = [
        [
          ['upper body normal', '上半身正常'], ['smile', '微笑'], ['table', '桌子'],
          ['no panties', '无内裤'], ['legs trembling', '双腿颤抖'],
          ['pussy juice trail', '爱液痕迹'], ['stealth sex', '隐秘性交'],
          ['boy head out of frame', '男孩头部出框'], ['girl face visible', '女孩脸部可见'],
          ['at least one face visible', '至少有一张脸可见']
        ],
        [
          ['lifting person', '抱起'], ['feet', '双脚'], ['toes', '脚趾'], ['toe scrunch', '脚趾蜷缩'],
          ['trembling', '发抖'], ['pussy juice trail', '爱液滴落'],
          ['boy head out of frame', '男孩头部出框'], ['girl face visible', '女孩脸部可见'],
          ['at least one face visible', '至少有一张脸可见']
        ],
        [
          ['against glass', '贴在玻璃上'], ['frosted glass', '磨砂玻璃'],
          ['breast press', '乳房贴玻璃'], ['stealth sex', '隐秘性交'], ['from outside', '从室外拍摄'],
          ['x-ray', '透视线'], ['girl face visible', '女孩脸部可见'], ['at least one face visible', '至少有一张脸可见']
        ],
        [
          ['playing games', '打游戏'], ['holding controller', '手握手柄'],
          ['stealth sex', '隐秘性交'], ['implied sex', '暗示性行为'], ['expressionless', '面无表情'],
          ['upper body normal', '上半身正常'], ['cum string', '精液拉丝'],
          ['boy head out of frame', '男孩头部出框'], ['girl face visible', '女孩脸部可见'],
          ['at least one face visible', '至少有一张脸可见']
        ]
      ];

      const chosenTemplate = templates[Math.floor(Math.random() * templates.length)];
      chosenTemplate.forEach(([r, z]) => addAdultTag(r, z));

      const chosenPose = stealthPosesPool[Math.floor(Math.random() * stealthPosesPool.length)];
      addAdultTag(chosenPose[0], chosenPose[1]);

      const stealthBackgrounds = [
        ['restaurant', '餐厅'], ['office', '办公室'], ['classroom', '教室'], ['living room', '客厅'],
        ['library', '图书馆'], ['train carriage', '火车车厢'], ['subway', '地铁'], ['public restroom', '公共洗手间'],
        ['fitting room', '试衣间'], ['cinema', '电影院'], ['bus', '公交车'], ['beach', '沙滩'],
        ['park bench', '公园长椅'], ['elevator', '电梯'], ['hotel lobby', '酒店大堂'], ['cafe', '咖啡馆'],
        ['pantry', '茶水间'], ['store', '百货商店']
      ];
      const bg = stealthBackgrounds[Math.floor(Math.random() * stealthBackgrounds.length)];
      addAdultTag(bg[0], bg[1], 'Backgrounds');

      const stealthClothingPool = [
        [['skirt lift', '掀起裙子'], ['skirt', '裙子', 'clothes']],
        [['skirt lift', '掀起裙子'], ['dress', '连衣裙', 'clothes']],
        [['skirt lift', '掀起裙摆'], ['cheongsam', '旗袍', 'clothes']],
        [['apron', '围裙', 'clothes'], ['apron only', '仅穿围裙']],
        [['unbuttoned shirt', '解开纽扣的衬衫'], ['shirt', '衬衫', 'clothes']],
        [['off-shoulder sweater', '露肩毛衣'], ['sweater', '毛衣', 'clothes']],
        [['school uniform', '学校制服', 'clothes'], ['half dressed', '半脱衣物']],
        [['pantyhose pull', '扯丝袜'], ['pantyhose', '丝袜', 'clothes']],
        [['yukata', '浴衣', 'clothes'], ['half dressed', '半脱衣物']],
        [['half dressed', '半脱衣物']]
      ];
      const chosenClothes = stealthClothingPool[Math.floor(Math.random() * stealthClothingPool.length)];
      chosenClothes.forEach(c => addAdultTag(c[0], c[1], c[2] || 'NSFW'));

    } else if (activeStyleKey === 'lewd') {
      setGenModel('pony');
      setGenRating('explicit');

      if (isMultiCharacter) {
        const lewdStarters = [
          [['1girl', '一个女孩'], ['1boy', '一个男孩'], ['couple', '情侣/双人']],
          [['2girls', '两个女孩'], ['duo', '双人'], ['yuri', '百合']],
          [['group', '群组/多人'], ['gangbang', '群交']]
        ];
        const choice = lewdStarters[Math.floor(Math.random() * lewdStarters.length)];
        choice.forEach(([r, z]) => addAdultTag(r, z, 'General'));
      } else {
        addAdultTag('1girl', '一个女孩', 'General');
        addAdultTag('solo', '单人', 'General');
      }

      const lewdPosesPool = [
        ['cowgirl position', '骑乘位'],
        ['reverse cowgirl position', '反向骑乘'],
        ['missionary position', '传教士式'],
        ['doggy style', '后入式'],
        ['all fours', '四肢趴地'],
        ['mating press', '压迫式'],
        ['suspended double span', '悬空抱入'],
        ['sitting on lap', '坐在大腿上'],
        ['bent over table', '趴在桌上'],
        ['legs up', '抬起双腿'],
        ['legs spread', '双腿大开'],
        ['kneeling', '跪姿'],
        ['fellatio', '口交姿势'],
        ['face down', '脸朝下俯卧']
      ];

      const templates = [
        [
          ['ahegao', '阿黑颜'], ['breast', '乳房'], ['buttocks', '臀部'],
          ['creampie', '内射'], ['pussy', '阴部'],
          ['girl face visible', '女孩脸部可见'], ['at least one face visible', '至少有一张脸可见']
        ],
        [
          ['drooling', '流口水'], ['heart in eye', '心形瞳'], ['crying', '抽泣'],
          ['breast bounce', '乳房晃动'],
          ['girl face visible', '女孩脸部可见'], ['at least one face visible', '至少有一张脸可见']
        ],
        [
          ['blush', '脸红'],
          ['cum on face', '脸射精'], ['open mouth', '张嘴'], ['tongue out', '吐舌头'],
          ['deep throat', '深喉'],
          ['girl face visible', '女孩脸部可见'], ['at least one face visible', '至少有一张脸可见']
        ]
      ];

      const chosenTemplate = templates[Math.floor(Math.random() * templates.length)];
      chosenTemplate.forEach(([r, z]) => addAdultTag(r, z));

      const chosenPose = lewdPosesPool[Math.floor(Math.random() * lewdPosesPool.length)];
      addAdultTag(chosenPose[0], chosenPose[1]);

      const lewdClothingPool = [
        [['nude', '裸体']],
        [['nude', '裸体'], ['thighhighs', '过膝袜', 'clothes']],
        [['lingerie', '性感内衣', 'clothes']],
        [['underwear', '内衣裤', 'clothes']],
        [['micro bikini', '微型比基尼', 'clothes']],
        [['apron', '围裙', 'clothes'], ['apron only', '仅穿围裙']],
        [['unbuttoned shirt', '敞开的衬衫', 'clothes']],
        [['open front dress', '前开襟连衣裙', 'clothes']],
        [['bunny suit', '兔女郎装', 'clothes']],
        [['half dressed', '半脱衣物']]
      ];
      const chosenClothes = lewdClothingPool[Math.floor(Math.random() * lewdClothingPool.length)];
      chosenClothes.forEach(c => addAdultTag(c[0], c[1], c[2] || 'NSFW'));

      const lewdBackgrounds = [
        ['bed', '床上'], ['room', '房间'], ['hotel', '酒店'], ['bathroom', '浴室'],
        ['love hotel', '情趣酒店'], ['swimming pool', '游泳池'], ['onsen', '温泉'], ['shower room', '淋浴间'],
        ['sofa', '沙发'], ['beach', '海滩'], ['jacuzzi', '按摩浴缸'], ['tatami room', '榻榻米房间'],
        ['tent', '帐篷'], ['meadow', '草地'], ['balcony', '阳台'], ['dressing room', '化妆间']
      ];
      const bg = lewdBackgrounds[Math.floor(Math.random() * lewdBackgrounds.length)];
      addAdultTag(bg[0], bg[1], 'Backgrounds');
    }

    let filteredList = [...adultTags];
    const hasNude = filteredList.some(t => t.raw === 'nude' || t.raw === 'naked' || t.raw === 'completely nude' || t.raw === 'fully nude');
    if (hasNude) {
      const bdsmGear = ['rope', 'handcuffs', 'gag', 'blindfold', 'chains', 'leash', 'collar', 'harness', 'apron', '绳', '手铐', '口球', '眼罩', '链', '牵引', '项圈', '器具', '围裙'];
      filteredList = filteredList.filter(t =>
        (t.category !== 'clothes' && t.category !== 'clothing_materials') ||
        bdsmGear.some(g => t.raw.toLowerCase().includes(g) || (t.zh && t.zh.toLowerCase().includes(g)))
      );
    }
    if (!isMultiCharacter) {
      const forbiddenExact = ['1boy', 'couple', 'duo', 'trio', 'group', 'multi-person', 'partner', 'gangbang', 'threesome', 'yuri', 'yaoi', 'double desk', 'sitting on lap', 'playing games with partner'];
      const forbiddenSubstrings = ['boy', 'sex', 'penetration', 'fellatio', 'cunnilingus', 'creampie', 'lap', '男', '双人', '情侣', '大腿', '性交', '插入', '口交', '内射'];
      filteredList = filteredList.filter(t => {
        const rawLower = t.raw.toLowerCase();
        const zhLower = (t.zh || '').toLowerCase();
        if (forbiddenExact.some(w => rawLower === w)) return false;
        if (forbiddenSubstrings.some(sub => {
          if (sub === 'boy') return /\bboy/i.test(rawLower) || zhLower.includes('男');
          if (sub === 'sex') return /\bsex/i.test(rawLower) || zhLower.includes('性交');
          if (sub === 'lap') return /\blap\b/i.test(rawLower) || zhLower.includes('大腿');
          return rawLower.includes(sub) || zhLower.includes(sub);
        })) {
          return false;
        }
        return true;
      });
    }
    filteredList = expandNudityTags(filteredList);
    setSelectedTags(filteredList);

    const styleDisplayNames = {
      bdsm: '束缚调教',
      stealth: '隐奸推荐',
      lewd: '羞羞推荐'
    };
    showToast(`已成功推荐生成【${styleDisplayNames[activeStyleKey]}】风格的生图提示词！`, 'success');
    return;
  }

  const pickCategoryTag = (categoryName, limit = 1, forceMatch = false) => {
    if (!tagDatabase[categoryName]) return;
    const catData = tagDatabase[categoryName];
    const tags = catData.tags;
    if (!tags || tags.length === 0) return;

    const keywords = styleConfig.keywords[categoryName];
    let candidatePool = [];

    if (keywords) {
      candidatePool = tags.filter(tag => {
        const en = Array.isArray(tag) ? tag[0] : tag;
        const zh = Array.isArray(tag) ? tag[1] : '';
        return keywords.some(kw => en.toLowerCase().includes(kw) || (zh && zh.toLowerCase().includes(kw)));
      });
    }

    if (candidatePool.length === 0) {
      if (forceMatch) {
        return;
      }
      candidatePool = tags;
    }

    const shuffled = [...candidatePool].sort(() => 0.5 - Math.random());
    const chosen = shuffled.slice(0, Math.min(limit, shuffled.length));

    chosen.forEach(tag => {
      const raw = Array.isArray(tag) ? tag[0] : tag;
      const zh = Array.isArray(tag) ? tag[1] : '';
      const { clean, weight } = parseTag(raw);
      if (!selectedList.some(t => t.raw === raw)) {
        selectedList.push({ raw, clean, weight, category: categoryName, zh });
      }
    });
  };

  if (isMultiCharacter) {
    const multiStarters = [
      [['2girls', '两个女孩'], ['duo', '双人']],
      [['1girl', '一个女孩'], ['1boy', '一个男孩'], ['couple', '情侣/双人']],
      [['3girls', '三个女孩'], ['trio', '三人']],
      [['group', '群组/多人'], ['multi-person', '多人']]
    ];
    const starter = multiStarters[Math.floor(Math.random() * multiStarters.length)];
    starter.forEach(([raw, zh]) => {
      const { clean, weight } = parseTag(raw);
      selectedList.push({ raw, clean, weight, category: 'General', zh });
    });
  } else {
    const isFemale = Math.random() < 0.9;
    const genderTags = isFemale ? [['1girl', '1个女孩'], ['solo', '单人']] : [['1boy', '1个男孩'], ['solo', '单人']];
    genderTags.forEach(([raw, zh]) => {
      const { clean, weight } = parseTag(raw);
      selectedList.push({ raw, clean, weight, category: 'General', zh });
    });
  }

  pickCategoryTag('Themes', 2);

  if (activeStyleKey === 'lewd' && tagDatabase.NSFW) {
    if (isMultiCharacter) {
      const interactionNsfw = ['sex', 'penetration', 'cowgirl position', 'missionary', 'doggy style', 'fellatio', 'cunnilingus', 'double penetration', 'gangbang', 'threesome', 'yaoi', 'yuri', 'hetero'];
      const tags = tagDatabase.NSFW.tags;
      const candidatePool = tags.filter(tag => {
        const en = Array.isArray(tag) ? tag[0] : tag;
        return interactionNsfw.some(kw => en.toLowerCase().includes(kw));
      });
      const chosenCount = 2;
      const shuffled = (candidatePool.length > 0 ? candidatePool : tags).sort(() => 0.5 - Math.random());
      shuffled.slice(0, chosenCount).forEach(tag => {
        const raw = Array.isArray(tag) ? tag[0] : tag;
        const zh = Array.isArray(tag) ? tag[1] : '';
        const { clean, weight } = parseTag(raw);
        selectedList.push({ raw, clean, weight, category: 'NSFW', zh });
      });
    } else {
      pickCategoryTag('NSFW', 3);
    }
  }

  if (activeStyleKey === 'bdsm' && tagDatabase.NSFW) {
    if (isMultiCharacter) {
      const bdsmMultiKeywords = ['femdom', 'maledom', 'leash', 'collar', 'spanking', 'flogging', 'bondage', 'submission', 'dominant', 'submissive', 'slave', 'master'];
      const tags = tagDatabase.NSFW.tags;
      const candidatePool = tags.filter(tag => {
        const en = Array.isArray(tag) ? tag[0] : tag;
        const zh = Array.isArray(tag) ? tag[1] : '';
        return bdsmMultiKeywords.some(kw => en.toLowerCase().includes(kw) || (zh && zh.toLowerCase().includes(kw)));
      });
      const chosenCount = 2;
      const shuffled = (candidatePool.length > 0 ? candidatePool : tags).sort(() => 0.5 - Math.random());
      shuffled.slice(0, chosenCount).forEach(tag => {
        const raw = Array.isArray(tag) ? tag[0] : tag;
        const zh = Array.isArray(tag) ? tag[1] : '';
        const { clean, weight } = parseTag(raw);
        selectedList.push({ raw, clean, weight, category: 'NSFW', zh });
      });
    } else {
      pickCategoryTag('NSFW', 2);
    }
  }

  if (activeStyleKey === 'stealth' && tagDatabase.NSFW) {
    if (isMultiCharacter) {
      const stealthMultiKeywords = ['stealth sex', 'implied sex', 'under table', 'sitting on lap', 'double desk', 'public use', 'office sex', 'secret relationship'];
      const tags = tagDatabase.NSFW.tags;
      const candidatePool = tags.filter(tag => {
        const en = Array.isArray(tag) ? tag[0] : tag;
        const zh = Array.isArray(tag) ? tag[1] : '';
        return stealthMultiKeywords.some(kw => en.toLowerCase().includes(kw) || (zh && zh.toLowerCase().includes(kw)));
      });
      const chosenCount = 2;
      const shuffled = (candidatePool.length > 0 ? candidatePool : tags).sort(() => 0.5 - Math.random());
      shuffled.slice(0, chosenCount).forEach(tag => {
        const raw = Array.isArray(tag) ? tag[0] : tag;
        const zh = Array.isArray(tag) ? tag[1] : '';
        const { clean, weight } = parseTag(raw);
        selectedList.push({ raw, clean, weight, category: 'NSFW', zh });
      });
    } else {
      pickCategoryTag('NSFW', 2);
    }
  }

  if (activeStyleKey === 'multi' && (genRating === 'nsfw' || genRating === 'explicit') && tagDatabase.NSFW) {
    const groupNsfwKeywords = ['threesome', 'foursome', 'gangbang', 'group sex', 'double penetration', 'dp', '三人行', '群交', '双重插入', 'harem', '后宫'];
    const tags = tagDatabase.NSFW.tags;
    const candidatePool = tags.filter(tag => {
      const en = Array.isArray(tag) ? tag[0] : tag;
      const zh = Array.isArray(tag) ? tag[1] : '';
      return groupNsfwKeywords.some(kw => en.toLowerCase().includes(kw) || (zh && zh.toLowerCase().includes(kw)));
    });
    if (candidatePool.length > 0) {
      const chosen = candidatePool[Math.floor(Math.random() * candidatePool.length)];
      const raw = Array.isArray(chosen) ? chosen[0] : chosen;
      const zh = Array.isArray(chosen) ? chosen[1] : '';
      const { clean, weight } = parseTag(raw);
      selectedList.push({ raw, clean, weight, category: 'NSFW', zh });
    }
  }

  if (tagDatabase.Environment_Setting) {
    pickCategoryTag('Environment_Setting', 1, true);
  }
  if (tagDatabase.Backgrounds) {
    pickCategoryTag('Backgrounds', 1, true);
  }

  pickCategoryTag('clothes', 2);
  pickCategoryTag('hair', 1);

  if (activeStyleKey === 'lewd' && tagDatabase.Emotions_Expressions) {
    const lewdExpressions = ['blush', 'heart in eye', 'ahegao', 'drooling', 'panting', 'crying'];
    const catData = tagDatabase.Emotions_Expressions;
    const filtered = catData.tags.filter(tag => {
      const en = Array.isArray(tag) ? tag[0] : tag;
      return lewdExpressions.some(le => en.toLowerCase().includes(le));
    });
    const chosenTag = filtered.length > 0
      ? filtered[Math.floor(Math.random() * filtered.length)]
      : catData.tags[Math.floor(Math.random() * catData.tags.length)];
    const raw = Array.isArray(chosenTag) ? chosenTag[0] : chosenTag;
    const zh = Array.isArray(chosenTag) ? chosenTag[1] : '';
    const { clean, weight } = parseTag(raw);
    selectedList.push({ raw, clean, weight, category: 'Emotions_Expressions', zh });
  } else if (activeStyleKey === 'bdsm' && tagDatabase.Emotions_Expressions) {
    const bdsmExpressions = ['tears', 'crying', 'scared', 'struggling', 'empty eyes', 'mind break', '哭', '泪', '害怕', '挣扎', '空洞', '崩溃'];
    const catData = tagDatabase.Emotions_Expressions;
    const filtered = catData.tags.filter(tag => {
      const en = Array.isArray(tag) ? tag[0] : tag;
      const zh = Array.isArray(tag) ? tag[1] : '';
      return bdsmExpressions.some(be => en.toLowerCase().includes(be) || (zh && zh.toLowerCase().includes(be)));
    });
    const chosenTag = filtered.length > 0
      ? filtered[Math.floor(Math.random() * filtered.length)]
      : catData.tags[Math.floor(Math.random() * catData.tags.length)];
    const raw = Array.isArray(chosenTag) ? chosenTag[0] : chosenTag;
    const zh = Array.isArray(chosenTag) ? chosenTag[1] : '';
    const { clean, weight } = parseTag(raw);
    selectedList.push({ raw, clean, weight, category: 'Emotions_Expressions', zh });
  } else if (activeStyleKey === 'stealth' && tagDatabase.Emotions_Expressions) {
    const stealthExpressions = ['smile', 'neutral expression', 'expressionless', 'happy', '微笑', '日常', '无表情', '开心'];
    const catData = tagDatabase.Emotions_Expressions;
    const filtered = catData.tags.filter(tag => {
      const en = Array.isArray(tag) ? tag[0] : tag;
      const zh = Array.isArray(tag) ? tag[1] : '';
      return stealthExpressions.some(se => en.toLowerCase().includes(se) || (zh && zh.toLowerCase().includes(se)));
    });
    const chosenTag = filtered.length > 0
      ? filtered[Math.floor(Math.random() * filtered.length)]
      : catData.tags[Math.floor(Math.random() * catData.tags.length)];
    const raw = Array.isArray(chosenTag) ? chosenTag[0] : chosenTag;
    const zh = Array.isArray(chosenTag) ? chosenTag[1] : '';
    const { clean, weight } = parseTag(raw);
    selectedList.push({ raw, clean, weight, category: 'Emotions_Expressions', zh });
  } else {
    pickCategoryTag('Emotions_Expressions', 1);
  }

  if (activeStyleKey === 'bdsm' && tagDatabase.Poses) {
    const bdsmPoses = ['kneeling', 'arms behind back', 'hogtie', 'spread eagle', 'suspension', 'bound', 'crawling', '跪', '绑', '反绑', '四肢着地'];
    const catData = tagDatabase.Poses;
    const filtered = catData.tags.filter(tag => {
      const en = Array.isArray(tag) ? tag[0] : tag;
      const zh = Array.isArray(tag) ? tag[1] : '';
      return bdsmPoses.some(bp => en.toLowerCase().includes(bp) || (zh && zh.toLowerCase().includes(bp)));
    });
    const chosenTag = filtered.length > 0
      ? filtered[Math.floor(Math.random() * filtered.length)]
      : catData.tags[Math.floor(Math.random() * catData.tags.length)];
    const raw = Array.isArray(chosenTag) ? chosenTag[0] : chosenTag;
    const zh = Array.isArray(chosenTag) ? chosenTag[1] : '';
    const { clean, weight } = parseTag(raw);
    selectedList.push({ raw, clean, weight, category: 'Poses', zh });
  } else {
    pickCategoryTag('Poses', 1);
  }

  if (tagDatabase.Lighting) pickCategoryTag('Lighting', 1, true);

  if (activeStyleKey === 'stealth' && tagDatabase.Perspective) {
    const stealthPerspectives = ['head out of frame', 'lower body only', 'view between legs', 'split screen', 'from below', 'from outside', 'through window', '无脸', '仅下半身', '臀部视角', '分屏', '仰视', '外面', '窗口'];
    const catData = tagDatabase.Perspective;
    const filtered = catData.tags.filter(tag => {
      const en = Array.isArray(tag) ? tag[0] : tag;
      const zh = Array.isArray(tag) ? tag[1] : '';
      return stealthPerspectives.some(sp => en.toLowerCase().includes(sp) || (zh && zh.toLowerCase().includes(sp)));
    });
    const chosenTag = filtered.length > 0
      ? filtered[Math.floor(Math.random() * filtered.length)]
      : catData.tags[Math.floor(Math.random() * catData.tags.length)];
    const raw = Array.isArray(chosenTag) ? chosenTag[0] : chosenTag;
    const zh = Array.isArray(chosenTag) ? chosenTag[1] : '';
    const { clean, weight } = parseTag(raw);
    selectedList.push({ raw, clean, weight, category: 'Perspective', zh });
  } else if (tagDatabase.Perspective) {
    pickCategoryTag('Perspective', 1, true);
  }

  if (tagDatabase.Props_Objects) pickCategoryTag('Props_Objects', 1, true);
  if (tagDatabase.Accessory) pickCategoryTag('Accessory', 1, true);

  let filteredList = [...selectedList];

  const hasNude = filteredList.some(t => t.raw === 'nude' || t.raw === 'naked' || t.raw === 'completely nude' || t.raw === 'fully nude');
  const hasTopless = filteredList.some(t => t.raw === 'topless' || t.raw === 'exposed breasts' || t.raw === 'exposed_breasts');
  const hasBottomless = filteredList.some(t => t.raw === 'bottomless');
  const hasBarefoot = filteredList.some(t => t.raw === 'barefoot');
  const hasNoBra = filteredList.some(t => t.raw === 'no bra' || t.raw === 'no_bra');
  const hasNoPanties = filteredList.some(t => t.raw === 'no panties' || t.raw === 'no_panties');

  if (hasNude) {
    const bdsmGear = ['rope', 'handcuffs', 'gag', 'blindfold', 'chains', 'leash', 'collar', 'harness', 'apron', '绳', '手铐', '口球', '眼罩', '链', '牵引', '项圈', '器具', '围裙'];
    filteredList = filteredList.filter(t =>
      (t.category !== 'clothes' && t.category !== 'clothing_materials') ||
      bdsmGear.some(g => t.raw.toLowerCase().includes(g) || (t.zh && t.zh.toLowerCase().includes(g)))
    );
  } else {
    if (hasTopless) {
      const topWords = ['shirt', 'sweater', 'jacket', 'coat', 'hanfu', 'cheongsam', 'dress', 'kimono', 'hoodie', 'blouse', 't-shirt', 'vest', 'corset', '衬衫', '毛衣', '夹克', '外套', '大衣', '汉服', '旗袍', '连衣裙', '和服', '连帽衫', '女衬衫', '恤', '背心', '束身衣'];
      filteredList = filteredList.filter(t => {
        if (t.category === 'clothes') return !topWords.some(w => t.raw.toLowerCase().includes(w) || (t.zh && t.zh.toLowerCase().includes(w)));
        return true;
      });
    }
    if (hasBottomless) {
      const bottomWords = ['pants', 'shorts', 'skirt', 'jeans', 'hanfu', 'cheongsam', 'dress', 'kimono', 'panties', 'underwear', '裤', '短裤', '裙', '牛仔裤', '汉服', '旗袍', '连衣裙', '和服', '内裤', '内衣'];
      filteredList = filteredList.filter(t => {
        if (t.category === 'clothes') return !bottomWords.some(w => t.raw.toLowerCase().includes(w) || (t.zh && t.zh.toLowerCase().includes(w)));
        return true;
      });
    }
  }

  if (hasBarefoot) {
    const shoeWords = ['shoes', 'boots', 'sneakers', 'sandals', 'slippers', 'footwear', '鞋', '靴', '运动鞋', '凉鞋', '拖鞋'];
    filteredList = filteredList.filter(t => !shoeWords.some(w => t.raw.toLowerCase().includes(w) || (t.zh && t.zh.toLowerCase().includes(w))));
  }

  if (hasNoBra) filteredList = filteredList.filter(t => t.raw !== 'bra' && (!t.zh || !t.zh.includes('胸罩')));
  if (hasNoPanties) filteredList = filteredList.filter(t => t.raw !== 'panties' && (!t.zh || !t.zh.includes('内裤')));

  if (!isMultiCharacter) {
    const has1girl = filteredList.some(t => t.raw === '1girl');
    const has1boy = filteredList.some(t => t.raw === '1boy');
    if (has1girl && has1boy) {
      filteredList = filteredList.filter(t => t.raw !== '1boy');
    }
    const forbiddenExact = ['1boy', 'couple', 'duo', 'trio', 'group', 'multi-person', 'partner', 'gangbang', 'threesome', 'yuri', 'yaoi', 'double desk', 'sitting on lap', 'playing games with partner'];
    const forbiddenSubstrings = ['boy', 'sex', 'penetration', 'fellatio', 'cunnilingus', 'creampie', 'lap', '男', '双人', '情侣', '大腿', '性交', '插入', '口交', '内射'];
    filteredList = filteredList.filter(t => {
      const rawLower = t.raw.toLowerCase();
      const zhLower = (t.zh || '').toLowerCase();
      if (forbiddenExact.some(w => rawLower === w)) return false;
      if (forbiddenSubstrings.some(sub => {
        if (sub === 'boy') return /\bboy/i.test(rawLower) || zhLower.includes('男');
        if (sub === 'sex') return /\bsex/i.test(rawLower) || zhLower.includes('性交');
        if (sub === 'lap') return /\blap\b/i.test(rawLower) || zhLower.includes('大腿');
        return rawLower.includes(sub) || zhLower.includes(sub);
      })) {
        return false;
      }
      return true;
    });
  }

  filteredList = expandNudityTags(filteredList);
  setSelectedTags(filteredList);

  const styleDisplayNames = {
    anime: '日系二次元',
    realistic: '写实人像',
    cyberpunk: '赛博朋克',
    fantasy: '魔法奇幻',
    chinese: '国风华服',
    scifi: '科幻太空',
    pastoral: '清新田园',
    multi: '多人合照',
    bdsm: '束缚调教',
    stealth: '隐奸推荐',
    lewd: '羞羞推荐'
  };
  showToast(`已成功推荐生成【${styleDisplayNames[activeStyleKey] || activeStyleKey}】风格的生图提示词！`, 'success');
}
