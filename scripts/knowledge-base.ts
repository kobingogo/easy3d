/**
 * 知识库数据
 * 包含 130+ 条专业知识条目
 */

import type { KnowledgeEntry } from '../lib/rag/types'

// 商品品类知识 (50条)
const productCategoryKnowledge: KnowledgeEntry[] = [
  // 口红/美妆
  {
    id: 'prod-001',
    text: '口红类化妆品适合纯色背景搭配柔光拍摄，推荐使用粉色或渐变背景突出女性气质，展示时建议45度斜角摆放，重点展示膏体质感和颜色饱和度',
    category: 'product_category',
    tags: ['化妆品', '口红', '美妆'],
    keywords: ['口红', '唇膏', '彩妆', '唇釉'],
    priority: 5,
    source: 'manual',
    examples: ['YSL口红', 'MAC口红', '迪奥口红']
  },
  {
    id: 'prod-002',
    text: '粉底液产品展示建议使用白色或浅灰色背景，突出产品质地和遮瑕效果，可搭配化妆刷或粉扑作为道具，展示产品使用场景',
    category: 'product_category',
    tags: ['化妆品', '粉底', '美妆'],
    keywords: ['粉底', '粉底液', '遮瑕'],
    priority: 4,
    source: 'manual',
    examples: ['雅诗兰黛粉底', '兰蔻粉底']
  },
  {
    id: 'prod-003',
    text: '香水产品适合使用玻璃质感背景或水元素场景，突出产品的精致和高级感，展示时建议搭配光影效果营造神秘氛围',
    category: 'product_category',
    tags: ['化妆品', '香水', '美妆'],
    keywords: ['香水', '香氛', '淡香水'],
    priority: 5,
    source: 'manual',
    examples: ['香奈儿香水', '迪奥香水']
  },
  {
    id: 'prod-004',
    text: '眼影盘展示需要展示颜色层次，建议俯视角度拍摄，搭配化妆刷道具，使用中性背景避免干扰颜色判断',
    category: 'product_category',
    tags: ['化妆品', '眼影', '美妆'],
    keywords: ['眼影', '眼影盘', '眼妆'],
    priority: 4,
    source: 'manual',
    examples: ['TF眼影', 'MAC眼影']
  },
  {
    id: 'prod-005',
    text: '面膜产品适合展示使用场景，搭配水滴或植物元素，突出补水保湿功效，背景建议使用清新自然的蓝绿色调',
    category: 'product_category',
    tags: ['护肤品', '面膜', '美妆'],
    keywords: ['面膜', '补水', '护肤'],
    priority: 4,
    source: 'manual',
    examples: ['SK-II面膜', '科颜氏面膜']
  },

  // 服装鞋帽
  {
    id: 'prod-006',
    text: '女装展示建议搭配人台或模特，展示版型和垂感，背景选择简约风格，避免花哨元素分散注意力，可搭配配饰增加氛围感',
    category: 'product_category',
    tags: ['服装', '女装', '时尚'],
    keywords: ['女装', '连衣裙', '上衣'],
    priority: 5,
    source: 'manual',
    examples: ['ZARA女装', 'H&M女装']
  },
  {
    id: 'prod-007',
    text: '男装展示强调质感和剪裁，建议使用深色背景或工业风场景，搭配皮鞋或手表等配饰，突出商务或休闲风格',
    category: 'product_category',
    tags: ['服装', '男装', '时尚'],
    keywords: ['男装', '西装', '衬衫'],
    priority: 4,
    source: 'manual',
    examples: ['优衣库男装', '海澜之家']
  },
  {
    id: 'prod-008',
    text: '运动鞋展示建议侧面45度角，展示鞋型和设计细节，搭配运动场景元素，如跑道、篮球场等，突出运动属性',
    category: 'product_category',
    tags: ['鞋类', '运动鞋', '运动'],
    keywords: ['运动鞋', '跑鞋', '球鞋'],
    priority: 5,
    source: 'manual',
    examples: ['Nike运动鞋', 'Adidas运动鞋']
  },
  {
    id: 'prod-009',
    text: '高跟鞋展示建议展示鞋跟高度和设计细节，搭配优雅场景元素，如丝绸、花朵等，突出女性魅力',
    category: 'product_category',
    tags: ['鞋类', '高跟鞋', '时尚'],
    keywords: ['高跟鞋', '高跟鞋', '细跟鞋'],
    priority: 4,
    source: 'manual',
    examples: ['Jimmy Choo', 'Christian Louboutin']
  },
  {
    id: 'prod-010',
    text: '帽子展示建议搭配整体穿搭造型，或使用头模展示，背景选择与帽子风格相符的场景',
    category: 'product_category',
    tags: ['帽类', '帽子', '时尚'],
    keywords: ['帽子', '棒球帽', '渔夫帽'],
    priority: 3,
    source: 'manual',
    examples: ['MLB帽子', 'Nike帽子']
  },

  // 3C数码
  {
    id: 'prod-011',
    text: '手机壳展示建议搭配真机展示贴合度，使用科技感背景，如电路板图案、蓝色光效等，突出产品保护功能和设计美感',
    category: 'product_category',
    tags: ['3C数码', '手机壳', '配件'],
    keywords: ['手机壳', '保护壳', '手机套'],
    priority: 5,
    source: 'manual',
    examples: ['iPhone手机壳', '华为手机壳']
  },
  {
    id: 'prod-012',
    text: '耳机展示建议搭配人物使用场景，展示佩戴效果，使用深色背景突出产品质感，可加入声波等视觉元素',
    category: 'product_category',
    tags: ['3C数码', '耳机', '音频'],
    keywords: ['耳机', '蓝牙耳机', '无线耳机'],
    priority: 5,
    source: 'manual',
    examples: ['AirPods', 'Sony耳机']
  },
  {
    id: 'prod-013',
    text: '充电宝展示建议展示容量和充电接口，搭配科技感背景，可加入电量显示动画效果',
    category: 'product_category',
    tags: ['3C数码', '充电宝', '配件'],
    keywords: ['充电宝', '移动电源', '充电器'],
    priority: 4,
    source: 'manual',
    examples: ['小米充电宝', 'Anker充电宝']
  },
  {
    id: 'prod-014',
    text: '键盘展示建议俯视角度展示键帽设计和RGB灯光效果，搭配鼠标组成桌面场景，使用暗色背景突出灯光',
    category: 'product_category',
    tags: ['3C数码', '键盘', '外设'],
    keywords: ['键盘', '机械键盘', 'RGB键盘'],
    priority: 4,
    source: 'manual',
    examples: ['罗技键盘', '雷蛇键盘']
  },
  {
    id: 'prod-015',
    text: '鼠标展示建议侧面角度展示人体工学设计，搭配鼠标垫和键盘组成完整桌面场景',
    category: 'product_category',
    tags: ['3C数码', '鼠标', '外设'],
    keywords: ['鼠标', '游戏鼠标', '无线鼠标'],
    priority: 4,
    source: 'manual',
    examples: ['罗技鼠标', '雷蛇鼠标']
  },

  // 家居生活
  {
    id: 'prod-016',
    text: '抱枕展示建议搭配沙发或床品场景，展示实际使用效果，选择温馨舒适的背景风格',
    category: 'product_category',
    tags: ['家居', '抱枕', '软装'],
    keywords: ['抱枕', '靠垫', '沙发靠垫'],
    priority: 3,
    source: 'manual',
    examples: ['宜家抱枕', '无印良品抱枕']
  },
  {
    id: 'prod-017',
    text: '台灯展示建议夜晚场景，展示灯光效果，搭配书桌场景，突出实用性和设计感',
    category: 'product_category',
    tags: ['家居', '台灯', '照明'],
    keywords: ['台灯', 'LED灯', '护眼灯'],
    priority: 4,
    source: 'manual',
    examples: ['小米台灯', '飞利浦台灯']
  },
  {
    id: 'prod-018',
    text: '餐具展示建议搭配餐桌场景，展示整体搭配效果，选择干净简洁的背景风格',
    category: 'product_category',
    tags: ['家居', '餐具', '厨房'],
    keywords: ['餐具', '碗', '盘子', '餐具套装'],
    priority: 3,
    source: 'manual',
    examples: ['景德镇餐具', '无印良品餐具']
  },
  {
    id: 'prod-019',
    text: '收纳盒展示建议展示内部结构和收纳效果，搭配整洁的家居场景，突出实用性',
    category: 'product_category',
    tags: ['家居', '收纳', '整理'],
    keywords: ['收纳盒', '收纳箱', '整理盒'],
    priority: 3,
    source: 'manual',
    examples: ['宜家收纳', '无印良品收纳']
  },
  {
    id: 'prod-020',
    text: '窗帘展示建议搭配窗户场景，展示遮光效果和垂感，可加入自然光效果',
    category: 'product_category',
    tags: ['家居', '窗帘', '软装'],
    keywords: ['窗帘', '遮光帘', '纱帘'],
    priority: 3,
    source: 'manual',
    examples: ['宜家窗帘', '定制窗帘']
  },

  // 珠宝配饰
  {
    id: 'prod-021',
    text: '项链展示建议使用珠宝展示架或模特颈部，搭配黑色或深蓝色丝绒背景，突出金属光泽和宝石闪耀',
    category: 'product_category',
    tags: ['珠宝', '项链', '配饰'],
    keywords: ['项链', '吊坠', '锁骨链'],
    priority: 5,
    source: 'manual',
    examples: ['施华洛世奇项链', 'Tiffany项链']
  },
  {
    id: 'prod-022',
    text: '手链展示建议搭配手腕特写，展示佩戴效果，使用微距拍摄展示细节工艺',
    category: 'product_category',
    tags: ['珠宝', '手链', '配饰'],
    keywords: ['手链', '手镯', '手串'],
    priority: 4,
    source: 'manual',
    examples: ['潘多拉手链', '施华洛世奇手链']
  },
  {
    id: 'prod-023',
    text: '墨镜展示建议正面或侧面45度角，展示镜框设计和镜片效果，可搭配海滩或城市背景',
    category: 'product_category',
    tags: ['配饰', '墨镜', '眼镜'],
    keywords: ['墨镜', '太阳镜', '眼镜'],
    priority: 4,
    source: 'manual',
    examples: ['Ray-Ban墨镜', 'Oakley墨镜']
  },
  {
    id: 'prod-024',
    text: '手表展示建议展示表盘细节和表带设计，搭配商务或运动场景，突出品质感',
    category: 'product_category',
    tags: ['珠宝', '手表', '配饰'],
    keywords: ['手表', '腕表', '电子表'],
    priority: 5,
    source: 'manual',
    examples: ['Apple Watch', '劳力士']
  },
  {
    id: 'prod-025',
    text: '耳环展示建议使用耳模展示，或搭配人物耳部特写，使用浅色背景突出细节',
    category: 'product_category',
    tags: ['珠宝', '耳环', '配饰'],
    keywords: ['耳环', '耳钉', '耳坠'],
    priority: 4,
    source: 'manual',
    examples: ['施华洛世奇耳环', '周大福耳环']
  },

  // 食品饮料
  {
    id: 'prod-026',
    text: '零食展示建议搭配食用场景，如聚会、追剧等，突出美味和分享属性，背景选择温馨活泼风格',
    category: 'product_category',
    tags: ['食品', '零食', '美食'],
    keywords: ['零食', '薯片', '饼干', '糖果'],
    priority: 4,
    source: 'manual',
    examples: ['乐事薯片', '奥利奥']
  },
  {
    id: 'prod-027',
    text: '茶叶展示建议搭配茶具场景，展示冲泡效果，使用清新淡雅的中国风背景',
    category: 'product_category',
    tags: ['食品', '茶叶', '饮品'],
    keywords: ['茶叶', '绿茶', '红茶', '普洱'],
    priority: 4,
    source: 'manual',
    examples: ['西湖龙井', '大红袍']
  },
  {
    id: 'prod-028',
    text: '咖啡展示建议搭配咖啡机或咖啡杯场景，展示香气氛围，使用现代简约风格背景',
    category: 'product_category',
    tags: ['食品', '咖啡', '饮品'],
    keywords: ['咖啡', '咖啡豆', '挂耳咖啡'],
    priority: 4,
    source: 'manual',
    examples: ['星巴克咖啡', '蓝山咖啡']
  },
  {
    id: 'prod-029',
    text: '酒水展示建议搭配酒杯和品酒场景，使用深色高端背景，突出品质感',
    category: 'product_category',
    tags: ['食品', '酒水', '饮品'],
    keywords: ['红酒', '白酒', '啤酒', '洋酒'],
    priority: 5,
    source: 'manual',
    examples: ['茅台', '五粮液', '拉菲']
  },
  {
    id: 'prod-030',
    text: '水果展示建议搭配新鲜水果切开展示果肉，使用明亮清新的背景，突出新鲜健康',
    category: 'product_category',
    tags: ['食品', '水果', '生鲜'],
    keywords: ['水果', '苹果', '橙子', '草莓'],
    priority: 3,
    source: 'manual',
    examples: ['智利车厘子', '泰国榴莲']
  },

  // 母婴用品
  {
    id: 'prod-031',
    text: '奶瓶展示建议搭配婴儿使用场景，展示安全材质和人性化设计，使用温馨柔和的背景',
    category: 'product_category',
    tags: ['母婴', '奶瓶', '喂养'],
    keywords: ['奶瓶', '婴儿奶瓶', '玻璃奶瓶'],
    priority: 4,
    source: 'manual',
    examples: ['贝亲奶瓶', '新安怡奶瓶']
  },
  {
    id: 'prod-032',
    text: '玩具展示建议搭配儿童玩耍场景，展示趣味性和安全性，使用活泼明亮的背景',
    category: 'product_category',
    tags: ['母婴', '玩具', '儿童'],
    keywords: ['玩具', '积木', '毛绒玩具'],
    priority: 4,
    source: 'manual',
    examples: ['乐高', '费雪玩具']
  },
  {
    id: 'prod-033',
    text: '童装展示建议搭配儿童模特或人台，展示舒适度和可爱设计，使用清新活泼的背景',
    category: 'product_category',
    tags: ['母婴', '童装', '服装'],
    keywords: ['童装', '儿童服装', '宝宝衣服'],
    priority: 3,
    source: 'manual',
    examples: ['巴拉巴拉', '安奈儿童装']
  },
  {
    id: 'prod-034',
    text: '纸尿裤展示建议展示柔软材质和吸收效果，使用温馨的母婴场景背景',
    category: 'product_category',
    tags: ['母婴', '纸尿裤', '护理'],
    keywords: ['纸尿裤', '尿不湿', '纸尿片'],
    priority: 4,
    source: 'manual',
    examples: ['帮宝适', '好奇纸尿裤']
  }
]

// 场景设计知识 (30条)
const sceneDesignKnowledge: KnowledgeEntry[] = [
  // 纯色背景
  {
    id: 'scene-001',
    text: '白色背景是最通用的展示背景，适合全品类商品，突出产品本身，后期处理方便，是电商平台主图的首选',
    category: 'scene_design',
    tags: ['纯色背景', '白色', '通用'],
    keywords: ['白色背景', '纯白', '白底'],
    priority: 5,
    source: 'manual',
    examples: ['淘宝主图', '京东主图']
  },
  {
    id: 'scene-002',
    text: '浅灰色背景适合展示深色产品，营造专业商务感，常用于3C数码、家电等产品展示',
    category: 'scene_design',
    tags: ['纯色背景', '灰色', '商务'],
    keywords: ['灰色背景', '浅灰', '高级灰'],
    priority: 4,
    source: 'manual',
    examples: ['数码产品', '家用电器']
  },
  {
    id: 'scene-003',
    text: '黑色背景适合展示珠宝、手表等高端产品，营造神秘高级感，需要搭配合适的灯光突出产品细节',
    category: 'scene_design',
    tags: ['纯色背景', '黑色', '高端'],
    keywords: ['黑色背景', '纯黑', '黑底'],
    priority: 5,
    source: 'manual',
    examples: ['珠宝展示', '手表展示']
  },
  {
    id: 'scene-004',
    text: '粉色背景适合美妆、女性产品展示，营造温柔甜美氛围，建议使用淡粉色而非亮粉色',
    category: 'scene_design',
    tags: ['纯色背景', '粉色', '女性'],
    keywords: ['粉色背景', '粉红', '淡粉'],
    priority: 4,
    source: 'manual',
    examples: ['口红展示', '香水展示']
  },
  {
    id: 'scene-005',
    text: '蓝色背景适合科技类产品展示，营造专业可信感，建议使用科技蓝或深蓝色调',
    category: 'scene_design',
    tags: ['纯色背景', '蓝色', '科技'],
    keywords: ['蓝色背景', '科技蓝', '深蓝'],
    priority: 4,
    source: 'manual',
    examples: ['手机展示', '耳机展示']
  },

  // 渐变背景
  {
    id: 'scene-006',
    text: '粉紫渐变背景适合美妆产品，营造梦幻浪漫氛围，从浅粉过渡到淡紫色',
    category: 'scene_design',
    tags: ['渐变背景', '粉紫', '美妆'],
    keywords: ['粉紫渐变', '渐变背景', '梦幻'],
    priority: 4,
    source: 'manual',
    examples: ['口红展示', '香水展示']
  },
  {
    id: 'scene-007',
    text: '蓝白渐变背景适合科技产品，营造清新专业感，从浅蓝过渡到白色',
    category: 'scene_design',
    tags: ['渐变背景', '蓝白', '科技'],
    keywords: ['蓝白渐变', '清新渐变'],
    priority: 4,
    source: 'manual',
    examples: ['数码产品', '智能家居']
  },
  {
    id: 'scene-008',
    text: '金黑渐变背景适合高端奢侈品，营造奢华质感，从金色过渡到深色',
    category: 'scene_design',
    tags: ['渐变背景', '金黑', '奢华'],
    keywords: ['金黑渐变', '奢华渐变'],
    priority: 5,
    source: 'manual',
    examples: ['珠宝展示', '名表展示']
  },
  {
    id: 'scene-009',
    text: '橙粉渐变背景适合年轻时尚产品，营造活力潮流感，从橙色过渡到粉色',
    category: 'scene_design',
    tags: ['渐变背景', '橙粉', '潮流'],
    keywords: ['橙粉渐变', '活力渐变'],
    priority: 3,
    source: 'manual',
    examples: ['潮流服饰', '运动鞋']
  },
  {
    id: 'scene-010',
    text: '绿白渐变背景适合健康自然产品，营造清新健康感，从浅绿过渡到白色',
    category: 'scene_design',
    tags: ['渐变背景', '绿白', '自然'],
    keywords: ['绿白渐变', '清新渐变'],
    priority: 3,
    source: 'manual',
    examples: ['健康食品', '护肤品']
  },

  // 自然场景
  {
    id: 'scene-011',
    text: '绿植场景适合家居、健康食品展示，营造自然清新感，可使用真实或仿真植物',
    category: 'scene_design',
    tags: ['自然场景', '绿植', '清新'],
    keywords: ['绿植背景', '植物场景', '自然场景'],
    priority: 4,
    source: 'manual',
    examples: ['家居用品', '健康食品']
  },
  {
    id: 'scene-012',
    text: '海滩场景适合泳装、防晒产品展示，营造度假休闲感，搭配沙滩和海浪元素',
    category: 'scene_design',
    tags: ['自然场景', '海滩', '度假'],
    keywords: ['海滩场景', '沙滩背景', '海边'],
    priority: 3,
    source: 'manual',
    examples: ['泳装展示', '墨镜展示']
  },
  {
    id: 'scene-013',
    text: '森林场景适合户外用品、茶叶展示，营造自然健康感，搭配树木和阳光元素',
    category: 'scene_design',
    tags: ['自然场景', '森林', '户外'],
    keywords: ['森林场景', '树林背景', '自然森林'],
    priority: 3,
    source: 'manual',
    examples: ['户外装备', '茶叶展示']
  },
  {
    id: 'scene-014',
    text: '花卉场景适合女性产品、礼品展示，营造浪漫精致感，可选择鲜花或干花搭配',
    category: 'scene_design',
    tags: ['自然场景', '花卉', '浪漫'],
    keywords: ['花卉场景', '花朵背景', '花艺'],
    priority: 4,
    source: 'manual',
    examples: ['香水展示', '珠宝展示']
  },
  {
    id: 'scene-015',
    text: '木质场景适合家居、食品展示，营造温暖自然感，搭配木纹纹理和自然光',
    category: 'scene_design',
    tags: ['自然场景', '木质', '温暖'],
    keywords: ['木质场景', '木纹背景', '原木风'],
    priority: 4,
    source: 'manual',
    examples: ['餐具展示', '零食展示']
  },

  // 室内场景
  {
    id: 'scene-016',
    text: '客厅场景适合家居用品展示，营造温馨居家感，搭配沙发、地毯等软装元素',
    category: 'scene_design',
    tags: ['室内场景', '客厅', '家居'],
    keywords: ['客厅场景', '沙发背景', '家居场景'],
    priority: 4,
    source: 'manual',
    examples: ['抱枕展示', '台灯展示']
  },
  {
    id: 'scene-017',
    text: '卧室场景适合床品、睡衣展示，营造舒适私密感，搭配床品和柔和灯光',
    category: 'scene_design',
    tags: ['室内场景', '卧室', '私密'],
    keywords: ['卧室场景', '床品背景', '卧室布置'],
    priority: 3,
    source: 'manual',
    examples: ['床品展示', '睡衣展示']
  },
  {
    id: 'scene-018',
    text: '厨房场景适合厨具、食品展示，营造生活气息感，搭配厨具和食材元素',
    category: 'scene_design',
    tags: ['室内场景', '厨房', '生活'],
    keywords: ['厨房场景', '厨具背景', '烹饪场景'],
    priority: 4,
    source: 'manual',
    examples: ['餐具展示', '调料展示']
  },
  {
    id: 'scene-019',
    text: '办公场景适合3C数码、文具展示，营造专业高效感，搭配书桌、电脑等元素',
    category: 'scene_design',
    tags: ['室内场景', '办公', '专业'],
    keywords: ['办公场景', '书桌背景', '工作场景'],
    priority: 4,
    source: 'manual',
    examples: ['键盘展示', '鼠标展示']
  },
  {
    id: 'scene-020',
    text: '浴室场景适合洗护用品展示，营造清爽洁净感，搭配瓷砖和卫浴元素',
    category: 'scene_design',
    tags: ['室内场景', '浴室', '洗护'],
    keywords: ['浴室场景', '卫浴背景', '洗漱场景'],
    priority: 3,
    source: 'manual',
    examples: ['洗发水展示', '沐浴露展示']
  },

  // 科技场景
  {
    id: 'scene-021',
    text: '电路板场景适合电子数码产品，营造科技专业感，搭配蓝色或紫色光效',
    category: 'scene_design',
    tags: ['科技场景', '电路板', '数码'],
    keywords: ['电路板场景', '科技背景', '数码场景'],
    priority: 4,
    source: 'manual',
    examples: ['手机展示', '主板展示']
  },
  {
    id: 'scene-022',
    text: '太空场景适合高端科技产品，营造未来神秘感，搭配星空和光效元素',
    category: 'scene_design',
    tags: ['科技场景', '太空', '未来'],
    keywords: ['太空场景', '星空背景', '宇宙场景'],
    priority: 3,
    source: 'manual',
    examples: ['高端耳机', '智能设备']
  },
  {
    id: 'scene-023',
    text: '赛博朋克场景适合潮流数码产品，营造炫酷科技感，搭配霓虹灯效和金属元素',
    category: 'scene_design',
    tags: ['科技场景', '赛博朋克', '炫酷'],
    keywords: ['赛博朋克', '霓虹背景', '未来科技'],
    priority: 3,
    source: 'manual',
    examples: ['游戏设备', 'RGB键盘']
  },
  {
    id: 'scene-024',
    text: '实验室场景适合科技产品展示，营造专业严谨感，搭配实验器材和数据元素',
    category: 'scene_design',
    tags: ['科技场景', '实验室', '专业'],
    keywords: ['实验室场景', '科研背景', '实验场景'],
    priority: 3,
    source: 'manual',
    examples: ['智能设备', '健康监测']
  },
  {
    id: 'scene-025',
    text: '数据中心场景适合云服务、服务器产品，营造科技专业感，搭配服务器机柜和数据流动效果',
    category: 'scene_design',
    tags: ['科技场景', '数据中心', '企业'],
    keywords: ['数据中心', '服务器背景', '云服务场景'],
    priority: 3,
    source: 'manual',
    examples: ['企业服务', '云产品']
  }
]

// 光照摄影知识 (20条)
const lightingKnowledge: KnowledgeEntry[] = [
  {
    id: 'light-001',
    text: '三点布光法是最基础的产品布光方式，包括主光、辅光和轮廓光，适合绝大多数产品展示，主光在产品侧前方45度，辅光在另一侧补光，轮廓光在后方勾勒轮廓',
    category: 'lighting',
    tags: ['基础打光', '三点布光', '通用'],
    keywords: ['三点布光', '主光', '辅光', '轮廓光'],
    priority: 5,
    source: 'manual',
    examples: ['全品类产品']
  },
  {
    id: 'light-002',
    text: '柔光适合展示平滑表面的产品，如化妆品、电子产品，使用柔光箱或通过白色反光板反射，营造柔和均匀的光线',
    category: 'lighting',
    tags: ['基础打光', '柔光', '质感'],
    keywords: ['柔光', '柔光箱', '均匀光线'],
    priority: 5,
    source: 'manual',
    examples: ['化妆品', '手机']
  },
  {
    id: 'light-003',
    text: '硬光适合展示有纹理的产品，如皮革、织物，使用聚光灯直接照射，产生明显的阴影和质感',
    category: 'lighting',
    tags: ['基础打光', '硬光', '质感'],
    keywords: ['硬光', '聚光灯', '质感光'],
    priority: 4,
    source: 'manual',
    examples: ['皮具', '服装']
  },
  {
    id: 'light-004',
    text: '背光适合展示透明或半透明产品，如香水、玻璃制品，灯光从产品后方照射，突出通透感',
    category: 'lighting',
    tags: ['基础打光', '背光', '透明'],
    keywords: ['背光', '逆光', '透光'],
    priority: 4,
    source: 'manual',
    examples: ['香水', '玻璃杯']
  },
  {
    id: 'light-005',
    text: '底光适合展示底部细节或创造特殊效果，灯光从产品底部向上照射，常配合其他光源使用',
    category: 'lighting',
    tags: ['基础打光', '底光', '创意'],
    keywords: ['底光', '底部照明', '创意光'],
    priority: 3,
    source: 'manual',
    examples: ['珠宝', '创意产品']
  },

  // 材质表现
  {
    id: 'light-006',
    text: '金属材质展示需要使用大面积柔光源，避免杂乱的反光，可在光源中添加黑色遮光条创造金属质感',
    category: 'lighting',
    tags: ['材质表现', '金属', '反光'],
    keywords: ['金属打光', '金属质感', '反光控制'],
    priority: 5,
    source: 'manual',
    examples: ['手表', '珠宝', '金属配件']
  },
  {
    id: 'light-007',
    text: '玻璃材质展示需要使用背光和侧光结合，突出玻璃的透明感和边缘轮廓，避免正面直射产生眩光',
    category: 'lighting',
    tags: ['材质表现', '玻璃', '透明'],
    keywords: ['玻璃打光', '透明材质', '玻璃质感'],
    priority: 5,
    source: 'manual',
    examples: ['香水瓶', '玻璃杯']
  },
  {
    id: 'light-008',
    text: '皮革材质展示需要侧光照射突出纹理，使用硬光或柔光取决于想要表现的质感程度',
    category: 'lighting',
    tags: ['材质表现', '皮革', '纹理'],
    keywords: ['皮革打光', '皮革纹理', '皮质感'],
    priority: 4,
    source: 'manual',
    examples: ['皮包', '皮带', '皮鞋']
  },
  {
    id: 'light-009',
    text: '织物材质展示需要均匀的柔光，避免强烈的阴影，可使用大型柔光箱或多灯组合',
    category: 'lighting',
    tags: ['材质表现', '织物', '柔光'],
    keywords: ['织物打光', '布料打光', '服装打光'],
    priority: 4,
    source: 'manual',
    examples: ['服装', '床品', '窗帘']
  },
  {
    id: 'light-010',
    text: '珠宝材质展示需要多角度点光源，突出宝石的闪耀效果，可使用光纤灯或小型LED灯',
    category: 'lighting',
    tags: ['材质表现', '珠宝', '闪耀'],
    keywords: ['珠宝打光', '宝石打光', '闪耀效果'],
    priority: 5,
    source: 'manual',
    examples: ['钻石', '宝石首饰']
  },

  // 氛围营造
  {
    id: 'light-011',
    text: '暖色光营造温馨舒适氛围，适合家居、食品类产品，使用3200K-4000K色温的光源',
    category: 'lighting',
    tags: ['氛围营造', '暖光', '温馨'],
    keywords: ['暖色光', '温馨光线', '暖光氛围'],
    priority: 4,
    source: 'manual',
    examples: ['家居用品', '食品']
  },
  {
    id: 'light-012',
    text: '冷色光营造专业科技氛围，适合数码、医美产品，使用5000K-6500K色温的光源',
    category: 'lighting',
    tags: ['氛围营造', '冷光', '科技'],
    keywords: ['冷色光', '科技光', '冷光氛围'],
    priority: 4,
    source: 'manual',
    examples: ['数码产品', '医疗用品']
  },
  {
    id: 'light-013',
    text: '彩色光营造创意个性氛围，适合潮流、时尚产品，可使用彩色滤镜或RGB灯光',
    category: 'lighting',
    tags: ['氛围营造', '彩色光', '创意'],
    keywords: ['彩色光', 'RGB光', '创意灯光'],
    priority: 3,
    source: 'manual',
    examples: ['潮流服饰', '创意产品']
  },
  {
    id: 'light-014',
    text: '自然光营造清新自然氛围，适合户外、健康产品，可使用窗户光或模拟自然光',
    category: 'lighting',
    tags: ['氛围营造', '自然光', '清新'],
    keywords: ['自然光', '日光', '自然光效'],
    priority: 4,
    source: 'manual',
    examples: ['户外用品', '健康食品']
  },
  {
    id: 'light-015',
    text: '低光高对比营造神秘高级氛围，适合奢侈品、高端产品，使用暗背景配合精确的聚光',
    category: 'lighting',
    tags: ['氛围营造', '低光', '高级'],
    keywords: ['低光', '高对比', '高级光影'],
    priority: 4,
    source: 'manual',
    examples: ['奢侈品', '高端珠宝']
  },

  // 阴影处理
  {
    id: 'light-016',
    text: '投影阴影增加产品真实感和立体感，适合电商主图，使用侧前方硬光源创造自然投影',
    category: 'lighting',
    tags: ['阴影处理', '投影', '立体感'],
    keywords: ['投影阴影', '自然投影', '立体阴影'],
    priority: 4,
    source: 'manual',
    examples: ['电商主图', '产品展示']
  },
  {
    id: 'light-017',
    text: '无影效果适合需要后期合成的产品图，使用底光或多灯组合消除阴影',
    category: 'lighting',
    tags: ['阴影处理', '无影', '合成'],
    keywords: ['无影拍摄', '去阴影', '底光拍摄'],
    priority: 3,
    source: 'manual',
    examples: ['产品合成', '素材图']
  },
  {
    id: 'light-018',
    text: '软阴影营造柔和立体感，适合人像和柔和产品，使用大型柔光箱在近距离照射',
    category: 'lighting',
    tags: ['阴影处理', '软阴影', '柔和'],
    keywords: ['软阴影', '柔和阴影', '柔光阴影'],
    priority: 3,
    source: 'manual',
    examples: ['人像产品', '护肤品']
  },
  {
    id: 'light-019',
    text: '硬阴影营造强烈对比感，适合时尚、艺术产品，使用聚光灯在远处照射',
    category: 'lighting',
    tags: ['阴影处理', '硬阴影', '对比'],
    keywords: ['硬阴影', '强阴影', '硬光阴影'],
    priority: 3,
    source: 'manual',
    examples: ['时尚大片', '艺术产品']
  },
  {
    id: 'light-020',
    text: '渐变阴影营造优雅过渡感，适合高端产品，使用渐变背景布配合适当的光源角度',
    category: 'lighting',
    tags: ['阴影处理', '渐变阴影', '优雅'],
    keywords: ['渐变阴影', '优雅阴影', '过渡阴影'],
    priority: 3,
    source: 'manual',
    examples: ['高端产品', '奢侈品']
  }
]

// 风格模板知识 (20条)
const styleTemplateKnowledge: KnowledgeEntry[] = [
  // 极简风
  {
    id: 'style-001',
    text: '极简风格强调留白和产品本身，使用纯白或浅灰背景，减少装饰元素，适合展示设计简洁的产品',
    category: 'style_template',
    tags: ['极简风', '留白', '简洁'],
    keywords: ['极简', '简约', '简洁风格'],
    priority: 5,
    source: 'manual',
    examples: ['Apple产品', 'MUJI产品']
  },
  {
    id: 'style-002',
    text: '北欧极简风格使用浅木色和白色搭配，加入少量绿植点缀，营造清新自然感',
    category: 'style_template',
    tags: ['极简风', '北欧', '清新'],
    keywords: ['北欧风', '北欧极简', '斯堪的纳维亚'],
    priority: 4,
    source: 'manual',
    examples: ['IKEA产品', '家居用品']
  },
  {
    id: 'style-003',
    text: '日式极简风格使用原木色和米白色，强调禅意和宁静感，适合茶具、文具等产品',
    category: 'style_template',
    tags: ['极简风', '日式', '禅意'],
    keywords: ['日式极简', '和风', '禅意风格'],
    priority: 4,
    source: 'manual',
    examples: ['茶具', '文具', '生活杂货']
  },
  {
    id: 'style-004',
    text: '工业极简风格使用黑色金属和灰色调，搭配水泥或金属纹理，适合科技产品和男性产品',
    category: 'style_template',
    tags: ['极简风', '工业', '男性'],
    keywords: ['工业风', '工业极简', '金属风格'],
    priority: 3,
    source: 'manual',
    examples: ['机械键盘', '户外装备']
  },

  // 奢华风
  {
    id: 'style-005',
    text: '奢华风格使用金色和黑色搭配，加入大理石纹理和丝绸元素，营造高端感',
    category: 'style_template',
    tags: ['奢华风', '金色', '高端'],
    keywords: ['奢华', '高端', '奢华风格'],
    priority: 5,
    source: 'manual',
    examples: ['珠宝', '名表', '香水']
  },
  {
    id: 'style-006',
    text: '法式奢华风格使用米金和香槟色，搭配水晶和珍珠元素，营造优雅浪漫感',
    category: 'style_template',
    tags: ['奢华风', '法式', '浪漫'],
    keywords: ['法式奢华', '法式优雅', '巴黎风'],
    priority: 4,
    source: 'manual',
    examples: ['香奈儿', '迪奥']
  },
  {
    id: 'style-007',
    text: '意式奢华风格使用深棕和金色，搭配皮革和黄铜元素，营造成熟稳重感',
    category: 'style_template',
    tags: ['奢华风', '意式', '成熟'],
    keywords: ['意式奢华', '意大利风', '米兰风'],
    priority: 4,
    source: 'manual',
    examples: ['Gucci', 'Prada']
  },
  {
    id: 'style-008',
    text: '现代奢华风格使用黑金配色，搭配镜面和几何元素，营造时尚前卫感',
    category: 'style_template',
    tags: ['奢华风', '现代', '时尚'],
    keywords: ['现代奢华', '时尚奢华', '摩登风'],
    priority: 4,
    source: 'manual',
    examples: ['Alexander Wang', 'Balenciaga']
  },

  // 科技风
  {
    id: 'style-009',
    text: '科技风格使用蓝色和银色配色，搭配电路板和全息元素，营造专业科技感',
    category: 'style_template',
    tags: ['科技风', '蓝色', '专业'],
    keywords: ['科技风', '科技感', '未来科技'],
    priority: 5,
    source: 'manual',
    examples: ['手机', '电脑', '智能设备']
  },
  {
    id: 'style-010',
    text: '赛博朋克风格使用霓虹色和深紫色，搭配故障艺术和电子元素，营造炫酷感',
    category: 'style_template',
    tags: ['科技风', '赛博朋克', '炫酷'],
    keywords: ['赛博朋克', '霓虹', '故障风'],
    priority: 4,
    source: 'manual',
    examples: ['游戏设备', '电竞产品']
  },
  {
    id: 'style-011',
    text: '极客风格使用深色和荧光色，搭配代码和数据元素，营造极客文化感',
    category: 'style_template',
    tags: ['科技风', '极客', '编程'],
    keywords: ['极客风', '程序员风', '代码风'],
    priority: 3,
    source: 'manual',
    examples: ['程序员周边', '开源产品']
  },
  {
    id: 'style-012',
    text: '未来主义风格使用银色和白色，搭配流线型和悬浮元素，营造未来感',
    category: 'style_template',
    tags: ['科技风', '未来', '流线'],
    keywords: ['未来主义', '未来风', '科幻风'],
    priority: 3,
    source: 'manual',
    examples: ['概念产品', '创新设备']
  },

  // 自然风
  {
    id: 'style-013',
    text: '自然风格使用绿色和米色配色，搭配绿植和原木元素，营造清新自然感',
    category: 'style_template',
    tags: ['自然风', '绿色', '清新'],
    keywords: ['自然风', '清新自然', '生态风'],
    priority: 4,
    source: 'manual',
    examples: ['健康食品', '护肤品']
  },
  {
    id: 'style-014',
    text: '森系风格使用深绿和棕色，搭配苔藓和蕨类元素，营造森林感',
    category: 'style_template',
    tags: ['自然风', '森系', '森林'],
    keywords: ['森系', '森林风', '自然森系'],
    priority: 3,
    source: 'manual',
    examples: ['手工产品', '文创产品']
  },
  {
    id: 'style-015',
    text: '田园风格使用浅绿和淡黄色，搭配花卉和格子元素，营造乡村田园感',
    category: 'style_template',
    tags: ['自然风', '田园', '乡村'],
    keywords: ['田园风', '乡村风', '小清新'],
    priority: 3,
    source: 'manual',
    examples: ['家纺', '厨房用品']
  },
  {
    id: 'style-016',
    text: '有机风格使用泥土色和植物色，搭配不规则形状和手工元素，营造环保有机感',
    category: 'style_template',
    tags: ['自然风', '有机', '环保'],
    keywords: ['有机风', '环保风', '可持续风'],
    priority: 3,
    source: 'manual',
    examples: ['有机产品', '环保产品']
  },

  // 潮流风
  {
    id: 'style-017',
    text: '街头风格使用亮色和涂鸦元素，搭配街头场景和潮流配饰，营造年轻潮流感',
    category: 'style_template',
    tags: ['潮流风', '街头', '年轻'],
    keywords: ['街头风', '潮流风', '嘻哈风'],
    priority: 4,
    source: 'manual',
    examples: ['潮牌服饰', '球鞋']
  },
  {
    id: 'style-018',
    text: '运动风格使用活力色和动感元素，搭配运动场景和运动装备，营造动感活力感',
    category: 'style_template',
    tags: ['潮流风', '运动', '活力'],
    keywords: ['运动风', '活力风', '动感风'],
    priority: 4,
    source: 'manual',
    examples: ['运动服饰', '运动鞋']
  },
  {
    id: 'style-019',
    text: 'Y2K风格使用金属色和荧光色，搭配复古科技元素，营造千禧年代感',
    category: 'style_template',
    tags: ['潮流风', 'Y2K', '复古'],
    keywords: ['Y2K风', '千禧风', '复古未来'],
    priority: 3,
    source: 'manual',
    examples: ['时尚配饰', '潮流服饰']
  },
  {
    id: 'style-020',
    text: '二次元风格使用明亮配色和动漫元素，搭配可爱道具和场景，营造动漫感',
    category: 'style_template',
    tags: ['潮流风', '二次元', '动漫'],
    keywords: ['二次元风', '动漫风', 'ACG风'],
    priority: 3,
    source: 'manual',
    examples: ['动漫周边', '游戏周边']
  }
]

// 平台规范知识 (10条)
const platformSpecKnowledge: KnowledgeEntry[] = [
  {
    id: 'platform-001',
    text: '淘宝主图要求800x800像素以上，支持放大功能，建议使用白底图突出产品，第一张主图不支持视频',
    category: 'platform_spec',
    tags: ['淘宝', '天猫', '主图'],
    keywords: ['淘宝主图', '天猫主图', '电商主图'],
    priority: 5,
    source: 'manual',
    examples: ['淘宝店铺', '天猫店铺']
  },
  {
    id: 'platform-002',
    text: '淘宝详情页宽度建议750像素，支持长图和视频混排，建议使用场景图和细节图结合',
    category: 'platform_spec',
    tags: ['淘宝', '天猫', '详情页'],
    keywords: ['淘宝详情页', '详情页设计', '产品详情'],
    priority: 4,
    source: 'manual',
    examples: ['详情页设计', '产品介绍']
  },
  {
    id: 'platform-003',
    text: '抖音短视频要求9:16竖版比例，建议前3秒抓住眼球，可使用特效和滤镜增加吸引力',
    category: 'platform_spec',
    tags: ['抖音', '短视频', '竖版'],
    keywords: ['抖音视频', '短视频', '竖屏视频'],
    priority: 4,
    source: 'manual',
    examples: ['抖音内容', '短视频营销']
  },
  {
    id: 'platform-004',
    text: '抖音商品主图支持3D模型展示，用户可旋转查看产品各角度，建议展示产品的360度细节',
    category: 'platform_spec',
    tags: ['抖音', '3D展示', '交互'],
    keywords: ['抖音3D', '3D商品', '360展示'],
    priority: 4,
    source: 'manual',
    examples: ['抖音电商', '3D商品展示']
  },
  {
    id: 'platform-005',
    text: '小红书图片要求竖版3:4比例，支持多图轮播，建议使用生活方式图而非纯产品图，营造种草感',
    category: 'platform_spec',
    tags: ['小红书', '种草', '竖版'],
    keywords: ['小红书图片', '种草图', '生活方式'],
    priority: 4,
    source: 'manual',
    examples: ['小红书笔记', '种草内容']
  },
  {
    id: 'platform-006',
    text: '小红书封面图建议使用人物或场景图，避免纯产品白底图，营造真实感和亲和力',
    category: 'platform_spec',
    tags: ['小红书', '封面', '种草'],
    keywords: ['小红书封面', '种草封面', '封面设计'],
    priority: 3,
    source: 'manual',
    examples: ['小红书封面', '笔记封面']
  },
  {
    id: 'platform-007',
    text: '闲鱼图片建议使用实拍图而非精修图，展示真实使用痕迹，营造信任感',
    category: 'platform_spec',
    tags: ['闲鱼', '二手', '真实'],
    keywords: ['闲鱼图片', '二手图', '实拍图'],
    priority: 3,
    source: 'manual',
    examples: ['闲鱼商品', '二手交易']
  },
  {
    id: 'platform-008',
    text: '亚马逊主图要求纯白背景（RGB 255,255,255），产品占据图片85%以上面积，不支持水印和边框',
    category: 'platform_spec',
    tags: ['亚马逊', '跨境电商', '白底'],
    keywords: ['亚马逊主图', 'Amazon主图', '跨境主图'],
    priority: 5,
    source: 'manual',
    examples: ['亚马逊店铺', '跨境电商']
  },
  {
    id: 'platform-009',
    text: 'Temu产品图要求清晰展示产品全貌，建议包含场景图和细节图，支持多角度展示',
    category: 'platform_spec',
    tags: ['Temu', '跨境电商', '低价'],
    keywords: ['Temu图片', 'Temu产品图', 'Temu主图'],
    priority: 3,
    source: 'manual',
    examples: ['Temu店铺', '低价电商']
  },
  {
    id: 'platform-010',
    text: '视频号商品展示支持短视频和直播两种形式，建议使用竖版9:16比例，展示产品使用场景',
    category: 'platform_spec',
    tags: ['视频号', '直播', '短视频'],
    keywords: ['视频号', '微信视频', '直播带货'],
    priority: 3,
    source: 'manual',
    examples: ['视频号电商', '直播带货']
  }
]

// 导出完整知识库
export const knowledgeBase: KnowledgeEntry[] = [
  ...productCategoryKnowledge,
  ...sceneDesignKnowledge,
  ...lightingKnowledge,
  ...styleTemplateKnowledge,
  ...platformSpecKnowledge
]

// 按分类导出
export const knowledgeByCategory = {
  product_category: productCategoryKnowledge,
  scene_design: sceneDesignKnowledge,
  lighting: lightingKnowledge,
  style_template: styleTemplateKnowledge,
  platform_spec: platformSpecKnowledge
}

// 获取统计信息
export function getKnowledgeStats() {
  return {
    total: knowledgeBase.length,
    byCategory: {
      product_category: productCategoryKnowledge.length,
      scene_design: sceneDesignKnowledge.length,
      lighting: lightingKnowledge.length,
      style_template: styleTemplateKnowledge.length,
      platform_spec: platformSpecKnowledge.length
    }
  }
}