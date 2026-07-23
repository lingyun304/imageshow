export const VIDEO_PROMPT_EXAMPLES_BY_MODE = {
  t2v: [
    { label: '湖光自然', text: '微风轻拂过恬静的极简湖面，岸边浅绿色风铃叶慢速摇曳，画面光影柔线安详，细节细腻流畅。' },
    { label: '极简光影', text: '深色质感背景中，一缕柔和的淡金微光沿磨砂玻璃边缘极缓推移，展现极简沉稳的气息。' },
    { label: '镜头慢推', text: '镜头缓慢地向静置在沉木桌面上的陶瓷茶杯推进，细微的水汽微幅升腾，微距细节清晰质朴。' },
    { label: '风吹麦浪', text: '微风徐徐刮过金黄色的麦田，麦浪呈现轻微平缓的摆动，天空云朵缓慢漂移，气韵安宁。' }
  ],
  i2v: [
    { label: '微表情动态', text: '源图中的人物发丝微动，双眸缓眨，嘴角露出优雅自然的浅笑，镜头微幅拉近。' },
    { label: '光影流动', text: '图中背景霓虹灯光微泛涟漪，人物衣服光泽随微风轻荡，整体气韵灵线细腻。' },
    { label: '画面泛舟', text: '图中水面微漾起波纹，小舟沿画幅中央缓慢推移，背景云雾悄然缭绕开来。' }
  ],
  r2v: [
    { label: '东方韵味视角切', text: '[Image 1]中身着红色旗袍的女性，镜头先以侧面中景勾勒旗袍修身剪裁与S型曲线，随即切换至低角度仰拍，捕捉她轻抬玉手展开[Image 2]中的折扇的同时，[Image 3]中的流苏耳坠随头部转动轻盈摆动的细节，最后推近至面部特效，定格在她指尖轻点扇骨、眼波流转间的含蓄风情，多视角全方位展现东方韵味。' },
    { label: '多图对白', text: 'The princess image2 was imprisoned in bedroom and be threaten by the dragon man image1. They had a long dialogue.' },
    { label: '多图面部与背景结合', text: '参考 image1 的沉静面部特征与 image2 的璀璨流光背景，展现人物慢动作回头眨眼的细微表情变化。' }
  ],
  edit: [
    { label: '角色服装替换', text: '让视频中的马头人身角色穿上图片中的条纹毛衣' },
    { label: '飞船替换邮轮', text: '参考image1，将video1中正在行驶的白色邮轮替换为图中所示的太空飞船。飞船必须完全遵循原邮轮的行驶轨迹、速度和朝向，严丝合缝地嵌入场景中。确保飞船表面的光照、反射和阴影与原video1环境的光源保持一致。在替换过程中，周围的背景、水面、天空以及镜头的运镜轨迹必须保持 100% 不变。' },
    { label: '人物服饰重绘', text: '参考 image1 的唯美画风，将 video1 中的二次元人物服装重绘为银白金属质感战甲，主体动作与背景保留 100% 相同。' }
  ]
};

export const VIDEO_MODELS = [
  // 文生视频 (T2V) - 3款
  { id: 'happyhorse-1.1-t2v', name: 'happyhorse-1.1-t2v', tag: '阿里 HappyHorse 文生视频 (v1.1)', provider: 'Aliyun DashScope', mode: 't2v' },
  { id: 'wan2.7-t2v-2026-06-12', name: 'wan2.7-t2v-2026-06-12', tag: '阿里 Wan 2.7 文生视频 (2026-06-12)', provider: 'Aliyun DashScope', mode: 't2v' },
  { id: 'wan2.7-t2v-2026-04-25', name: 'wan2.7-t2v-2026-04-25', tag: '阿里 Wan 2.7 文生视频 (2026-04-25)', provider: 'Aliyun DashScope', mode: 't2v' },

  // 图生视频 (I2V) - 2款
  { id: 'wan2.7-i2v-2026-04-25', name: 'wan2.7-i2v-2026-04-25', tag: '阿里 Wan 2.7 图生视频 (2026-04-25)', provider: 'Aliyun DashScope', mode: 'i2v' },
  { id: 'happyhorse-1.1-i2v', name: 'happyhorse-1.1-i2v', tag: '阿里 HappyHorse 图生视频 (v1.1)', provider: 'Aliyun DashScope', mode: 'i2v' },

  // 参考生视频 (R2V) - 2款
  { id: 'wan2.7-r2v-2026-06-12', name: 'wan2.7-r2v-2026-06-12', tag: '阿里 Wan 2.7 参考生视频 (2026-06-12)', provider: 'Aliyun DashScope', mode: 'r2v' },
  { id: 'happyhorse-1.0-r2v', name: 'happyhorse-1.0-r2v', tag: '阿里 HappyHorse 参考生视频 (v1.0)', provider: 'Aliyun DashScope', mode: 'r2v' },

  // 视频编辑 (Edit) - 1款
  { id: 'happyhorse-1.0-video-edit', name: 'happyhorse-1.0-video-edit', tag: '阿里 HappyHorse 视频编辑 (v1.0)', provider: 'Aliyun DashScope', mode: 'edit' }
];
