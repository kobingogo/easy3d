/**
 * 知识库数据
 * 包含 130+ 条专业知识条目
 */

import type { KnowledgeEntry } from '../lib/rag/types'

// 商品品类知识 (200条) - 大幅扩充
const productCategoryKnowledge: KnowledgeEntry[] = [
  // ==================== 口红/美妆类 (40条) ====================
  // 口红基础
  {
    id: 'prod-001',
    text: '口红类化妆品适合纯色背景搭配柔光拍摄，推荐使用粉色或渐变背景突出女性气质，展示时建议45度斜角摆放，重点展示膏体质感和颜色饱和度',
    category: 'product_category',
    tags: ['化妆品', '口红', '美妆'],
    keywords: ['口红', '唇膏', '彩妆', '唇釉', '唇彩', 'lipstick', '唇部彩妆'],
    priority: 5,
    source: 'manual',
    examples: ['YSL口红', 'MAC口红', '迪奥口红', '香奈儿口红', '阿玛尼口红', 'TF口红']
  },
  // 口红-哑光质地
  {
    id: 'prod-001a',
    text: '哑光口红展示建议使用深色或渐变背景，突出高级质感，灯光从侧前方45度照射强调膏体纹理，避免过度反光，适合小红书和抖音平台展示',
    category: 'product_category',
    tags: ['化妆品', '口红', '哑光', '高级'],
    keywords: ['哑光口红', '雾面口红', 'matte lipstick', '丝绒口红', '哑光唇膏', '高级口红'],
    priority: 5,
    source: 'manual',
    examples: ['MAC哑光系列', '阿玛尼红管', 'YSL小金条', 'TF黑管哑光']
  },
  // 口红-滋润质地
  {
    id: 'prod-001b',
    text: '滋润型口红展示建议使用浅色背景，突出光泽感和滋润度，灯光从后方照射创造通透效果，展示时微微倾斜角度展现膏体光泽',
    category: 'product_category',
    tags: ['化妆品', '口红', '滋润', '光泽'],
    keywords: ['滋润口红', '水光唇釉', '镜面口红', 'glossy lipstick', '唇蜜', '亮泽口红'],
    priority: 5,
    source: 'manual',
    examples: ['Dior唇釉', '香奈儿水光', 'YSL唇油', '阿玛尼唇釉']
  },
  // 口红-金属质感
  {
    id: 'prod-001c',
    text: '金属质感口红管身展示需要大面积柔光源，避免杂乱反光，背景使用黑色或深蓝渐变，灯光从两侧照射突出金属光泽，展示Logo细节',
    category: 'product_category',
    tags: ['化妆品', '口红', '金属', '包装'],
    keywords: ['金属口红', '金色口红', '奢华包装', '高端口红', '金属质感', '口红管'],
    priority: 4,
    source: 'manual',
    examples: ['YSL金管', 'Dior金管', 'TF黑金', '香奈儿金属管']
  },
  // 口红-小众品牌
  {
    id: 'prod-001d',
    text: '小众品牌口红展示建议突出品牌故事和独特设计，使用简约背景配合艺术道具，营造独立小众氛围，适合小红书种草风格',
    category: 'product_category',
    tags: ['化妆品', '口红', '小众', '独立'],
    keywords: ['小众口红', '独立品牌', 'niche lipstick', '设计师口红', '小众彩妆', '国货口红'],
    priority: 4,
    source: 'manual',
    examples: ['Kiko口红', 'Zoeva口红', '花知晓', '橘朵', '完美日记']
  },
  // 口红-国货品牌
  {
    id: 'prod-001e',
    text: '国货口红展示建议融入中国风元素，使用红色或金色点缀，展示性价比和品质感，背景可搭配传统纹样，适合抖音和小红书推广',
    category: 'product_category',
    tags: ['化妆品', '口红', '国货', '中国风'],
    keywords: ['国货口红', '中国品牌', '国产口红', '国潮口红', '花西子', '毛戈平'],
    priority: 5,
    source: 'manual',
    examples: ['花西子同心锁', '毛戈平红管', '完美日记', '花知晓', 'colorkey']
  },
  // 口红-礼盒套装
  {
    id: 'prod-001f',
    text: '口红礼盒展示建议俯视角度展示整体包装，搭配丝带或花瓣道具，使用暖色调灯光营造节日氛围，突出礼盒的高级感和仪式感',
    category: 'product_category',
    tags: ['化妆品', '口红', '礼盒', '套装'],
    keywords: ['口红礼盒', '口红套装', 'gift set', '节日礼盒', '圣诞套装', '限量礼盒'],
    priority: 5,
    source: 'manual',
    examples: ['YSL圣诞礼盒', 'Dior新年套装', 'TF限量礼盒', '香奈儿节日套装']
  },
  // 口红-迷你装
  {
    id: 'prod-001g',
    text: '迷你口红展示建议多支组合摆放，创造视觉丰富度，使用白色或粉色背景，展示便携性和性价比，适合电商主图',
    category: 'product_category',
    tags: ['化妆品', '口红', '迷你', '便携'],
    keywords: ['迷你口红', '小样口红', 'mini lipstick', '旅行装', '便携口红', '口红小样'],
    priority: 4,
    source: 'manual',
    examples: ['MAC迷你套装', 'YSL小样', 'Dior迷你', '香奈儿小样']
  },
  // 口红-创新形态
  {
    id: 'prod-001h',
    text: '液体口红、唇笔等创新形态产品展示建议突出使用方式和便捷性，对比传统口红展示差异化优势，搭配手部展示使用效果',
    category: 'product_category',
    tags: ['化妆品', '口红', '创新', '形态'],
    keywords: ['液体口红', '唇笔', '唇线笔', '唇膏笔', '创新口红', '新型口红'],
    priority: 4,
    source: 'manual',
    examples: ['植村秀唇笔', 'NARS唇笔', 'YSL唇釉笔', '阿玛尼唇膏笔']
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
  },

  // ==================== 护肤品类 (30条) ====================
  // 精华液
  {
    id: 'prod-035',
    text: '精华液产品展示建议使用深色玻璃瓶装，搭配白色或浅灰背景，突出产品的高效成分和科技感，可加入水滴或光效元素',
    category: 'product_category',
    tags: ['护肤品', '精华', '高端'],
    keywords: ['精华液', '精华素', 'serum', '护肤精华', '面部精华', '精华露'],
    priority: 5,
    source: 'manual',
    examples: ['雅诗兰黛小棕瓶', '兰蔻小黑瓶', 'SK-II神仙水', '资生堂红腰子']
  },
  {
    id: 'prod-035a',
    text: '抗老精华展示建议使用金色或银色包装元素，搭配专业科技背景，突出抗衰老功效和高端定位，适合天猫和京东平台',
    category: 'product_category',
    tags: ['护肤品', '精华', '抗老'],
    keywords: ['抗老精华', '抗衰老精华', 'anti-aging serum', '紧致精华', '淡纹精华'],
    priority: 5,
    source: 'manual',
    examples: ['雅诗兰黛小棕瓶', '兰蔻小黑瓶', '资生堂红腰子', '赫莲娜绿宝瓶']
  },
  {
    id: 'prod-035b',
    text: '美白精华展示建议使用明亮的白色背景，搭配水润元素，突出美白提亮功效，展示产品质地轻盈通透',
    category: 'product_category',
    tags: ['护肤品', '精华', '美白'],
    keywords: ['美白精华', '淡斑精华', 'whitening serum', '提亮精华', '亮白精华'],
    priority: 4,
    source: 'manual',
    examples: ['SK-II神仙水', 'OLAY小白瓶', '倩碧淡斑精华', '修丽可CE']
  },
  {
    id: 'prod-035c',
    text: '补水精华展示建议搭配水元素和植物元素，使用蓝色或绿色背景，突出补水保湿功效，展示产品的清爽质地',
    category: 'product_category',
    tags: ['护肤品', '精华', '补水'],
    keywords: ['补水精华', '保湿精华', 'hydrating serum', '玻尿酸精华', '水润精华'],
    priority: 4,
    source: 'manual',
    examples: ['科颜氏玻尿酸', '倩碧水磁场', '薇诺娜精华', 'HADA LABO精华']
  },
  // 面霜
  {
    id: 'prod-036',
    text: '面霜产品展示建议使用广口瓶造型，搭配优雅背景，展示产品质地和滋润效果，可加入勺子道具展示用量',
    category: 'product_category',
    tags: ['护肤品', '面霜', '保湿'],
    keywords: ['面霜', 'face cream', '保湿霜', '日霜', '晚霜'],
    priority: 5,
    source: 'manual',
    examples: ['海蓝之谜面霜', '赫莲娜黑绷带', '兰蔻菁纯面霜', 'SK-II大红瓶']
  },
  {
    id: 'prod-036a',
    text: '高端面霜展示建议使用金色或黑色包装元素，搭配奢华背景，突出品牌调性和高端定位，灯光从侧方照射突出瓶身质感',
    category: 'product_category',
    tags: ['护肤品', '面霜', '奢华'],
    keywords: ['高端面霜', '奢华面霜', 'premium cream', '贵妇面霜', '顶级面霜'],
    priority: 5,
    source: 'manual',
    examples: ['海蓝之谜', '赫莲娜黑绷带', '兰蔻菁纯', 'CPB面霜']
  },
  {
    id: 'prod-036b',
    text: '清爽型面霜展示建议使用浅色背景，搭配冰块或水元素，突出清爽不油腻的特点，适合夏季推广',
    category: 'product_category',
    tags: ['护肤品', '面霜', '清爽'],
    keywords: ['清爽面霜', '凝霜', 'gel cream', '啫喱面霜', '水凝霜'],
    priority: 4,
    source: 'manual',
    examples: ['倩碧水磁场', '科颜氏果冻霜', '芙丽芳丝面霜', '悦木之源面霜']
  },
  // 眼霜
  {
    id: 'prod-037',
    text: '眼霜产品展示建议搭配眼部特写或按摩棒道具，突出淡化细纹和黑眼圈功效，使用柔和灯光展示精致包装',
    category: 'product_category',
    tags: ['护肤品', '眼霜', '眼部护理'],
    keywords: ['眼霜', 'eye cream', '眼部精华', '抗皱眼霜', '黑眼圈眼霜'],
    priority: 5,
    source: 'manual',
    examples: ['雅诗兰黛眼霜', '兰蔻眼霜', '资生堂眼霜', 'HR眼霜']
  },
  {
    id: 'prod-037a',
    text: '抗老眼霜展示建议搭配金属按摩头元素，使用银色或金色背景，突出科技感和高端定位，适合35+人群推广',
    category: 'product_category',
    tags: ['护肤品', '眼霜', '抗老'],
    keywords: ['抗老眼霜', '抗皱眼霜', 'anti-aging eye cream', '紧致眼霜', '提拉眼霜'],
    priority: 5,
    source: 'manual',
    examples: ['雅诗兰黛小棕瓶眼霜', '兰蔻菁纯眼霜', 'HR绿宝瓶眼霜', '资生堂百优眼霜']
  },
  // 防晒
  {
    id: 'prod-038',
    text: '防晒产品展示建议搭配夏日海滩场景，突出防晒指数和防水特性，使用明亮清新的背景风格',
    category: 'product_category',
    tags: ['护肤品', '防晒', '夏季'],
    keywords: ['防晒霜', '防晒乳', 'sunscreen', '隔离防晒', '防晒喷雾'],
    priority: 5,
    source: 'manual',
    examples: ['安耐晒', '理肤泉防晒', '兰蔻防晒', '资生堂防晒']
  },
  {
    id: 'prod-038a',
    text: '物理防晒展示建议突出温和不刺激的特点，搭配敏感肌人群场景，使用清新自然的背景风格',
    category: 'product_category',
    tags: ['护肤品', '防晒', '物理防晒'],
    keywords: ['物理防晒', '敏感肌防晒', 'physical sunscreen', '矿物防晒', '温和防晒'],
    priority: 4,
    source: 'manual',
    examples: ['Fancl防晒', '理肤泉大哥大', '雅漾防晒', '薇诺娜防晒']
  },
  {
    id: 'prod-038b',
    text: '防晒喷雾展示建议搭配户外使用场景，突出便捷补涂的特点，使用动感活力背景，适合抖音推广',
    category: 'product_category',
    tags: ['护肤品', '防晒', '喷雾'],
    keywords: ['防晒喷雾', 'sunscreen spray', '便捷防晒', '补涂防晒', '户外防晒'],
    priority: 4,
    source: 'manual',
    examples: ['安耐晒喷雾', '娜丽丝防晒喷雾', '碧柔防晒喷雾', '妮维雅防晒喷雾']
  },
  // 洁面
  {
    id: 'prod-039',
    text: '洁面产品展示建议搭配泡沫场景，突出清洁力和温和性，使用清新干净的背景风格',
    category: 'product_category',
    tags: ['护肤品', '洁面', '清洁'],
    keywords: ['洁面乳', '洗面奶', 'cleanser', '洁面泡沫', '洁面膏'],
    priority: 4,
    source: 'manual',
    examples: ['芙丽芳丝洁面', 'Elta MD洁面', 'SK-II洁面', 'CPB洁面']
  },
  {
    id: 'prod-039a',
    text: '氨基酸洁面展示建议突出温和不紧绷的特点，搭配敏感肌人群场景，使用柔和的背景灯光',
    category: 'product_category',
    tags: ['护肤品', '洁面', '氨基酸'],
    keywords: ['氨基酸洁面', '温和洁面', 'amino acid cleanser', '敏感肌洁面', '低泡洁面'],
    priority: 4,
    source: 'manual',
    examples: ['芙丽芳丝洁面', 'Elta MD洁面', '适乐肤洁面', '薇诺娜洁面']
  },
  // 爽肤水/化妆水
  {
    id: 'prod-040',
    text: '爽肤水产品展示建议使用透明瓶装，搭配水元素和植物元素，突出补水二次清洁功效',
    category: 'product_category',
    tags: ['护肤品', '爽肤水', '化妆水'],
    keywords: ['爽肤水', '化妆水', 'toner', '柔肤水', '收敛水'],
    priority: 4,
    source: 'manual',
    examples: ['SK-II神仙水', '兰蔻粉水', '倩碧二次清洁水', '悦木之源菌菇水']
  },
  {
    id: 'prod-040a',
    text: '二次清洁水展示建议搭配化妆棉道具，突出清洁毛孔功效，使用清新干净的背景风格',
    category: 'product_category',
    tags: ['护肤品', '爽肤水', '清洁'],
    keywords: ['二次清洁水', '清洁水', 'clarifying lotion', '去角质水', '收敛水'],
    priority: 4,
    source: 'manual',
    examples: ['倩碧二次清洁水', 'SK-II神仙水', '悦木之源菌菇水', 'IPSA流金水']
  },

  // ==================== 美妆工具类 (20条) ====================
  {
    id: 'prod-041',
    text: '化妆刷套装展示建议搭配化妆包或刷架，展示完整的刷具组合，使用米色或粉色背景突出专业感',
    category: 'product_category',
    tags: ['美妆工具', '化妆刷', '套装'],
    keywords: ['化妆刷', 'brush set', '刷具套装', '彩妆刷', '专业刷具'],
    priority: 4,
    source: 'manual',
    examples: ['MAC化妆刷', 'Sigma刷具', '植村秀刷具', 'Real Techniques刷具']
  },
  {
    id: 'prod-041a',
    text: '粉底刷展示建议搭配粉底液产品，展示使用效果，使用干净简约的背景风格',
    category: 'product_category',
    tags: ['美妆工具', '化妆刷', '粉底'],
    keywords: ['粉底刷', 'foundation brush', '底妆刷', '平头刷', '舌形刷'],
    priority: 3,
    source: 'manual',
    examples: ['MAC粉底刷', 'Sigma粉底刷', '植村秀粉底刷', 'RT粉底刷']
  },
  {
    id: 'prod-041b',
    text: '眼影刷套装展示建议搭配眼影盘展示使用场景，展示不同刷型的用途，使用深色背景突出专业性',
    category: 'product_category',
    tags: ['美妆工具', '化妆刷', '眼影'],
    keywords: ['眼影刷', 'eye brush', '眼妆刷', '晕染刷', '铺色刷'],
    priority: 3,
    source: 'manual',
    examples: ['MAC眼影刷', 'Sigma眼影刷', 'Charlotte Tilbury刷具', 'Huda Beauty刷具']
  },
  {
    id: 'prod-042',
    text: '美妆蛋展示建议搭配粉底展示使用效果，展示遇水膨胀特性，使用清新活泼的背景风格',
    category: 'product_category',
    tags: ['美妆工具', '美妆蛋', '底妆'],
    keywords: ['美妆蛋', 'beauty blender', '海绵蛋', '粉扑', '气垫粉扑'],
    priority: 4,
    source: 'manual',
    examples: ['Beauty Blender', 'Real Techniques美妆蛋', '尔木萄美妆蛋', '3CE美妆蛋']
  },
  {
    id: 'prod-043',
    text: '睫毛夹展示建议搭配睫毛膏展示使用效果，展示夹翘效果，使用简约的白色背景',
    category: 'product_category',
    tags: ['美妆工具', '睫毛夹', '眼妆'],
    keywords: ['睫毛夹', 'eyelash curler', '睫毛卷翘器', '电睫毛夹', '局部睫毛夹'],
    priority: 3,
    source: 'manual',
    examples: ['植村秀睫毛夹', 'Suqqu睫毛夹', '无印良品睫毛夹', '资生堂睫毛夹']
  },
  {
    id: 'prod-044',
    text: '修眉刀展示建议搭配眉毛造型展示使用效果，使用简约干净的背景风格',
    category: 'product_category',
    tags: ['美妆工具', '修眉刀', '眉妆'],
    keywords: ['修眉刀', 'eyebrow razor', '眉刀', '修眉工具', '刮眉刀'],
    priority: 3,
    source: 'manual',
    examples: ['贝印修眉刀', '无印良品眉刀', '大创修眉刀', '资生堂眉刀']
  },
  {
    id: 'prod-045',
    text: '化妆镜展示建议搭配化妆场景，展示LED灯光效果，突出清晰度和专业感',
    category: 'product_category',
    tags: ['美妆工具', '化妆镜', 'LED'],
    keywords: ['化妆镜', 'makeup mirror', 'LED化妆镜', '台式化妆镜', '带灯化妆镜'],
    priority: 4,
    source: 'manual',
    examples: ['AMIRO化妆镜', 'MUID化妆镜', '斐色尔化妆镜', '网易严选化妆镜']
  },
  {
    id: 'prod-046',
    text: '卷发棒展示建议搭配卷发效果展示，展示温度调节和快速加热特点，使用时尚现代的背景风格',
    category: 'product_category',
    tags: ['美妆工具', '卷发棒', '美发'],
    keywords: ['卷发棒', 'curling iron', '卷发器', '自动卷发棒', '蛋卷棒'],
    priority: 4,
    source: 'manual',
    examples: ['戴森卷发棒', '松下卷发棒', '飞利浦卷发棒', 'lena卷发棒']
  },
  {
    id: 'prod-046a',
    text: '直发器展示建议搭配直发效果展示，展示快速加热和恒温特点，使用科技感背景',
    category: 'product_category',
    tags: ['美妆工具', '直发器', '美发'],
    keywords: ['直发器', 'hair straightener', '直板夹', '拉直板', '夹板'],
    priority: 4,
    source: 'manual',
    examples: ['戴森直发器', '松下直发器', '飞利浦直发器', 'ghd直发器']
  },
  {
    id: 'prod-047',
    text: '吹风机展示建议搭配干发效果展示，展示风速和负离子特点，使用现代简约的背景风格',
    category: 'product_category',
    tags: ['美妆工具', '吹风机', '美发'],
    keywords: ['吹风机', 'hair dryer', '电吹风', '负离子吹风机', '高速吹风机'],
    priority: 5,
    source: 'manual',
    examples: ['戴森吹风机', '松下吹风机', '飞利浦吹风机', '追觅吹风机']
  },
  {
    id: 'prod-047a',
    text: '高速吹风机展示建议搭配风力和干发速度展示，突出科技感和高端定位，使用深色科技背景',
    category: 'product_category',
    tags: ['美妆工具', '吹风机', '高端'],
    keywords: ['高速吹风机', '戴森吹风机', '戴森平替', '高速风嘴', '负离子护发'],
    priority: 5,
    source: 'manual',
    examples: ['戴森Supersonic', '追觅Hair Artist', '徕芬吹风机', '素士吹风机']
  },

  // ==================== 包袋鞋履类 (25条) ====================
  {
    id: 'prod-048',
    text: '女包展示建议搭配穿搭场景，展示包身轮廓和五金细节，使用纯色或渐变背景突出品牌调性',
    category: 'product_category',
    tags: ['箱包', '女包', '时尚'],
    keywords: ['女包', 'handbag', '女士包', '时尚包包', '通勤包'],
    priority: 5,
    source: 'manual',
    examples: ['LV女包', 'Gucci女包', 'Chanel女包', 'Coach女包']
  },
  {
    id: 'prod-048a',
    text: '托特包展示建议搭配办公场景，展示大容量和实用特点，使用简约商务背景风格',
    category: 'product_category',
    tags: ['箱包', '女包', '托特包'],
    keywords: ['托特包', 'tote bag', '大容量包', '通勤包', '购物袋', '上班包'],
    priority: 5,
    source: 'manual',
    examples: ['LV Neverfull', 'Gucci托特包', 'Longchamp托特', 'MK托特包']
  },
  {
    id: 'prod-048b',
    text: '斜挎包展示建议搭配休闲穿搭场景，展示包身大小和肩带设计，使用年轻时尚的背景风格',
    category: 'product_category',
    tags: ['箱包', '女包', '斜挎包'],
    keywords: ['斜挎包', 'crossbody bag', '小方包', '链条包', '单肩包'],
    priority: 4,
    source: 'manual',
    examples: ['Gucci马衔扣包', 'LV链条包', 'Chanel流浪包', 'YSL斜挎包']
  },
  {
    id: 'prod-048c',
    text: '链条包展示建议特写金属链条细节，展示优雅气质，使用黑色或深色背景突出五金光泽',
    category: 'product_category',
    tags: ['箱包', '女包', '链条包'],
    keywords: ['链条包', 'chain bag', '链条单肩包', '经典链条包', '复古链条包'],
    priority: 5,
    source: 'manual',
    examples: ['Chanel 2.55', 'Gucci链条包', 'Dior链条包', 'YSL链条包']
  },
  {
    id: 'prod-049',
    text: '双肩包展示建议搭配旅行或通勤场景，展示容量和功能性，使用户外或都市背景风格',
    category: 'product_category',
    tags: ['箱包', '双肩包', '旅行'],
    keywords: ['双肩包', 'backpack', '背包', '旅行包', '电脑包'],
    priority: 4,
    source: 'manual',
    examples: ['Herschel双肩包', 'Fjallraven双肩包', 'TUMI双肩包', 'Nike双肩包']
  },
  {
    id: 'prod-049a',
    text: '商务双肩包展示建议搭配电脑和文件道具，展示收纳隔层设计，使用专业商务背景',
    category: 'product_category',
    tags: ['箱包', '双肩包', '商务'],
    keywords: ['商务双肩包', '电脑背包', 'business backpack', '通勤背包', '商务背包'],
    priority: 4,
    source: 'manual',
    examples: ['TUMI双肩包', '新秀丽双肩包', '瑞士军刀背包', '小米商务包']
  },
  {
    id: 'prod-050',
    text: '行李箱展示建议搭配旅行场景，展示容量和耐用性，使用机场或酒店背景风格',
    category: 'product_category',
    tags: ['箱包', '行李箱', '旅行'],
    keywords: ['行李箱', 'suitcase', '拉杆箱', '旅行箱', '登机箱'],
    priority: 4,
    source: 'manual',
    examples: ['Rimowa行李箱', '新秀丽行李箱', 'Away行李箱', '小米行李箱']
  },
  {
    id: 'prod-050a',
    text: '硬壳行李箱展示建议特写外壳材质和滚轮设计，展示耐用性和顺滑度，使用简洁背景',
    category: 'product_category',
    tags: ['箱包', '行李箱', '硬壳'],
    keywords: ['硬壳行李箱', 'PC行李箱', '铝镁合金箱', '抗压行李箱', '万向轮行李箱'],
    priority: 4,
    source: 'manual',
    examples: ['Rimowa行李箱', '新秀丽硬壳箱', 'Away行李箱', '美旅行李箱']
  },
  {
    id: 'prod-051',
    text: '钱包展示建议特写皮质纹理和卡槽设计，展示品质感和实用性，使用深色背景突出皮革质感',
    category: 'product_category',
    tags: ['箱包', '钱包', '皮具'],
    keywords: ['钱包', 'wallet', '皮夹', '卡包', '长款钱包'],
    priority: 4,
    source: 'manual',
    examples: ['LV钱包', 'Gucci钱包', 'Hermes钱包', 'Coach钱包']
  },
  {
    id: 'prod-051a',
    text: '卡包展示建议展示多卡槽设计，搭配简约背景，突出实用性和品质感',
    category: 'product_category',
    tags: ['箱包', '钱包', '卡包'],
    keywords: ['卡包', 'card holder', '名片夹', '卡片夹', '小卡包'],
    priority: 3,
    source: 'manual',
    examples: ['LV卡包', 'Gucci卡包', 'Hermes卡包', 'Bottega卡包']
  },
  {
    id: 'prod-052a',
    text: '跑鞋展示建议搭配跑步场景，展示缓震和透气设计，使用动感活力的背景风格',
    category: 'product_category',
    tags: ['鞋类', '运动鞋', '跑鞋'],
    keywords: ['跑鞋', 'running shoes', '马拉松鞋', '慢跑鞋', '竞速跑鞋', '缓震跑鞋'],
    priority: 5,
    source: 'manual',
    examples: ['Nike飞马', 'Adidas Ultraboost', 'Asics跑鞋', 'Hoka跑鞋']
  },
  {
    id: 'prod-052b',
    text: '篮球鞋展示建议搭配篮球场场景，展示高帮设计和缓震科技，使用动感潮流的背景风格',
    category: 'product_category',
    tags: ['鞋类', '运动鞋', '篮球鞋'],
    keywords: ['篮球鞋', 'basketball shoes', '高帮鞋', '实战篮球鞋', '球星签名鞋'],
    priority: 5,
    source: 'manual',
    examples: ['Jordan篮球鞋', 'Nike Kobe', 'LeBron篮球鞋', 'KD篮球鞋']
  },
  {
    id: 'prod-052c',
    text: '板鞋展示建议搭配街头潮流场景，展示简洁设计和百搭特性，使用年轻时尚的背景',
    category: 'product_category',
    tags: ['鞋类', '运动鞋', '板鞋'],
    keywords: ['板鞋', 'skate shoes', '滑板鞋', '帆布鞋', '休闲板鞋'],
    priority: 4,
    source: 'manual',
    examples: ['Vans板鞋', 'Converse帆布鞋', 'Nike SB', 'Adidas板鞋']
  },
  {
    id: 'prod-053a',
    text: '细跟高跟鞋展示建议特写鞋跟设计和鞋面材质，使用深色背景突出优雅气质',
    category: 'product_category',
    tags: ['鞋类', '高跟鞋', '细跟'],
    keywords: ['细跟高跟鞋', 'stiletto heels', '尖头细跟', '高跟凉鞋', '高跟单鞋'],
    priority: 4,
    source: 'manual',
    examples: ['Jimmy Choo细跟', 'CL红底鞋', 'Manolo高跟鞋', 'Prada高跟鞋']
  },
  {
    id: 'prod-054',
    text: '平底鞋展示建议搭配日常穿搭场景，展示舒适度和百搭特性，使用清新简约的背景风格',
    category: 'product_category',
    tags: ['鞋类', '平底鞋', '舒适'],
    keywords: ['平底鞋', 'flats', '芭蕾鞋', '豆豆鞋', '乐福鞋', '一脚蹬'],
    priority: 4,
    source: 'manual',
    examples: ['Tod\'s豆豆鞋', 'Repetto芭蕾鞋', 'Gucci乐福鞋', 'Rothys平底鞋']
  },
  {
    id: 'prod-055a',
    text: '马丁靴展示建议搭配街头潮流场景，展示厚底设计和硬朗风格，使用工业风或街头风背景',
    category: 'product_category',
    tags: ['鞋类', '靴子', '马丁靴'],
    keywords: ['马丁靴', 'combat boots', '工装靴', '厚底靴', '朋克靴'],
    priority: 4,
    source: 'manual',
    examples: ['Dr. Martens', 'Timberland', 'Dickies马丁靴', '回力马丁靴']
  },
  {
    id: 'prod-055b',
    text: '雪地靴展示建议搭配雪景或冬季场景，展示毛绒内里和保暖特性，使用暖色调背景',
    category: 'product_category',
    tags: ['鞋类', '靴子', '雪地靴'],
    keywords: ['雪地靴', 'snow boots', 'UGG', '保暖靴', '毛毛靴', '冬季靴'],
    priority: 4,
    source: 'manual',
    examples: ['UGG雪地靴', 'EMU雪地靴', 'Bearpaw雪地靴', 'Yellow Earth雪地靴']
  },

  // ==================== 服装类 (30条) ====================
  {
    id: 'prod-056',
    text: 'T恤展示建议搭配休闲穿搭场景，展示面料质感和版型，使用清新简约的背景风格',
    category: 'product_category',
    tags: ['服装', 'T恤', '休闲'],
    keywords: ['T恤', 't-shirt', '短袖', '打底衫', '圆领T恤', '印花T恤'],
    priority: 4,
    source: 'manual',
    examples: ['Uniqlo T恤', 'H&M T恤', 'Nike T恤', '优衣库UT']
  },
  {
    id: 'prod-056a',
    text: '印花T恤展示建议特写印花图案，展示设计感和个性风格，使用年轻潮流的背景风格',
    category: 'product_category',
    tags: ['服装', 'T恤', '印花'],
    keywords: ['印花T恤', 'graphic tee', '图案T恤', '潮流T恤', '联名T恤'],
    priority: 4,
    source: 'manual',
    examples: ['Supreme T恤', 'Stussy T恤', 'Champion T恤', 'Thrasher T恤']
  },
  {
    id: 'prod-057',
    text: '连衣裙展示建议搭配人台或模特，展示版型和垂感，选择与裙子风格相符的场景背景',
    category: 'product_category',
    tags: ['服装', '连衣裙', '女装'],
    keywords: ['连衣裙', 'dress', '裙子', '长裙', '短裙', '半身裙'],
    priority: 5,
    source: 'manual',
    examples: ['ZARA连衣裙', 'H&M连衣裙', '优衣库连衣裙', 'UR连衣裙']
  },
  {
    id: 'prod-057a',
    text: '碎花连衣裙展示建议搭配自然田园场景，展示浪漫清新风格，使用浅色柔和的背景',
    category: 'product_category',
    tags: ['服装', '连衣裙', '碎花'],
    keywords: ['碎花连衣裙', 'floral dress', '印花裙', '田园风连衣裙', '法式碎花裙'],
    priority: 4,
    source: 'manual',
    examples: ['ZARA碎花裙', 'H&M碎花裙', '优衣库碎花裙', 'UR碎花裙']
  },
  {
    id: 'prod-057b',
    text: '小黑裙展示建议搭配优雅晚宴场景，展示经典设计和修身剪裁，使用深色高级背景',
    category: 'product_category',
    tags: ['服装', '连衣裙', '小黑裙'],
    keywords: ['小黑裙', 'little black dress', 'LBD', '经典黑裙', '晚宴裙'],
    priority: 5,
    source: 'manual',
    examples: ['Chanel小黑裙', 'Dior小黑裙', 'ZARA小黑裙', 'H&M小黑裙']
  },
  {
    id: 'prod-058',
    text: '衬衫展示建议搭配正式或休闲场景，展示领型和剪裁细节，使用简约专业的背景风格',
    category: 'product_category',
    tags: ['服装', '衬衫', '正装'],
    keywords: ['衬衫', 'shirt', '白衬衫', '商务衬衫', '休闲衬衫', '条纹衬衫'],
    priority: 4,
    source: 'manual',
    examples: ['优衣库衬衫', 'ZARA衬衫', 'G2000衬衫', '雅戈尔衬衫']
  },
  {
    id: 'prod-058a',
    text: '白衬衫展示建议特写面料质感和领型设计，展示干净利落的气质，使用白色或浅灰背景',
    category: 'product_category',
    tags: ['服装', '衬衫', '白衬衫'],
    keywords: ['白衬衫', 'white shirt', '经典白衬衫', '商务白衬衫', '通勤白衬衫'],
    priority: 4,
    source: 'manual',
    examples: ['优衣库白衬衫', 'ZARA白衬衫', 'G2000白衬衫', 'Theory白衬衫']
  },
  {
    id: 'prod-059',
    text: '西装外套展示建议搭配商务场景，展示剪裁和肩型，使用深色专业背景风格',
    category: 'product_category',
    tags: ['服装', '西装', '正装'],
    keywords: ['西装', 'blazer', '西装外套', '商务西装', '休闲西装', '套装西装'],
    priority: 5,
    source: 'manual',
    examples: ['ZARA西装', 'H&M西装', 'G2000西装', 'Theory西装']
  },
  {
    id: 'prod-059a',
    text: '休闲西装展示建议搭配牛仔裤或休闲裤，展示混搭风格，使用时尚简约的背景',
    category: 'product_category',
    tags: ['服装', '西装', '休闲'],
    keywords: ['休闲西装', 'casual blazer', '小西装', '针织西装', '无领西装'],
    priority: 4,
    source: 'manual',
    examples: ['ZARA休闲西装', '优衣库西装', 'COS西装', 'Massimo Dutti西装']
  },
  {
    id: 'prod-060',
    text: '牛仔外套展示建议搭配街头潮流场景，展示水洗工艺和版型，使用年轻时尚的背景',
    category: 'product_category',
    tags: ['服装', '牛仔', '外套'],
    keywords: ['牛仔外套', 'denim jacket', '牛仔夹克', '丹宁外套', '破洞牛仔外套'],
    priority: 4,
    source: 'manual',
    examples: ['Levi\'s牛仔外套', 'Lee牛仔外套', '优衣库牛仔外套', 'H&M牛仔外套']
  },
  {
    id: 'prod-061',
    text: '羽绒服展示建议搭配冬季场景，展示保暖性和轻便性，使用白色或深色背景突出蓬松感',
    category: 'product_category',
    tags: ['服装', '羽绒服', '冬季'],
    keywords: ['羽绒服', 'down jacket', '轻薄羽绒服', '长款羽绒服', '短款羽绒服'],
    priority: 5,
    source: 'manual',
    examples: ['优衣库羽绒服', 'Canada Goose', '波司登羽绒服', 'Moncler羽绒服']
  },
  {
    id: 'prod-061a',
    text: '轻薄羽绒服展示建议展示便携收纳特性，搭配旅行场景，使用简洁干净的背景',
    category: 'product_category',
    tags: ['服装', '羽绒服', '轻薄'],
    keywords: ['轻薄羽绒服', 'lightweight down', '便携羽绒服', '收纳羽绒服', '优衣库轻薄羽绒服'],
    priority: 4,
    source: 'manual',
    examples: ['优衣库轻薄羽绒服', '优衣库便携羽绒服', '迪卡侬羽绒服', '无印良品羽绒服']
  },
  {
    id: 'prod-062',
    text: '毛衣展示建议搭配秋冬场景，展示针织纹理和柔软质感，使用暖色调背景',
    category: 'product_category',
    tags: ['服装', '毛衣', '针织'],
    keywords: ['毛衣', 'sweater', '针织衫', '羊毛衫', '开衫', '高领毛衣'],
    priority: 4,
    source: 'manual',
    examples: ['优衣库毛衣', 'H&M毛衣', 'ZARA毛衣', 'Massimo Dutti毛衣']
  },
  {
    id: 'prod-063',
    text: '风衣展示建议搭配春秋穿搭场景，展示版型和功能性，使用都市时尚背景风格',
    category: 'product_category',
    tags: ['服装', '风衣', '外套'],
    keywords: ['风衣', 'trench coat', '长款风衣', '中长风衣', '双排扣风衣'],
    priority: 5,
    source: 'manual',
    examples: ['Burberry风衣', 'ZARA风衣', '优衣库风衣', 'Massimo Dutti风衣']
  },
  {
    id: 'prod-064',
    text: '卫衣展示建议搭配休闲运动场景，展示面料质感和版型，使用年轻活力的背景风格',
    category: 'product_category',
    tags: ['服装', '卫衣', '休闲'],
    keywords: ['卫衣', 'hoodie', '连帽卫衣', '圆领卫衣', '套头卫衣', '运动卫衣'],
    priority: 4,
    source: 'manual',
    examples: ['Nike卫衣', 'Adidas卫衣', 'Champion卫衣', '优衣库卫衣']
  },
  {
    id: 'prod-065',
    text: '牛仔裤展示建议搭配休闲穿搭场景，展示版型和面料质感，使用简约时尚的背景',
    category: 'product_category',
    tags: ['服装', '牛仔裤', '休闲'],
    keywords: ['牛仔裤', 'jeans', '紧身牛仔裤', '直筒牛仔裤', '阔腿牛仔裤'],
    priority: 5,
    source: 'manual',
    examples: ['Levi\'s牛仔裤', 'Lee牛仔裤', '优衣库牛仔裤', 'H&M牛仔裤']
  },
  {
    id: 'prod-066',
    text: '休闲裤展示建议搭配日常穿搭场景，展示舒适度和版型，使用简约干净的背景风格',
    category: 'product_category',
    tags: ['服装', '休闲裤', '日常'],
    keywords: ['休闲裤', 'casual pants', '休闲长裤', '运动休闲裤', '棉麻休闲裤'],
    priority: 4,
    source: 'manual',
    examples: ['优衣库休闲裤', '无印良品休闲裤', 'GAP休闲裤', 'H&M休闲裤']
  },
  {
    id: 'prod-067',
    text: '运动裤展示建议搭配运动场景，展示面料弹性和功能性，使用动感活力的背景风格',
    category: 'product_category',
    tags: ['服装', '运动裤', '运动'],
    keywords: ['运动裤', 'sweatpants', '跑步裤', '健身裤', '瑜伽裤', '束脚裤'],
    priority: 4,
    source: 'manual',
    examples: ['Nike运动裤', 'Adidas运动裤', 'Lululemon瑜伽裤', 'Under Armour运动裤']
  },
  {
    id: 'prod-067a',
    text: '瑜伽裤展示建议搭配瑜伽场景，展示弹性和塑形效果，使用清新活力的背景风格',
    category: 'product_category',
    tags: ['服装', '运动裤', '瑜伽'],
    keywords: ['瑜伽裤', 'yoga pants', 'leggings', '紧身运动裤', '健身紧身裤'],
    priority: 5,
    source: 'manual',
    examples: ['Lululemon瑜伽裤', 'Alo Yoga', 'Nike瑜伽裤', 'Adidas瑜伽裤']
  },
  {
    id: 'prod-068',
    text: '内衣展示建议搭配舒适场景，展示面料质感和贴合度，使用柔和温馨的背景风格',
    category: 'product_category',
    tags: ['服装', '内衣', '贴身'],
    keywords: ['内衣', 'lingerie', '女士内衣', '文胸', '内衣套装'],
    priority: 4,
    source: 'manual',
    examples: ['维多利亚的秘密', '爱慕内衣', '华歌尔', '黛安芬']
  },
  {
    id: 'prod-068a',
    text: '无钢圈内衣展示建议突出舒适无束缚特点，使用柔和的肤色或粉色背景，展示柔软质地',
    category: 'product_category',
    tags: ['服装', '内衣', '无钢圈'],
    keywords: ['无钢圈内衣', 'wireless bra', '舒适内衣', '无痕内衣', '法式内衣'],
    priority: 4,
    source: 'manual',
    examples: ['优衣库内衣', '内外内衣', '爱慕无钢圈', '华歌尔无钢圈']
  },
  {
    id: 'prod-069',
    text: '泳衣展示建议搭配海滩或泳池场景，展示设计款式和修身效果，使用明亮清新的背景',
    category: 'product_category',
    tags: ['服装', '泳衣', '夏季'],
    keywords: ['泳衣', 'swimwear', '泳装', '比基尼', '连体泳衣', '分体泳衣'],
    priority: 4,
    source: 'manual',
    examples: ['Speedo泳衣', 'Victoria\'s Secret泳衣', 'H&M泳衣', 'ZARA泳衣']
  },

  // ==================== 食品饮料类 (20条) ====================
  {
    id: 'prod-070a',
    text: '坚果展示建议搭配健康早餐场景，展示新鲜度和营养价值，使用自然清新的背景风格',
    category: 'product_category',
    tags: ['食品', '坚果', '健康'],
    keywords: ['坚果', 'nuts', '核桃', '巴旦木', '开心果', '夏威夷果', '每日坚果'],
    priority: 4,
    source: 'manual',
    examples: ['三只松鼠坚果', '良品铺子坚果', '百草味坚果', '沃隆每日坚果']
  },
  {
    id: 'prod-070b',
    text: '巧克力展示建议搭配节日礼盒场景，展示精致包装和口感，使用温馨浪漫的背景风格',
    category: 'product_category',
    tags: ['食品', '巧克力', '零食'],
    keywords: ['巧克力', 'chocolate', '黑巧克力', '牛奶巧克力', '松露巧克力', '手工巧克力'],
    priority: 4,
    source: 'manual',
    examples: ['费列罗', '德芙巧克力', '好时巧克力', '瑞士莲巧克力']
  },
  {
    id: 'prod-071a',
    text: '绿茶展示建议搭配玻璃茶具，展示茶叶形态和汤色清澈，使用清新自然的背景风格',
    category: 'product_category',
    tags: ['食品', '茶叶', '绿茶'],
    keywords: ['绿茶', 'green tea', '龙井', '碧螺春', '毛尖', '信阳红'],
    priority: 4,
    source: 'manual',
    examples: ['西湖龙井', '碧螺春', '黄山毛峰', '信阳毛尖']
  },
  {
    id: 'prod-071b',
    text: '红茶展示建议搭配陶瓷茶具，展示茶汤色泽和醇厚口感，使用暖色调的传统背景',
    category: 'product_category',
    tags: ['食品', '茶叶', '红茶'],
    keywords: ['红茶', 'black tea', '祁门红茶', '正山小种', '金骏眉', '滇红'],
    priority: 4,
    source: 'manual',
    examples: ['祁门红茶', '正山小种', '金骏眉', '滇红']
  },
  {
    id: 'prod-072a',
    text: '咖啡豆展示建议搭配研磨场景，展示豆子新鲜度和烘焙色泽，使用深色高级背景',
    category: 'product_category',
    tags: ['食品', '咖啡', '咖啡豆'],
    keywords: ['咖啡豆', 'coffee beans', '烘焙咖啡', '单品咖啡豆', '意式咖啡豆'],
    priority: 4,
    source: 'manual',
    examples: ['星巴克咖啡豆', 'illy咖啡豆', 'Lavazza咖啡豆', '蓝山咖啡豆']
  },
  {
    id: 'prod-072b',
    text: '挂耳咖啡展示建议搭配便携场景，展示冲泡便捷性，使用清新简约的背景风格',
    category: 'product_category',
    tags: ['食品', '咖啡', '挂耳'],
    keywords: ['挂耳咖啡', 'drip coffee', '手冲咖啡', '便捷咖啡', '办公室咖啡'],
    priority: 4,
    source: 'manual',
    examples: ['三顿半挂耳', '永璞挂耳', '时萃挂耳', '隅田川挂耳']
  },
  {
    id: 'prod-073a',
    text: '红酒展示建议搭配酒杯和软木塞道具，展示酒体色泽和挂杯效果，使用深色高级背景',
    category: 'product_category',
    tags: ['食品', '酒水', '红酒'],
    keywords: ['红酒', 'red wine', '葡萄酒', '干红', '赤霞珠', '梅洛'],
    priority: 5,
    source: 'manual',
    examples: ['拉菲红酒', '奔富红酒', '长城红酒', '张裕红酒']
  },
  {
    id: 'prod-073b',
    text: '白酒展示建议搭配中式酒具，展示瓶身设计和年份，使用深色传统背景突出高端定位',
    category: 'product_category',
    tags: ['食品', '酒水', '白酒'],
    keywords: ['白酒', 'baijiu', '茅台', '五粮液', '浓香型', '酱香型', '清香型'],
    priority: 5,
    source: 'manual',
    examples: ['茅台', '五粮液', '剑南春', '泸州老窖']
  },
  {
    id: 'prod-074a',
    text: '车厘子展示建议展示果肉饱满和色泽鲜亮，使用深色背景突出红色果实，展示新鲜度',
    category: 'product_category',
    tags: ['食品', '水果', '车厘子'],
    keywords: ['车厘子', 'cherries', '智利车厘子', '大樱桃', '进口车厘子'],
    priority: 4,
    source: 'manual',
    examples: ['智利车厘子', '新西兰车厘子', '美国车厘子', '山东大樱桃']
  },
  {
    id: 'prod-074b',
    text: '榴莲展示建议展示果肉金黄和饱满，搭配热带场景，使用明亮背景突出新鲜度',
    category: 'product_category',
    tags: ['食品', '水果', '榴莲'],
    keywords: ['榴莲', 'durian', '金枕榴莲', '猫山王', '泰国榴莲', '马来西亚榴莲'],
    priority: 4,
    source: 'manual',
    examples: ['泰国金枕榴莲', '马来西亚猫山王', '越南榴莲', '干尧榴莲']
  },
  {
    id: 'prod-075',
    text: '保健品展示建议搭配健康生活场景，展示成分和功效，使用专业可信的背景风格',
    category: 'product_category',
    tags: ['食品', '保健品', '健康'],
    keywords: ['保健品', 'health supplement', '维生素', '鱼油', '钙片', '蛋白粉'],
    priority: 4,
    source: 'manual',
    examples: ['Swisse保健品', 'GNC保健品', 'Blackmores', '汤臣倍健']
  },
  {
    id: 'prod-075a',
    text: '维生素展示建议搭配健康生活场景，展示产品规格和成分，使用白色专业背景',
    category: 'product_category',
    tags: ['食品', '保健品', '维生素'],
    keywords: ['维生素', 'vitamin', '维生素C', '维生素E', '复合维生素', '多种维生素'],
    priority: 4,
    source: 'manual',
    examples: ['Swisse维生素', 'GNC维生素', '善存维生素', '汤臣倍健维生素']
  },
  {
    id: 'prod-075b',
    text: '胶原蛋白展示建议搭配美容养颜场景，展示产品效果，使用粉色或白色高级背景',
    category: 'product_category',
    tags: ['食品', '保健品', '胶原蛋白'],
    keywords: ['胶原蛋白', 'collagen', '口服胶原蛋白', '胶原蛋白肽', '胶原蛋白粉'],
    priority: 4,
    source: 'manual',
    examples: ['资生堂胶原蛋白', 'Fancl胶原蛋白', 'Pola胶原蛋白', 'Swisse胶原蛋白']
  },

  // ==================== 家电数码类 (25条) ====================
  {
    id: 'prod-076',
    text: '手机展示建议搭配科技感背景，展示屏幕显示效果和机身设计，使用深色背景突出产品质感',
    category: 'product_category',
    tags: ['数码', '手机', '科技'],
    keywords: ['手机', 'smartphone', '智能手机', 'iPhone', '安卓手机'],
    priority: 5,
    source: 'manual',
    examples: ['iPhone', '华为手机', '小米手机', 'OPPO手机']
  },
  {
    id: 'prod-076a',
    text: '旗舰手机展示建议特写摄像头模组和屏幕细节，使用渐变或科技背景，突出高端定位和创新功能',
    category: 'product_category',
    tags: ['数码', '手机', '旗舰'],
    keywords: ['旗舰手机', '高端手机', '旗舰机', 'pro手机', '顶配手机'],
    priority: 5,
    source: 'manual',
    examples: ['iPhone Pro', '华为Mate', '小米Ultra', 'OPPO Find']
  },
  {
    id: 'prod-077',
    text: '平板电脑展示建议搭配使用场景，展示屏幕尺寸和便携性，使用简约现代背景',
    category: 'product_category',
    tags: ['数码', '平板', '办公'],
    keywords: ['平板电脑', 'tablet', 'iPad', '安卓平板', '平板'],
    priority: 4,
    source: 'manual',
    examples: ['iPad', '华为平板', '小米平板', '三星平板']
  },
  {
    id: 'prod-078',
    text: '笔记本电脑展示建议搭配办公场景，展示轻薄设计和性能配置，使用专业科技背景',
    category: 'product_category',
    tags: ['数码', '笔记本', '办公'],
    keywords: ['笔记本电脑', 'laptop', '轻薄本', '游戏本', '笔记本'],
    priority: 5,
    source: 'manual',
    examples: ['MacBook', 'ThinkPad', '华为笔记本', '小米笔记本']
  },
  {
    id: 'prod-078a',
    text: '游戏本展示建议搭配电竞场景，展示RGB灯效和散热设计，使用暗色科技背景突出游戏氛围',
    category: 'product_category',
    tags: ['数码', '笔记本', '游戏'],
    keywords: ['游戏本', 'gaming laptop', '电竞本', '游戏笔记本', '高性能本'],
    priority: 4,
    source: 'manual',
    examples: ['ROG游戏本', '联想拯救者', '外星人', '雷蛇游戏本']
  },
  {
    id: 'prod-079',
    text: '智能手表展示建议搭配运动或商务场景，展示表盘设计和功能特性，使用现代简约背景',
    category: 'product_category',
    tags: ['数码', '智能手表', '穿戴'],
    keywords: ['智能手表', 'smart watch', '智能腕表', '运动手表', '智能穿戴'],
    priority: 5,
    source: 'manual',
    examples: ['Apple Watch', '华为手表', '小米手表', 'Garmin手表']
  },
  {
    id: 'prod-080',
    text: '降噪耳机展示建议搭配出行场景，展示降噪效果和佩戴舒适度，使用深色专业背景',
    category: 'product_category',
    tags: ['数码', '耳机', '降噪'],
    keywords: ['降噪耳机', 'ANC耳机', '主动降噪', '降噪耳机', '无线降噪'],
    priority: 5,
    source: 'manual',
    examples: ['Sony WH', 'Bose降噪', 'AirPods Pro', '华为降噪耳机']
  },
  {
    id: 'prod-081',
    text: '蓝牙音箱展示建议搭配聚会场景，展示音质和便携性，使用活力明亮背景',
    category: 'product_category',
    tags: ['数码', '音箱', '音频'],
    keywords: ['蓝牙音箱', 'bluetooth speaker', '便携音箱', '无线音箱', '智能音箱'],
    priority: 4,
    source: 'manual',
    examples: ['JBL音箱', 'Bose音箱', '小米音箱', '华为音箱']
  },
  {
    id: 'prod-082',
    text: '智能音箱展示建议搭配家居场景，展示语音交互功能，使用温馨现代背景',
    category: 'product_category',
    tags: ['数码', '智能音箱', '家居'],
    keywords: ['智能音箱', 'smart speaker', '语音助手', '小爱同学', '天猫精灵'],
    priority: 4,
    source: 'manual',
    examples: ['小爱音箱', '天猫精灵', '小度音箱', 'Apple HomePod']
  },
  {
    id: 'prod-083',
    text: '投影仪展示建议搭配家庭影院场景，展示投影效果和亮度，使用暗色背景突出画面',
    category: 'product_category',
    tags: ['数码', '投影仪', '影音'],
    keywords: ['投影仪', 'projector', '家用投影', '便携投影', '智能投影'],
    priority: 4,
    source: 'manual',
    examples: ['极米投影', '坚果投影', '小米投影', '当贝投影']
  },
  {
    id: 'prod-084',
    text: '扫地机器人展示建议搭配家居地面场景，展示清洁路径和智能导航，使用简约现代背景',
    category: 'product_category',
    tags: ['家电', '扫地机器人', '智能家居'],
    keywords: ['扫地机器人', 'robot vacuum', '扫地机', '扫拖一体机', '智能扫地'],
    priority: 4,
    source: 'manual',
    examples: ['石头扫地机', '科沃斯扫地机', '小米扫地机', 'iRobot扫地机']
  },
  {
    id: 'prod-085',
    text: '空气净化器展示建议搭配居家场景，展示净化效果和静音特性，使用清新干净背景',
    category: 'product_category',
    tags: ['家电', '空气净化器', '健康'],
    keywords: ['空气净化器', 'air purifier', '空气净化', '除甲醛', 'PM2.5净化'],
    priority: 4,
    source: 'manual',
    examples: ['小米空气净化器', '戴森净化器', '飞利浦净化器', 'Blueair净化器']
  },
  {
    id: 'prod-086',
    text: '加湿器展示建议搭配卧室场景，展示雾化效果和静音特性，使用温馨柔和背景',
    category: 'product_category',
    tags: ['家电', '加湿器', '家居'],
    keywords: ['加湿器', 'humidifier', '空气加湿', '静音加湿', '智能加湿'],
    priority: 3,
    source: 'manual',
    examples: ['小米加湿器', '飞利浦加湿器', '德尔玛加湿器', '智米加湿器']
  },
  {
    id: 'prod-087',
    text: '电饭煲展示建议搭配厨房场景，展示内胆和功能面板，使用温馨实用背景',
    category: 'product_category',
    tags: ['家电', '电饭煲', '厨房'],
    keywords: ['电饭煲', 'rice cooker', '智能电饭煲', 'IH电饭煲', '电饭锅'],
    priority: 4,
    source: 'manual',
    examples: ['美的电饭煲', '苏泊尔电饭煲', '小米电饭煲', '虎牌电饭煲']
  },
  {
    id: 'prod-088',
    text: '破壁机展示建议搭配果汁或豆浆场景，展示细腻口感和多功能，使用清新健康背景',
    category: 'product_category',
    tags: ['家电', '破壁机', '厨房'],
    keywords: ['破壁机', 'blender', '料理机', '榨汁机', '豆浆机'],
    priority: 4,
    source: 'manual',
    examples: ['九阳破壁机', '美的破壁机', '苏泊尔破壁机', 'Vitamix']
  },
  {
    id: 'prod-089',
    text: '空气炸锅展示建议搭配美食场景，展示无油烹饪效果，使用温馨厨房背景',
    category: 'product_category',
    tags: ['家电', '空气炸锅', '厨房'],
    keywords: ['空气炸锅', 'air fryer', '无油炸锅', '多功能炸锅', '智能炸锅'],
    priority: 4,
    source: 'manual',
    examples: ['飞利浦空气炸锅', '美的空气炸锅', '九阳空气炸锅', '小米空气炸锅']
  },
  {
    id: 'prod-090',
    text: '咖啡机展示建议搭配咖啡厅场景，展示萃取效果和操作便捷性，使用现代简约背景',
    category: 'product_category',
    tags: ['家电', '咖啡机', '厨房'],
    keywords: ['咖啡机', 'coffee machine', '意式咖啡机', '胶囊咖啡机', '全自动咖啡机'],
    priority: 4,
    source: 'manual',
    examples: ['德龙咖啡机', 'Nespresso咖啡机', '飞利浦咖啡机', '小米咖啡机']
  },
  {
    id: 'prod-091',
    text: '电热水壶展示建议搭配烧水场景，展示快速加热和安全特性，使用简约现代背景',
    category: 'product_category',
    tags: ['家电', '电热水壶', '厨房'],
    keywords: ['电热水壶', 'kettle', '烧水壶', '恒温壶', '智能水壶'],
    priority: 3,
    source: 'manual',
    examples: ['小米电水壶', '飞利浦电水壶', '美的电水壶', '摩飞电水壶']
  },
  {
    id: 'prod-092',
    text: '吸尘器展示建议搭配家居清洁场景，展示吸力和便捷性，使用干净明亮背景',
    category: 'product_category',
    tags: ['家电', '吸尘器', '清洁'],
    keywords: ['吸尘器', 'vacuum cleaner', '手持吸尘器', '无线吸尘器', '家用吸尘器'],
    priority: 4,
    source: 'manual',
    examples: ['戴森吸尘器', '小米吸尘器', '美的吸尘器', '小狗吸尘器']
  },
  {
    id: 'prod-093',
    text: '挂烫机展示建议搭配衣物护理场景，展示蒸汽效果和便捷性，使用温馨明亮背景',
    category: 'product_category',
    tags: ['家电', '挂烫机', '护理'],
    keywords: ['挂烫机', 'steamer', '蒸汽熨斗', '手持挂烫机', '衣物护理'],
    priority: 3,
    source: 'manual',
    examples: ['飞利浦挂烫机', '美的挂烫机', '小米挂烫机', '贝尔莱德挂烫机']
  },
  {
    id: 'prod-094',
    text: '电吹风展示建议搭配美发场景，展示风速和护发功能，使用现代时尚背景',
    category: 'product_category',
    tags: ['家电', '电吹风', '美发'],
    keywords: ['电吹风', 'hair dryer', '负离子吹风机', '高速吹风机', '护发吹风机'],
    priority: 4,
    source: 'manual',
    examples: ['戴森吹风机', '飞利浦吹风机', '松下吹风机', '小米吹风机']
  },
  {
    id: 'prod-095',
    text: '电动牙刷展示建议搭配口腔护理场景，展示清洁效果和智能功能，使用清新明亮背景',
    category: 'product_category',
    tags: ['家电', '电动牙刷', '口腔护理'],
    keywords: ['电动牙刷', 'electric toothbrush', '声波牙刷', '智能牙刷', '牙刷'],
    priority: 5,
    source: 'manual',
    examples: ['飞利浦电动牙刷', '欧乐B电动牙刷', '小米电动牙刷', 'usmile电动牙刷']
  },
  {
    id: 'prod-096',
    text: '筋膜枪展示建议搭配运动恢复场景，展示按摩效果和便携性，使用动感活力背景',
    category: 'product_category',
    tags: ['家电', '筋膜枪', '运动'],
    keywords: ['筋膜枪', 'massage gun', '肌肉按摩枪', '深层筋膜枪', '放松按摩'],
    priority: 4,
    source: 'manual',
    examples: ['SKG筋膜枪', '云麦筋膜枪', '小米筋膜枪', 'Hyperice筋膜枪']
  },

  // ==================== 珠宝首饰类 (15条) ====================
  {
    id: 'prod-097',
    text: '钻戒展示建议搭配深色丝绒背景，使用多点光源突出钻石闪耀，展示切工和净度',
    category: 'product_category',
    tags: ['珠宝', '钻戒', '婚戒'],
    keywords: ['钻戒', 'diamond ring', '婚戒', '求婚钻戒', '结婚钻戒', '钻石戒指'],
    priority: 5,
    source: 'manual',
    examples: ['卡地亚钻戒', '蒂芙尼钻戒', '周大福钻戒', '周生生钻戒']
  },
  {
    id: 'prod-098',
    text: '黄金首饰展示建议搭配红色或金色背景，使用柔光突出光泽，展示工艺细节',
    category: 'product_category',
    tags: ['珠宝', '黄金', '首饰'],
    keywords: ['黄金首饰', 'gold jewelry', '金饰', '黄金项链', '黄金手镯', '金条'],
    priority: 5,
    source: 'manual',
    examples: ['周大福黄金', '周生生黄金', '老凤祥黄金', '中国黄金']
  },
  {
    id: 'prod-099',
    text: '珍珠首饰展示建议搭配优雅柔和背景，使用柔光突出珍珠光泽，展示圆润度和光泽度',
    category: 'product_category',
    tags: ['珠宝', '珍珠', '首饰'],
    keywords: ['珍珠首饰', 'pearl jewelry', '珍珠项链', '珍珠耳环', '淡水珍珠', '海水珍珠'],
    priority: 4,
    source: 'manual',
    examples: ['御木本珍珠', 'TASAKI珍珠', '周大福珍珠', '京润珍珠']
  },
  {
    id: 'prod-100',
    text: '银饰展示建议搭配简约清新背景，使用柔和光线突出银色质感，展示设计细节',
    category: 'product_category',
    tags: ['珠宝', '银饰', '首饰'],
    keywords: ['银饰', 'silver jewelry', '纯银首饰', '925银', '银项链', '银手镯'],
    priority: 4,
    source: 'manual',
    examples: ['潘多拉银饰', '蒂芙尼银饰', '周大福银饰', 'APM Monaco']
  },
  {
    id: 'prod-101',
    text: '翡翠展示建议搭配深色或暖色背景，使用点光源突出种水和颜色，展示通透度和色泽',
    category: 'product_category',
    tags: ['珠宝', '翡翠', '玉石'],
    keywords: ['翡翠', 'jade', '翡翠手镯', '翡翠挂件', '玉器', '缅甸翡翠'],
    priority: 5,
    source: 'manual',
    examples: ['翡翠手镯', '翡翠吊坠', '翡翠戒指', '翡翠项链']
  },
  {
    id: 'prod-102',
    text: '彩宝展示建议搭配与宝石颜色呼应的背景，使用多点光源突出火彩，展示颜色饱和度和切工',
    category: 'product_category',
    tags: ['珠宝', '彩宝', '宝石'],
    keywords: ['彩色宝石', 'colored gemstone', '红宝石', '蓝宝石', '祖母绿', '碧玺'],
    priority: 5,
    source: 'manual',
    examples: ['红宝石戒指', '蓝宝石项链', '祖母绿耳环', '碧玺手链']
  },

  // ==================== 母婴用品类 (15条) ====================
  {
    id: 'prod-103',
    text: '婴儿推车展示建议搭配户外场景，展示折叠便携和安全特性，使用温馨明亮背景',
    category: 'product_category',
    tags: ['母婴', '婴儿推车', '出行'],
    keywords: ['婴儿推车', 'stroller', '婴儿车', '童车', '轻便推车', '高景观推车'],
    priority: 4,
    source: 'manual',
    examples: ['好孩子推车', 'Bugaboo推车', 'Cybex推车', 'Joie推车']
  },
  {
    id: 'prod-104',
    text: '婴儿床展示建议搭配温馨卧室场景，展示安全材质和舒适设计，使用柔和温暖背景',
    category: 'product_category',
    tags: ['母婴', '婴儿床', '家居'],
    keywords: ['婴儿床', 'baby crib', '儿童床', '婴儿摇篮', '拼接床', '实木婴儿床'],
    priority: 4,
    source: 'manual',
    examples: ['好孩子婴儿床', '宜家婴儿床', 'Stokke婴儿床', '可优比婴儿床']
  },
  {
    id: 'prod-105',
    text: '婴儿车安全座椅展示建议搭配汽车场景，展示安全防护和舒适设计，使用专业可信背景',
    category: 'product_category',
    tags: ['母婴', '安全座椅', '出行'],
    keywords: ['安全座椅', 'car seat', '儿童安全座椅', '婴儿提篮', '车载座椅'],
    priority: 4,
    source: 'manual',
    examples: ['Britax安全座椅', 'Cybex安全座椅', '好孩子安全座椅', 'Maxi-Cosi安全座椅']
  },
  {
    id: 'prod-106',
    text: '奶粉展示建议搭配喂养场景，展示营养成分和奶源，使用温馨专业背景',
    category: 'product_category',
    tags: ['母婴', '奶粉', '喂养'],
    keywords: ['奶粉', 'baby formula', '婴儿奶粉', '配方奶粉', '有机奶粉', '羊奶粉'],
    priority: 5,
    source: 'manual',
    examples: ['爱他美奶粉', '惠氏奶粉', '美赞臣奶粉', '飞鹤奶粉']
  },
  {
    id: 'prod-107',
    text: '婴儿辅食展示建议搭配宝宝用餐场景，展示营养均衡和口感，使用清新健康背景',
    category: 'product_category',
    tags: ['母婴', '辅食', '喂养'],
    keywords: ['婴儿辅食', 'baby food', '宝宝辅食', '米粉', '果泥', '婴儿零食'],
    priority: 4,
    source: 'manual',
    examples: ['亨氏辅食', '嘉宝辅食', '小皮辅食', '英氏辅食']
  },
  {
    id: 'prod-108',
    text: '婴儿湿巾展示建议搭配清洁场景，展示温和无刺激特性，使用清新干净背景',
    category: 'product_category',
    tags: ['母婴', '湿巾', '护理'],
    keywords: ['婴儿湿巾', 'baby wipes', '宝宝湿巾', '手口湿巾', '屁屁湿巾'],
    priority: 3,
    source: 'manual',
    examples: ['子初湿巾', '全棉时代湿巾', 'babycare湿巾', 'NUK湿巾']
  },
  {
    id: 'prod-109',
    text: '婴儿浴盆展示建议搭配洗澡场景，展示安全设计和舒适材质，使用清新明亮背景',
    category: 'product_category',
    tags: ['母婴', '浴盆', '洗护'],
    keywords: ['婴儿浴盆', 'baby bathtub', '宝宝浴盆', '洗澡盆', '折叠浴盆'],
    priority: 3,
    source: 'manual',
    examples: ['okbaby浴盆', '好孩子浴盆', '日康浴盆', '可优比浴盆']
  },

  // ==================== 宠物用品类 (10条) ====================
  {
    id: 'prod-110',
    text: '猫粮展示建议搭配猫咪用餐场景，展示营养成分和适口性，使用温馨可爱背景',
    category: 'product_category',
    tags: ['宠物', '猫粮', '食品'],
    keywords: ['猫粮', 'cat food', '干猫粮', '湿猫粮', '进口猫粮', '国产猫粮'],
    priority: 4,
    source: 'manual',
    examples: ['渴望猫粮', '爱肯拿猫粮', '皇家猫粮', '冠能猫粮']
  },
  {
    id: 'prod-111',
    text: '狗粮展示建议搭配狗狗用餐场景，展示营养均衡和品质，使用活力温馨背景',
    category: 'product_category',
    tags: ['宠物', '狗粮', '食品'],
    keywords: ['狗粮', 'dog food', '干狗粮', '湿狗粮', '进口狗粮', '国产狗粮'],
    priority: 4,
    source: 'manual',
    examples: ['渴望狗粮', '爱肯拿狗粮', '皇家狗粮', '冠能狗粮']
  },
  {
    id: 'prod-112',
    text: '宠物玩具展示建议搭配宠物玩耍场景，展示趣味性和安全性，使用活泼明亮背景',
    category: 'product_category',
    tags: ['宠物', '玩具', '娱乐'],
    keywords: ['宠物玩具', 'pet toy', '猫玩具', '狗玩具', '逗猫棒', '咬胶'],
    priority: 3,
    source: 'manual',
    examples: ['猫抓板', '逗猫棒', '狗咬胶', '宠物球']
  },
  {
    id: 'prod-113',
    text: '宠物窝展示建议搭配宠物休息场景，展示舒适材质和设计，使用温馨舒适背景',
    category: 'product_category',
    tags: ['宠物', '窝', '家居'],
    keywords: ['宠物窝', 'pet bed', '猫窝', '狗窝', '宠物床', '猫爬架'],
    priority: 3,
    source: 'manual',
    examples: ['猫窝', '狗窝', '猫爬架', '宠物垫子']
  },
  {
    id: 'prod-114',
    text: '宠物服饰展示建议搭配宠物穿着效果，展示材质舒适度和设计感，使用可爱温馨背景',
    category: 'product_category',
    tags: ['宠物', '服饰', '装扮'],
    keywords: ['宠物服饰', 'pet clothes', '狗狗衣服', '猫咪衣服', '宠物项圈', '宠物牵引'],
    priority: 3,
    source: 'manual',
    examples: ['狗狗衣服', '猫咪项圈', '宠物牵引绳', '宠物鞋']
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
  },

  // ==================== 电商场景 (25条) ====================
  {
    id: 'scene-026',
    text: '电商促销场景使用红色或橙色主色调，搭配倒计时和促销标签元素，营造紧迫购买氛围，适合双11、618等大促活动',
    category: 'scene_design',
    tags: ['电商场景', '促销', '节日'],
    keywords: ['促销场景', '大促背景', '电商节日', '双11场景', '618场景', '购物节'],
    priority: 5,
    source: 'manual',
    examples: ['双11大促', '618年中大促', '年货节', '女王节']
  },
  {
    id: 'scene-026a',
    text: '直播带货场景使用明亮的直播间灯光，搭配产品展示台和互动弹幕元素，营造热闹购物氛围',
    category: 'scene_design',
    tags: ['电商场景', '直播', '带货'],
    keywords: ['直播场景', '直播间背景', '带货场景', '电商直播', '直播展示'],
    priority: 5,
    source: 'manual',
    examples: ['抖音直播', '淘宝直播', '快手直播', '小红书直播']
  },
  {
    id: 'scene-026b',
    text: '种草场景使用生活化背景，搭配真实使用场景和用户体验元素，营造真实可信氛围，适合小红书推广',
    category: 'scene_design',
    tags: ['电商场景', '种草', '生活化'],
    keywords: ['种草场景', '小红书场景', 'ins风背景', '生活化场景', '真实场景'],
    priority: 5,
    source: 'manual',
    examples: ['小红书笔记', '种草内容', '用户分享']
  },
  {
    id: 'scene-027',
    text: '新品发布场景使用简约高级背景，搭配产品特写和品牌Logo元素，营造仪式感和期待感',
    category: 'scene_design',
    tags: ['电商场景', '新品', '发布'],
    keywords: ['新品发布场景', '首发背景', '新品展示', '发布会场景'],
    priority: 4,
    source: 'manual',
    examples: ['新品首发', '限量发售', '品牌发布会']
  },
  {
    id: 'scene-027a',
    text: '预售场景使用倒计时和预约按钮元素，搭配产品预告和优惠信息，营造期待感',
    category: 'scene_design',
    tags: ['电商场景', '预售', '预约'],
    keywords: ['预售场景', '预约背景', '期待场景', '倒计时场景'],
    priority: 4,
    source: 'manual',
    examples: ['新品预售', '定金预售', '限时预约']
  },
  {
    id: 'scene-028',
    text: '会员专享场景使用金色或黑金配色，搭配VIP标识和专属权益元素，营造尊贵感',
    category: 'scene_design',
    tags: ['电商场景', '会员', '专享'],
    keywords: ['会员场景', 'VIP背景', '专享场景', '会员日场景'],
    priority: 4,
    source: 'manual',
    examples: ['会员日', 'VIP专享', '超级会员']
  },

  // ==================== 季节场景 (20条) ====================
  {
    id: 'scene-029',
    text: '春季场景使用粉色和浅绿色调，搭配樱花和嫩芽元素，营造生机盎然氛围，适合春装、护肤品推广',
    category: 'scene_design',
    tags: ['季节场景', '春季', '樱花'],
    keywords: ['春季场景', '春天背景', '樱花场景', '春日场景', '粉色春天'],
    priority: 4,
    source: 'manual',
    examples: ['春装上新', '春季护肤', '樱花季']
  },
  {
    id: 'scene-029a',
    text: '樱花季场景使用粉色花瓣飘落效果，搭配日式元素，营造浪漫唯美氛围，适合化妆品、女性产品',
    category: 'scene_design',
    tags: ['季节场景', '春季', '樱花季'],
    keywords: ['樱花季', '樱花背景', '粉色花瓣', '日式樱花', '樱花主题'],
    priority: 5,
    source: 'manual',
    examples: ['樱花限定', '春季限定', '粉色系产品']
  },
  {
    id: 'scene-030',
    text: '夏季场景使用蓝色和明黄色调，搭配阳光、海滩、冰块元素，营造清爽活力氛围',
    category: 'scene_design',
    tags: ['季节场景', '夏季', '海滩'],
    keywords: ['夏季场景', '夏天背景', '海滩场景', '夏日场景', '清凉夏日'],
    priority: 4,
    source: 'manual',
    examples: ['夏季新品', '防晒产品', '夏装展示']
  },
  {
    id: 'scene-030a',
    text: '夏日海滩场景使用蓝天白云和沙滩元素，搭配海浪和椰树，营造度假休闲氛围，适合泳装、防晒产品',
    category: 'scene_design',
    tags: ['季节场景', '夏季', '度假'],
    keywords: ['海滩场景', '沙滩背景', '度假场景', '夏日海滩', '热带场景'],
    priority: 4,
    source: 'manual',
    examples: ['泳装展示', '防晒霜', '度假用品']
  },
  {
    id: 'scene-031',
    text: '秋季场景使用橙色和金黄色调，搭配落叶和丰收元素，营造温暖成熟氛围',
    category: 'scene_design',
    tags: ['季节场景', '秋季', '丰收'],
    keywords: ['秋季场景', '秋天背景', '落叶场景', '金秋场景', '丰收场景'],
    priority: 4,
    source: 'manual',
    examples: ['秋装上新', '秋季护肤', '丰收季']
  },
  {
    id: 'scene-031a',
    text: '枫叶场景使用红色和橙色渐变，搭配枫叶飘落效果，营造浪漫诗意氛围，适合护肤品、茶饮推广',
    category: 'scene_design',
    tags: ['季节场景', '秋季', '枫叶'],
    keywords: ['枫叶场景', '红叶背景', '秋季枫叶', '赏枫场景'],
    priority: 4,
    source: 'manual',
    examples: ['秋季限定', '枫叶季', '护肤品推广']
  },
  {
    id: 'scene-032',
    text: '冬季场景使用白色和蓝色调，搭配雪花和冰晶元素，营造寒冷纯净氛围',
    category: 'scene_design',
    tags: ['季节场景', '冬季', '雪景'],
    keywords: ['冬季场景', '冬天背景', '雪景场景', '冬日场景', '冰雪场景'],
    priority: 4,
    source: 'manual',
    examples: ['冬装展示', '护肤品推广', '冬季用品']
  },
  {
    id: 'scene-032a',
    text: '雪景场景使用纯白背景和飘雪效果，搭配冰晶和霜花元素，营造纯洁梦幻氛围，适合珠宝、高端护肤品',
    category: 'scene_design',
    tags: ['季节场景', '冬季', '飘雪'],
    keywords: ['雪景背景', '飘雪场景', '冰雪世界', '冬日雪景', '纯白场景'],
    priority: 4,
    source: 'manual',
    examples: ['珠宝展示', '高端护肤品', '冬季限定']
  },

  // ==================== 节日场景 (20条) ====================
  {
    id: 'scene-033',
    text: '春节场景使用红色和金色主色调，搭配灯笼、福字、鞭炮元素，营造喜庆热闹氛围，适合年货推广',
    category: 'scene_design',
    tags: ['节日场景', '春节', '喜庆'],
    keywords: ['春节场景', '新年背景', '过年场景', '中国年场景', '喜庆场景'],
    priority: 5,
    source: 'manual',
    examples: ['年货节', '新春礼盒', '春节礼品']
  },
  {
    id: 'scene-033a',
    text: '元宵节场景使用红色灯笼和汤圆元素，搭配灯谜和烟花效果，营造团圆温馨氛围',
    category: 'scene_design',
    tags: ['节日场景', '元宵节', '团圆'],
    keywords: ['元宵节场景', '花灯背景', '汤圆场景', '灯会场景'],
    priority: 3,
    source: 'manual',
    examples: ['元宵节促销', '汤圆推广', '花灯展示']
  },
  {
    id: 'scene-034',
    text: '情人节场景使用粉色和红色主色调，搭配玫瑰、爱心、巧克力元素，营造浪漫甜蜜氛围',
    category: 'scene_design',
    tags: ['节日场景', '情人节', '浪漫'],
    keywords: ['情人节场景', '浪漫背景', '爱心场景', '情侣场景', '玫瑰场景'],
    priority: 5,
    source: 'manual',
    examples: ['情人节礼物', '珠宝推广', '巧克力礼盒']
  },
  {
    id: 'scene-034a',
    text: '520场景使用粉色和玫红色调，搭配告白元素和鲜花道具，营造表白氛围，适合情侣产品推广',
    category: 'scene_design',
    tags: ['节日场景', '520', '告白'],
    keywords: ['520场景', '告白日背景', '情人节背景', '表白场景'],
    priority: 4,
    source: 'manual',
    examples: ['520礼物', '情侣产品', '告白季']
  },
  {
    id: 'scene-035',
    text: '女神节场景使用粉色和紫色调，搭配女性元素和鲜花道具，营造女性独立自信氛围',
    category: 'scene_design',
    tags: ['节日场景', '女神节', '女性'],
    keywords: ['女神节场景', '38节背景', '女王节场景', '女性节日场景'],
    priority: 5,
    source: 'manual',
    examples: ['女神节促销', '女性产品', '护肤美妆']
  },
  {
    id: 'scene-036',
    text: '母亲节场景使用温馨暖色调，搭配康乃馨和家庭元素，营造感恩温暖氛围',
    category: 'scene_design',
    tags: ['节日场景', '母亲节', '温馨'],
    keywords: ['母亲节场景', '感恩背景', '温馨场景', '家庭场景'],
    priority: 4,
    source: 'manual',
    examples: ['母亲节礼物', '护肤品礼盒', '保健品']
  },
  {
    id: 'scene-037',
    text: '父亲节场景使用深蓝色和棕色主色调，搭配领带、手表元素，营造稳重感谢氛围',
    category: 'scene_design',
    tags: ['节日场景', '父亲节', '稳重'],
    keywords: ['父亲节场景', '感恩背景', '男士场景', '父亲节背景'],
    priority: 4,
    source: 'manual',
    examples: ['父亲节礼物', '男士用品', '保健品']
  },
  {
    id: 'scene-038',
    text: '儿童节场景使用彩虹色和明快色调，搭配气球、玩具元素，营造童趣欢乐氛围',
    category: 'scene_design',
    tags: ['节日场景', '儿童节', '童趣'],
    keywords: ['儿童节场景', '童趣背景', '六一场景', '欢乐场景'],
    priority: 4,
    source: 'manual',
    examples: ['儿童节礼物', '童装童鞋', '玩具推广']
  },
  {
    id: 'scene-039',
    text: '中秋节场景使用深蓝色和金黄色调，搭配月亮、月饼、桂花元素，营造团圆诗意氛围',
    category: 'scene_design',
    tags: ['节日场景', '中秋节', '团圆'],
    keywords: ['中秋节场景', '月亮背景', '团圆场景', '赏月场景', '月饼场景'],
    priority: 5,
    source: 'manual',
    examples: ['中秋礼盒', '月饼推广', '茶礼']
  },
  {
    id: 'scene-040',
    text: '国庆节场景使用红色主色调，搭配国旗、烟花元素，营造喜庆热烈氛围',
    category: 'scene_design',
    tags: ['节日场景', '国庆节', '喜庆'],
    keywords: ['国庆节场景', '国庆背景', '十一场景', '黄金周场景'],
    priority: 4,
    source: 'manual',
    examples: ['国庆促销', '旅游产品', '家电促销']
  },
  {
    id: 'scene-041',
    text: '双11场景使用红色和橙色调，搭配购物车、优惠券、倒计时元素，营造狂欢购物氛围',
    category: 'scene_design',
    tags: ['节日场景', '双11', '购物节'],
    keywords: ['双11场景', '购物节背景', '电商节日场景', '大促场景'],
    priority: 5,
    source: 'manual',
    examples: ['双11大促', '全网最低价', '限时秒杀']
  },
  {
    id: 'scene-042',
    text: '圣诞节场景使用红色和绿色主色调，搭配圣诞树、雪人、礼物盒元素，营造温馨欢乐氛围',
    category: 'scene_design',
    tags: ['节日场景', '圣诞节', '温馨'],
    keywords: ['圣诞节场景', '圣诞背景', '节日场景', '平安夜场景'],
    priority: 4,
    source: 'manual',
    examples: ['圣诞礼盒', '节日限定', '冬季礼品']
  },
  {
    id: 'scene-043',
    text: '跨年夜场景使用金色和深蓝色调，搭配烟花、倒计时元素，营造欢庆新年开始氛围',
    category: 'scene_design',
    tags: ['节日场景', '跨年', '欢庆'],
    keywords: ['跨年场景', '跨年夜背景', '新年倒计时', '烟花场景'],
    priority: 3,
    source: 'manual',
    examples: ['跨年促销', '新年礼盒', '年度盘点']
  },

  // ==================== 生活场景 (15条) ====================
  {
    id: 'scene-044',
    text: '咖啡厅场景使用暖色调和木质元素，搭配咖啡杯和书籍道具，营造休闲文艺氛围',
    category: 'scene_design',
    tags: ['生活场景', '咖啡厅', '文艺'],
    keywords: ['咖啡厅场景', '咖啡馆背景', '文艺场景', '下午茶场景'],
    priority: 4,
    source: 'manual',
    examples: ['咖啡产品', '文艺产品', '生活方式']
  },
  {
    id: 'scene-045',
    text: '健身房场景使用动感灯光和器械元素，搭配活力色彩，营造健康运动氛围',
    category: 'scene_design',
    tags: ['生活场景', '健身房', '运动'],
    keywords: ['健身房场景', '健身背景', '运动场景', '动感场景'],
    priority: 4,
    source: 'manual',
    examples: ['运动装备', '健身服装', '蛋白粉']
  },
  {
    id: 'scene-046',
    text: '瑜伽馆场景使用柔和灯光和绿植元素，搭配瑜伽垫和冥想道具，营造宁静祥和氛围',
    category: 'scene_design',
    tags: ['生活场景', '瑜伽', '宁静'],
    keywords: ['瑜伽场景', '瑜伽馆背景', '冥想场景', '宁静场景'],
    priority: 4,
    source: 'manual',
    examples: ['瑜伽服', '瑜伽垫', '冥想用品']
  },
  {
    id: 'scene-047',
    text: '书房场景使用暖色灯光和书籍元素，搭配书桌和绿植，营造知性雅致氛围',
    category: 'scene_design',
    tags: ['生活场景', '书房', '知性'],
    keywords: ['书房场景', '阅读背景', '知性场景', '学习场景'],
    priority: 4,
    source: 'manual',
    examples: ['文具', '书籍', '台灯']
  },
  {
    id: 'scene-048',
    text: '花园场景使用绿色植物和花卉元素，搭配阳光效果，营造自然清新氛围',
    category: 'scene_design',
    tags: ['生活场景', '花园', '自然'],
    keywords: ['花园场景', '庭院背景', '自然场景', '户外场景'],
    priority: 4,
    source: 'manual',
    examples: ['园艺产品', '户外家具', '花艺']
  },
  {
    id: 'scene-049',
    text: '阳台场景使用自然光和绿植元素，搭配休闲座椅，营造惬意放松氛围',
    category: 'scene_design',
    tags: ['生活场景', '阳台', '休闲'],
    keywords: ['阳台场景', '露台背景', '休闲场景', '户外休闲'],
    priority: 3,
    source: 'manual',
    examples: ['阳台家具', '绿植盆栽', '休闲用品']
  },
  {
    id: 'scene-050',
    text: '野餐场景使用草地和野餐垫元素，搭配美食和阳光效果，营造轻松愉悦氛围',
    category: 'scene_design',
    tags: ['生活场景', '野餐', '户外'],
    keywords: ['野餐场景', '户外野餐', '草地场景', '春游场景'],
    priority: 3,
    source: 'manual',
    examples: ['野餐用品', '食品饮料', '户外装备']
  },
  // 场景设计知识扩展 (scene-051 ~ scene-091)
  {
    id: 'scene-051',
    text: '滑雪场景使用雪地和雪山背景，搭配滑雪装备和动感姿态，展现冬季运动活力',
    category: 'scene_design',
    tags: ['运动场景', '滑雪', '冬季'],
    keywords: ['滑雪场景', '雪山场景', '冬季运动', '滑雪场'],
    priority: 3,
    source: 'manual',
    examples: ['滑雪板', '滑雪服', '冬季运动装备']
  },
  {
    id: 'scene-052',
    text: '冲浪场景使用海浪和沙滩背景，搭配冲浪板和动感水花，展现夏日活力',
    category: 'scene_design',
    tags: ['运动场景', '冲浪', '夏日'],
    keywords: ['冲浪场景', '海滩场景', '夏日运动', '海浪场景'],
    priority: 3,
    source: 'manual',
    examples: ['冲浪板', '泳衣', '夏日用品']
  },
  {
    id: 'scene-053',
    text: '潜水场景使用水下光线和珊瑚礁背景，搭配海洋生物元素，营造神秘深海感',
    category: 'scene_design',
    tags: ['运动场景', '潜水', '海洋'],
    keywords: ['潜水场景', '水下场景', '深海场景', '海洋场景'],
    priority: 3,
    source: 'manual',
    examples: ['潜水装备', '水下相机', '海洋用品']
  },
  {
    id: 'scene-054',
    text: '攀岩场景使用岩壁和天空背景，搭配岩石纹理和户外装备，展现挑战精神',
    category: 'scene_design',
    tags: ['运动场景', '攀岩', '户外'],
    keywords: ['攀岩场景', '岩壁场景', '户外运动', '攀登场景'],
    priority: 3,
    source: 'manual',
    examples: ['攀岩装备', '户外用品', '运动服装']
  },
  {
    id: 'scene-055',
    text: '瑜伽场景使用木质地板和自然光线，搭配绿植和简约装饰，营造宁静氛围',
    category: 'scene_design',
    tags: ['运动场景', '瑜伽', '室内'],
    keywords: ['瑜伽场景', '健身场景', '冥想场景', '运动房'],
    priority: 3,
    source: 'manual',
    examples: ['瑜伽垫', '运动服', '健身器材']
  },
  {
    id: 'scene-056',
    text: '健身房场景使用镜面墙和专业器械，搭配明亮灯光，展现专业运动环境',
    category: 'scene_design',
    tags: ['运动场景', '健身房', '室内'],
    keywords: ['健身房场景', '健身场景', '运动房', '训练场景'],
    priority: 3,
    source: 'manual',
    examples: ['健身器材', '运动服装', '营养补剂']
  },
  {
    id: 'scene-057',
    text: '游泳池场景使用蓝色水面和瓷砖背景，搭配自然光线和水面波纹，营造清凉感',
    category: 'scene_design',
    tags: ['运动场景', '游泳', '室内'],
    keywords: ['游泳池场景', '游泳场景', '泳池场景', '水上运动'],
    priority: 3,
    source: 'manual',
    examples: ['泳衣', '泳镜', '游泳用品']
  },
  {
    id: 'scene-058',
    text: '网球场场景使用绿色球场和围网背景，搭配阳光和动感姿态，展现运动活力',
    category: 'scene_design',
    tags: ['运动场景', '网球', '户外'],
    keywords: ['网球场场景', '网球场景', '球场场景', '运动场地'],
    priority: 3,
    source: 'manual',
    examples: ['网球拍', '网球服', '运动鞋']
  },
  {
    id: 'scene-059',
    text: '高尔夫球场场景使用绿色草坪和湖泊背景，搭配蓝天白云，营造高端运动氛围',
    category: 'scene_design',
    tags: ['运动场景', '高尔夫', '户外'],
    keywords: ['高尔夫场景', '高尔夫球场', '高端运动', '草坪场景'],
    priority: 4,
    source: 'manual',
    examples: ['高尔夫球杆', '高尔夫服装', '运动配件']
  },
  {
    id: 'scene-060',
    text: '咖啡厅场景使用木质桌椅和暖色调灯光，搭配咖啡杯和书籍，营造温馨氛围',
    category: 'scene_design',
    tags: ['商业场景', '咖啡厅', '室内'],
    keywords: ['咖啡厅场景', '咖啡馆场景', '咖啡店', '休闲场景'],
    priority: 4,
    source: 'manual',
    examples: ['咖啡', '甜点', '咖啡器具']
  },
  {
    id: 'scene-061',
    text: '酒吧场景使用暗色调和霓虹灯光，搭配酒瓶和高脚椅，营造时尚夜生活氛围',
    category: 'scene_design',
    tags: ['商业场景', '酒吧', '室内'],
    keywords: ['酒吧场景', '夜店场景', '酒廊场景', '夜生活场景'],
    priority: 4,
    source: 'manual',
    examples: ['酒类', '鸡尾酒', '酒吧用品']
  },
  {
    id: 'scene-062',
    text: '餐厅场景使用精致餐具和优雅装饰，搭配柔和灯光，营造高档用餐氛围',
    category: 'scene_design',
    tags: ['商业场景', '餐厅', '室内'],
    keywords: ['餐厅场景', '用餐场景', '餐饮场景', '高档餐厅'],
    priority: 4,
    source: 'manual',
    examples: ['餐具', '美食', '餐厅用品']
  },
  {
    id: 'scene-063',
    text: '书店场景使用书架和阅读区，搭配暖色灯光和咖啡角，营造文艺氛围',
    category: 'scene_design',
    tags: ['商业场景', '书店', '室内'],
    keywords: ['书店场景', '图书馆场景', '阅读场景', '文化场景'],
    priority: 3,
    source: 'manual',
    examples: ['书籍', '文具', '阅读灯']
  },
  {
    id: 'scene-064',
    text: '花店场景使用鲜花展示架和绿色植物，搭配自然光线，营造清新浪漫氛围',
    category: 'scene_design',
    tags: ['商业场景', '花店', '室内'],
    keywords: ['花店场景', '鲜花店', '花卉场景', '花艺场景'],
    priority: 3,
    source: 'manual',
    examples: ['鲜花', '花瓶', '园艺用品']
  },
  {
    id: 'scene-065',
    text: '烘焙店场景使用面包展示柜和烤箱背景，搭配暖色灯光和面粉元素，营造温馨甜蜜感',
    category: 'scene_design',
    tags: ['商业场景', '烘焙店', '室内'],
    keywords: ['烘焙店场景', '面包房场景', '甜品店场景', '蛋糕店'],
    priority: 3,
    source: 'manual',
    examples: ['面包', '蛋糕', '烘焙工具']
  },
  {
    id: 'scene-066',
    text: '服装店场景使用展示架和试衣间，搭配时尚灯光和模特，营造购物氛围',
    category: 'scene_design',
    tags: ['商业场景', '服装店', '室内'],
    keywords: ['服装店场景', '时装店场景', '服装店', '购物场景'],
    priority: 4,
    source: 'manual',
    examples: ['服装', '时尚配饰', '鞋包']
  },
  {
    id: 'scene-067',
    text: '珠宝店场景使用玻璃展示柜和聚焦灯光，搭配深色背景，营造奢华精致感',
    category: 'scene_design',
    tags: ['商业场景', '珠宝店', '室内'],
    keywords: ['珠宝店场景', '首饰店场景', '奢侈品店', '高端商场'],
    priority: 5,
    source: 'manual',
    examples: ['珠宝首饰', '钻石', '手表']
  },
  {
    id: 'scene-068',
    text: '电子产品店场景使用科技感灯光和产品展示台，搭配蓝色调元素，展现现代科技感',
    category: 'scene_design',
    tags: ['商业场景', '电子产品店', '室内'],
    keywords: ['电子产品店场景', '数码店场景', '科技店', '电器商城'],
    priority: 4,
    source: 'manual',
    examples: ['电子产品', '数码设备', '智能设备']
  },
  {
    id: 'scene-069',
    text: '健身房前台场景使用品牌标识和接待区，搭配运动元素装饰，展现专业健身形象',
    category: 'scene_design',
    tags: ['商业场景', '健身房', '室内'],
    keywords: ['健身房前台', '健身中心', '运动馆前台', '健身俱乐部'],
    priority: 3,
    source: 'manual',
    examples: ['健身会员卡', '运动装备', '营养品']
  },
  {
    id: 'scene-070',
    text: '美发沙龙场景使用镜面和理发椅，搭配时尚灯光和发型杂志，营造专业美发氛围',
    category: 'scene_design',
    tags: ['商业场景', '美发沙龙', '室内'],
    keywords: ['美发沙龙场景', '理发店场景', '发型屋', '美发店'],
    priority: 3,
    source: 'manual',
    examples: ['美发产品', '发型工具', '护发用品']
  },
  {
    id: 'scene-071',
    text: '水疗中心场景使用柔和灯光和自然石材，搭配香薰和绿植，营造放松疗愈氛围',
    category: 'scene_design',
    tags: ['商业场景', '水疗中心', '室内'],
    keywords: ['水疗中心场景', 'SPA场景', '养生馆场景', '美容院场景'],
    priority: 4,
    source: 'manual',
    examples: ['护肤产品', '精油', '美容仪器']
  },
  {
    id: 'scene-072',
    text: '儿童乐园场景使用彩色游乐设施和安全地垫，搭配卡通元素和明亮色彩，营造欢乐氛围',
    category: 'scene_design',
    tags: ['商业场景', '儿童乐园', '室内'],
    keywords: ['儿童乐园场景', '游乐场场景', '亲子场景', '儿童活动区'],
    priority: 3,
    source: 'manual',
    examples: ['儿童玩具', '儿童服装', '亲子用品']
  },
  {
    id: 'scene-073',
    text: '宠物店场景使用宠物展示区和宠物用品，搭配温馨灯光，营造萌宠可爱氛围',
    category: 'scene_design',
    tags: ['商业场景', '宠物店', '室内'],
    keywords: ['宠物店场景', '宠物店', '萌宠场景', '动物用品店'],
    priority: 3,
    source: 'manual',
    examples: ['宠物食品', '宠物用品', '宠物玩具']
  },
  {
    id: 'scene-074',
    text: '赛车场景使用赛道和观众席背景，搭配赛车和速度线，展现极速竞技氛围',
    category: 'scene_design',
    tags: ['运动场景', '赛车', '户外'],
    keywords: ['赛车场景', '赛道场景', 'F1场景', '汽车比赛'],
    priority: 4,
    source: 'manual',
    examples: ['赛车模型', '汽车配件', '赛车服装']
  },
  {
    id: 'scene-075',
    text: '马术场景使用马厩和草地背景，搭配骑马装备和优雅姿态，展现贵族运动氛围',
    category: 'scene_design',
    tags: ['运动场景', '马术', '户外'],
    keywords: ['马术场景', '骑马场景', '马场场景', '贵族运动'],
    priority: 4,
    source: 'manual',
    examples: ['马术装备', '骑马用品', '马术服装']
  },
  {
    id: 'scene-076',
    text: '滑板场景使用滑板公园和街头元素，搭配涂鸦和街头风格，展现潮流运动文化',
    category: 'scene_design',
    tags: ['运动场景', '滑板', '街头'],
    keywords: ['滑板场景', '滑板公园', '街头运动', '极限运动'],
    priority: 3,
    source: 'manual',
    examples: ['滑板', '街头服饰', '极限运动装备']
  },
  {
    id: 'scene-077',
    text: '拳击场景使用拳击台和灯光聚焦，搭配拳击手套和运动姿态，展现力量与激情',
    category: 'scene_design',
    tags: ['运动场景', '拳击', '室内'],
    keywords: ['拳击场景', '拳击台场景', '格斗场景', '搏击场景'],
    priority: 3,
    source: 'manual',
    examples: ['拳击手套', '拳击装备', '运动服装']
  },
  {
    id: 'scene-078',
    text: '瑜伽户外场景使用草地或沙滩背景，搭配自然光线和瑜伽垫，营造身心健康氛围',
    category: 'scene_design',
    tags: ['运动场景', '瑜伽', '户外'],
    keywords: ['户外瑜伽场景', '沙滩瑜伽', '草地瑜伽', '自然瑜伽'],
    priority: 3,
    source: 'manual',
    examples: ['瑜伽垫', '瑜伽服', '冥想用品']
  },
  {
    id: 'scene-079',
    text: '皮划艇场景使用湖面或河流背景，搭配水面波纹和自然风光，展现水上运动魅力',
    category: 'scene_design',
    tags: ['运动场景', '皮划艇', '水上'],
    keywords: ['皮划艇场景', '划船场景', '水上运动', '湖泊场景'],
    priority: 3,
    source: 'manual',
    examples: ['皮划艇', '划船装备', '水上运动用品']
  },
  {
    id: 'scene-080',
    text: '帆船场景使用大海和蓝天背景，搭配白帆和海浪，展现自由航海氛围',
    category: 'scene_design',
    tags: ['运动场景', '帆船', '海上'],
    keywords: ['帆船场景', '航海场景', '游艇场景', '海上运动'],
    priority: 4,
    source: 'manual',
    examples: ['帆船模型', '航海装备', '海上用品']
  },
  {
    id: 'scene-081',
    text: '跳伞场景使用天空和云层背景，搭配自由落体姿态和开阔视野，展现极限运动刺激感',
    category: 'scene_design',
    tags: ['运动场景', '跳伞', '空中'],
    keywords: ['跳伞场景', '跳伞运动', '高空跳伞', '极限运动'],
    priority: 3,
    source: 'manual',
    examples: ['跳伞装备', '降落伞', '极限运动用品']
  },
  {
    id: 'scene-082',
    text: '蹦极场景使用桥梁或平台背景，搭配跳跃姿态和惊险氛围，展现极限挑战精神',
    category: 'scene_design',
    tags: ['运动场景', '蹦极', '户外'],
    keywords: ['蹦极场景', '蹦极跳', '极限挑战', '高空挑战'],
    priority: 3,
    source: 'manual',
    examples: ['蹦极装备', '极限运动用品', '户外装备']
  },
  {
    id: 'scene-083',
    text: '滑翔伞场景使用山谷和天空背景，搭配飞行姿态和开阔视野，展现空中运动自由感',
    category: 'scene_design',
    tags: ['运动场景', '滑翔伞', '空中'],
    keywords: ['滑翔伞场景', '滑翔运动', '空中运动', '飞行场景'],
    priority: 3,
    source: 'manual',
    examples: ['滑翔伞装备', '飞行用品', '户外装备']
  },
  {
    id: 'scene-084',
    text: '热气球场景使用日出或日落背景，搭配多彩热气球和云层，营造浪漫梦幻氛围',
    category: 'scene_design',
    tags: ['运动场景', '热气球', '空中'],
    keywords: ['热气球场景', '气球场景', '空中观光', '浪漫场景'],
    priority: 3,
    source: 'manual',
    examples: ['热气球模型', '旅行用品', '浪漫礼物']
  },
  {
    id: 'scene-085',
    text: '沙漠场景使用沙丘和蓝天背景，搭配骆驼和沙漠植物，展现荒野探险氛围',
    category: 'scene_design',
    tags: ['自然场景', '沙漠', '户外'],
    keywords: ['沙漠场景', '沙丘场景', '荒漠场景', '探险场景'],
    priority: 3,
    source: 'manual',
    examples: ['户外装备', '探险用品', '防晒用品']
  },
  {
    id: 'scene-086',
    text: '冰川场景使用冰山和极光背景，搭配蓝色调元素和冰雪质感，展现极地神秘感',
    category: 'scene_design',
    tags: ['自然场景', '冰川', '极地'],
    keywords: ['冰川场景', '极地场景', '冰雪场景', '北极场景'],
    priority: 4,
    source: 'manual',
    examples: ['保暖装备', '户外用品', '探险装备']
  },
  {
    id: 'scene-087',
    text: '火山场景使用熔岩和烟雾背景，搭配红色调和岩石元素，展现壮观地质奇观',
    category: 'scene_design',
    tags: ['自然场景', '火山', '地质'],
    keywords: ['火山场景', '熔岩场景', '地质奇观', '火山景观'],
    priority: 3,
    source: 'manual',
    examples: ['探险装备', '户外用品', '地质模型']
  },
  {
    id: 'scene-088',
    text: '瀑布场景使用水流和岩石背景，搭配水雾和彩虹效果，营造自然壮美感',
    category: 'scene_design',
    tags: ['自然场景', '瀑布', '水域'],
    keywords: ['瀑布场景', '水流场景', '自然风景', '山水场景'],
    priority: 3,
    source: 'manual',
    examples: ['户外装备', '旅行用品', '防水用品']
  },
  {
    id: 'scene-089',
    text: '热带雨林场景使用茂密植被和热带植物背景，搭配雾气和阳光穿透效果，营造神秘丛林感',
    category: 'scene_design',
    tags: ['自然场景', '热带雨林', '丛林'],
    keywords: ['热带雨林场景', '丛林场景', '森林场景', '热带植物'],
    priority: 3,
    source: 'manual',
    examples: ['户外装备', '探险用品', '旅行装备']
  },
  {
    id: 'scene-090',
    text: '珊瑚礁场景使用水下光线和彩色珊瑚背景，搭配热带鱼和海洋生物，展现海底奇观',
    category: 'scene_design',
    tags: ['自然场景', '珊瑚礁', '海洋'],
    keywords: ['珊瑚礁场景', '海底场景', '海洋场景', '水下世界'],
    priority: 4,
    source: 'manual',
    examples: ['潜水装备', '水下相机', '海洋主题产品']
  },
  {
    id: 'scene-091',
    text: '樱花场景使用粉色樱花和蓝天背景，搭配飘落花瓣效果，营造浪漫春日氛围',
    category: 'scene_design',
    tags: ['自然场景', '樱花', '春季'],
    keywords: ['樱花场景', '春季场景', '赏花场景', '浪漫场景'],
    priority: 4,
    source: 'manual',
    examples: ['春季服装', '化妆品', '浪漫礼物']
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
  },

  // ==================== 特殊效果 (15条) ====================
  {
    id: 'light-021',
    text: '高调照明使用明亮均匀的光线，适合展示浅色产品和清新风格，背景曝光略高于产品',
    category: 'lighting',
    tags: ['特殊效果', '高调', '明亮'],
    keywords: ['高调照明', '高调光', '明亮光线', '清新光线', '高曝光'],
    priority: 4,
    source: 'manual',
    examples: ['白色产品', '护肤品', '健康食品']
  },
  {
    id: 'light-021a',
    text: '低调照明使用暗背景和精确聚光，适合展示高端产品和神秘感，营造戏剧性效果',
    category: 'lighting',
    tags: ['特殊效果', '低调', '神秘'],
    keywords: ['低调照明', '低调光', '暗调光线', '戏剧光线', '低曝光'],
    priority: 5,
    source: 'manual',
    examples: ['奢侈品', '珠宝', '香水']
  },
  {
    id: 'light-022',
    text: '轮廓光从产品后方或侧后方照射，勾勒产品轮廓边缘，适合展示透明或半透明产品',
    category: 'lighting',
    tags: ['特殊效果', '轮廓光', '边缘光'],
    keywords: ['轮廓光', 'rim light', '边缘光', '勾边光', '背光'],
    priority: 4,
    source: 'manual',
    examples: ['香水瓶', '玻璃制品', '珠宝']
  },
  {
    id: 'light-022a',
    text: '蝴蝶光从正前方45度向下照射，在鼻下形成蝴蝶形阴影，适合美妆人像展示',
    category: 'lighting',
    tags: ['特殊效果', '蝴蝶光', '人像'],
    keywords: ['蝴蝶光', 'butterfly light', '美妆光线', '人像光线', '正面光'],
    priority: 4,
    source: 'manual',
    examples: ['美妆人像', '模特展示', '彩妆广告']
  },
  {
    id: 'light-023',
    text: '伦勃朗光从侧上方照射，在面部形成三角形光斑，适合展示立体感和戏剧效果',
    category: 'lighting',
    tags: ['特殊效果', '伦勃朗光', '戏剧'],
    keywords: ['伦勃朗光', 'Rembrandt light', '三角光', '戏剧光线', '艺术光线'],
    priority: 3,
    source: 'manual',
    examples: ['人像摄影', '艺术展示', '高端广告']
  },
  {
    id: 'light-024',
    text: '分割光从正侧面照射，一半亮一半暗，适合展示产品的双面性或神秘感',
    category: 'lighting',
    tags: ['特殊效果', '分割光', '侧光'],
    keywords: ['分割光', 'split light', '侧光', '对半光', '对比光线'],
    priority: 3,
    source: 'manual',
    examples: ['创意产品', '艺术展示', '潮流产品']
  },
  {
    id: 'light-025',
    text: '环形光在镜头周围形成环形光源，产生无影效果，适合珠宝和微距产品展示',
    category: 'lighting',
    tags: ['特殊效果', '环形光', '无影'],
    keywords: ['环形光', 'ring light', '无影光', '环形闪光灯', '微距光线'],
    priority: 4,
    source: 'manual',
    examples: ['珠宝展示', '微距摄影', '美妆展示']
  },
  {
    id: 'light-026',
    text: '聚光使用点光源集中照射，突出产品特定区域或细节，适合展示产品特色功能',
    category: 'lighting',
    tags: ['特殊效果', '聚光', '点光源'],
    keywords: ['聚光', 'spot light', '点光源', '重点光', '特写光线'],
    priority: 4,
    source: 'manual',
    examples: ['产品细节', '功能展示', '特色展示']
  },
  {
    id: 'light-027',
    text: '漫射光通过柔光设备产生均匀柔和的光线，适合展示需要细腻质感的产品',
    category: 'lighting',
    tags: ['特殊效果', '漫射光', '柔和'],
    keywords: ['漫射光', 'diffused light', '柔光', '散射光', '均匀光线'],
    priority: 4,
    source: 'manual',
    examples: ['护肤品', '服装', '家居用品']
  },
  {
    id: 'light-028',
    text: '反光板补光使用白色或银色反光板反射光线，填充阴影区域，降低光比',
    category: 'lighting',
    tags: ['特殊效果', '反光板', '补光'],
    keywords: ['反光板', 'reflector', '补光', '填充光', '反射光'],
    priority: 4,
    source: 'manual',
    examples: ['人像摄影', '产品展示', '户外拍摄']
  },
  {
    id: 'light-029',
    text: '多灯组合使用多个光源从不同角度照射，创造丰富的层次感和立体效果',
    category: 'lighting',
    tags: ['特殊效果', '多灯', '组合'],
    keywords: ['多灯组合', 'multi-light', '组合布光', '复杂布光', '专业布光'],
    priority: 4,
    source: 'manual',
    examples: ['专业产品摄影', '高端广告', '商业摄影']
  },
  {
    id: 'light-030',
    text: '混合光色温使用不同色温的光源创造冷暖对比效果，增加画面层次和氛围',
    category: 'lighting',
    tags: ['特殊效果', '混合光', '色温'],
    keywords: ['混合光', 'mixed light', '色温对比', '冷暖对比', '双色温'],
    priority: 3,
    source: 'manual',
    examples: ['创意摄影', '氛围展示', '艺术产品']
  },

  // ==================== 产品特定打光 (10条) ====================
  {
    id: 'light-031',
    text: '化妆品打光建议使用柔光为主，配合少量轮廓光突出瓶身曲线，避免直射产生高光点',
    category: 'lighting',
    tags: ['产品打光', '化妆品', '柔光'],
    keywords: ['化妆品打光', '美妆产品光线', '护肤品光线', '化妆品布光'],
    priority: 5,
    source: 'manual',
    examples: ['口红', '粉底', '精华液']
  },
  {
    id: 'light-032',
    text: '珠宝打光建议使用多点小光源创造闪耀效果，配合深色背景突出宝石光泽',
    category: 'lighting',
    tags: ['产品打光', '珠宝', '闪耀'],
    keywords: ['珠宝打光', '宝石光线', '钻石光线', '首饰布光'],
    priority: 5,
    source: 'manual',
    examples: ['钻石', '宝石', '黄金首饰']
  },
  {
    id: 'light-033',
    text: '电子产品打光建议使用硬光突出科技感，配合蓝色或紫色氛围光营造未来感',
    category: 'lighting',
    tags: ['产品打光', '电子产品', '科技'],
    keywords: ['电子产品打光', '数码产品光线', '科技产品布光', '手机光线'],
    priority: 5,
    source: 'manual',
    examples: ['手机', '耳机', '键盘']
  },
  {
    id: 'light-034',
    text: '服装打光建议使用大面积柔光，均匀照亮整体，配合侧光展示面料质感',
    category: 'lighting',
    tags: ['产品打光', '服装', '柔光'],
    keywords: ['服装打光', '衣服光线', '面料光线', '服装布光'],
    priority: 4,
    source: 'manual',
    examples: ['连衣裙', '外套', 'T恤']
  },
  {
    id: 'light-035',
    text: '食品打光建议使用暖色调侧光，突出食物质感和新鲜度，营造食欲感',
    category: 'lighting',
    tags: ['产品打光', '食品', '暖光'],
    keywords: ['食品打光', '美食光线', '食物布光', '餐饮光线'],
    priority: 4,
    source: 'manual',
    examples: ['零食', '饮料', '烘焙食品']
  },
  {
    id: 'light-036',
    text: '手表打光建议使用多角度小光源，突出金属光泽和表盘细节，避免镜面反射',
    category: 'lighting',
    tags: ['产品打光', '手表', '金属'],
    keywords: ['手表打光', '腕表光线', '表盘光线', '手表布光'],
    priority: 5,
    source: 'manual',
    examples: ['机械表', '智能手表', '石英表']
  },
  {
    id: 'light-037',
    text: '鞋类打光建议使用侧光突出鞋型轮廓，配合柔和顶光展示鞋面材质',
    category: 'lighting',
    tags: ['产品打光', '鞋类', '轮廓'],
    keywords: ['鞋子打光', '运动鞋光线', '皮鞋光线', '鞋类布光'],
    priority: 4,
    source: 'manual',
    examples: ['运动鞋', '高跟鞋', '靴子']
  },
  {
    id: 'light-038',
    text: '包袋打光建议使用大面积柔光，配合侧光展示皮质纹理和五金细节',
    category: 'lighting',
    tags: ['产品打光', '包袋', '纹理'],
    keywords: ['包袋打光', '皮包光线', '手袋光线', '包包布光'],
    priority: 4,
    source: 'manual',
    examples: ['手提包', '双肩包', '钱包']
  },
  {
    id: 'light-039',
    text: '玻璃制品打光建议使用背光和侧光组合，突出透明感和轮廓线，避免正面直射',
    category: 'lighting',
    tags: ['产品打光', '玻璃', '透明'],
    keywords: ['玻璃打光', '透明制品光线', '水晶光线', '玻璃布光'],
    priority: 4,
    source: 'manual',
    examples: ['香水瓶', '玻璃杯', '水晶制品']
  },
  {
    id: 'light-040',
    text: '运动装备打光建议使用动感的斜向光线，配合活力色彩营造运动氛围',
    category: 'lighting',
    tags: ['产品打光', '运动', '动感'],
    keywords: ['运动装备打光', '体育用品光线', '运动产品布光', '动感光线'],
    priority: 4,
    source: 'manual',
    examples: ['运动鞋', '运动服', '健身器材']
  },
  // 季节光线
  {
    id: 'light-041',
    text: '春季光线建议使用柔和的暖色调，配合淡粉色和浅绿色营造生机勃勃的氛围',
    category: 'lighting',
    tags: ['季节光线', '春季', '柔和'],
    keywords: ['春季打光', '春天光线', '春季氛围', '生机光线'],
    priority: 3,
    source: 'manual',
    examples: ['春装展示', '花卉产品', '春季护肤品']
  },
  {
    id: 'light-042',
    text: '夏季光线建议使用明亮的白色调，配合高对比度展现活力和清爽感',
    category: 'lighting',
    tags: ['季节光线', '夏季', '明亮'],
    keywords: ['夏季打光', '夏天光线', '夏日阳光', '清爽光线'],
    priority: 3,
    source: 'manual',
    examples: ['夏装展示', '防晒产品', '夏日饮品']
  },
  {
    id: 'light-043',
    text: '秋季光线建议使用温暖的金黄色调，配合橙红色渐变营造丰收和温馨感',
    category: 'lighting',
    tags: ['季节光线', '秋季', '温暖'],
    keywords: ['秋季打光', '秋天光线', '金秋氛围', '丰收光线'],
    priority: 3,
    source: 'manual',
    examples: ['秋装展示', '护肤品', '秋季食品']
  },
  {
    id: 'light-044',
    text: '冬季光线建议使用冷色调蓝白色，配合柔和阴影营造冰雪和温暖对比感',
    category: 'lighting',
    tags: ['季节光线', '冬季', '冷调'],
    keywords: ['冬季打光', '冬天光线', '冰雪氛围', '寒季光线'],
    priority: 3,
    source: 'manual',
    examples: ['冬装展示', '护肤品', '节日礼品']
  },
  // 时间光线
  {
    id: 'light-045',
    text: '清晨光线建议使用柔和的蓝粉色渐变，配合低角度侧光营造清新氛围',
    category: 'lighting',
    tags: ['时间光线', '清晨', '清新'],
    keywords: ['清晨打光', '黎明光线', '早晨氛围', '日出光线'],
    priority: 3,
    source: 'manual',
    examples: ['早餐食品', '护肤品', '运动装备']
  },
  {
    id: 'light-046',
    text: '正午光线建议使用明亮的白色调，配合高位置垂直光展现清晰和真实感',
    category: 'lighting',
    tags: ['时间光线', '正午', '明亮'],
    keywords: ['正午打光', '中午光线', '日光氛围', '明亮光线'],
    priority: 3,
    source: 'manual',
    examples: ['食品展示', '电子产品', '日用品']
  },
  {
    id: 'light-047',
    text: '黄昏光线建议使用温暖的橙红色调，配合低角度侧光营造浪漫和温暖感',
    category: 'lighting',
    tags: ['时间光线', '黄昏', '温暖'],
    keywords: ['黄昏打光', '夕阳光线', '傍晚氛围', '落日光效'],
    priority: 4,
    source: 'manual',
    examples: ['酒类产品', '香水', '珠宝首饰']
  },
  {
    id: 'light-048',
    text: '夜晚光线建议使用深沉的蓝紫色调，配合点状光源营造神秘和高级感',
    category: 'lighting',
    tags: ['时间光线', '夜晚', '神秘'],
    keywords: ['夜晚打光', '夜间光线', '深夜氛围', '神秘光效'],
    priority: 4,
    source: 'manual',
    examples: ['香水', '珠宝', '高端酒类']
  },
  // 情绪光线
  {
    id: 'light-049',
    text: '浪漫光线建议使用柔和的粉色和紫色，配合漫射光营造梦幻和甜蜜感',
    category: 'lighting',
    tags: ['情绪光线', '浪漫', '梦幻'],
    keywords: ['浪漫打光', '梦幻光线', '甜蜜氛围', '爱情光效'],
    priority: 4,
    source: 'manual',
    examples: ['礼品', '香水', '珠宝首饰']
  },
  {
    id: 'light-050',
    text: '专业光线建议使用中性的白光，配合均匀布光展现真实和专业感',
    category: 'lighting',
    tags: ['情绪光线', '专业', '中性'],
    keywords: ['专业打光', '商务光线', '正式氛围', '商业光效'],
    priority: 5,
    source: 'manual',
    examples: ['商务产品', '办公用品', '医疗器械']
  },
  {
    id: 'light-051',
    text: '活力光线建议使用明亮的多色彩，配合动态阴影营造活力和动感',
    category: 'lighting',
    tags: ['情绪光线', '活力', '动感'],
    keywords: ['活力打光', '动感光线', '青春氛围', '能量光效'],
    priority: 4,
    source: 'manual',
    examples: ['运动产品', '饮料', '时尚配饰']
  },
  {
    id: 'light-052',
    text: '宁静光线建议使用柔和的蓝绿色调，配合低对比度营造平静和放松感',
    category: 'lighting',
    tags: ['情绪光线', '宁静', '放松'],
    keywords: ['宁静打光', '平静光线', '放松氛围', '禅意光效'],
    priority: 4,
    source: 'manual',
    examples: ['茶具', '瑜伽用品', '香薰产品']
  },
  {
    id: 'light-053',
    text: '神秘光线建议使用深沉的紫蓝色，配合聚光营造神秘和高级感',
    category: 'lighting',
    tags: ['情绪光线', '神秘', '高级'],
    keywords: ['神秘打光', '高级光线', '奢华氛围', '精致光效'],
    priority: 4,
    source: 'manual',
    examples: ['香水', '珠宝', '高端化妆品']
  },
  {
    id: 'light-054',
    text: '温馨光线建议使用柔和的暖黄色，配合漫射光营造温暖和舒适感',
    category: 'lighting',
    tags: ['情绪光线', '温馨', '舒适'],
    keywords: ['温馨打光', '舒适光线', '家氛围', '温暖光效'],
    priority: 4,
    source: 'manual',
    examples: ['家居用品', '家纺', '母婴产品']
  },
  // 材质光线
  {
    id: 'light-055',
    text: '金属材质打光建议使用硬光源配合高光点，展现金属的光泽和质感',
    category: 'lighting',
    tags: ['材质光线', '金属', '光泽'],
    keywords: ['金属打光', '金属材质光线', '金属布光', '光泽光效'],
    priority: 5,
    source: 'manual',
    examples: ['手表', '珠宝', '电子产品']
  },
  {
    id: 'light-056',
    text: '玻璃材质打光建议使用背光配合柔光箱，展现玻璃的透明和折射效果',
    category: 'lighting',
    tags: ['材质光线', '玻璃', '透明'],
    keywords: ['玻璃打光', '玻璃材质光线', '透明布光', '折射光效'],
    priority: 5,
    source: 'manual',
    examples: ['香水瓶', '玻璃杯', '眼镜']
  },
  {
    id: 'light-057',
    text: '皮革材质打光建议使用侧光配合中等柔光，展现皮革的纹理和质感',
    category: 'lighting',
    tags: ['材质光线', '皮革', '纹理'],
    keywords: ['皮革打光', '皮革材质光线', '真皮布光', '纹理光效'],
    priority: 5,
    source: 'manual',
    examples: ['皮包', '皮鞋', '皮带']
  },
  {
    id: 'light-058',
    text: '丝绸材质打光建议使用柔和的侧光，展现丝绸的光泽和流动感',
    category: 'lighting',
    tags: ['材质光线', '丝绸', '流动'],
    keywords: ['丝绸打光', '丝绸材质光线', '丝质布光', '流动光效'],
    priority: 4,
    source: 'manual',
    examples: ['丝巾', '睡衣', '礼服']
  },
  {
    id: 'light-059',
    text: '绒毛材质打光建议使用柔和的漫射光，展现绒毛的柔软和温暖感',
    category: 'lighting',
    tags: ['材质光线', '绒毛', '柔软'],
    keywords: ['绒毛打光', '绒毛材质光线', '毛绒布光', '柔软光效'],
    priority: 4,
    source: 'manual',
    examples: ['毛绒玩具', '羽绒服', '毛衣']
  },
  {
    id: 'light-060',
    text: '陶瓷材质打光建议使用柔和的环境光配合高光点，展现陶瓷的光滑和质感',
    category: 'lighting',
    tags: ['材质光线', '陶瓷', '光滑'],
    keywords: ['陶瓷打光', '陶瓷材质光线', '瓷器布光', '光滑光效'],
    priority: 4,
    source: 'manual',
    examples: ['茶具', '花瓶', '餐具']
  },
  {
    id: 'light-061',
    text: '木质材质打光建议使用温暖的侧光，展现木材的纹理和自然感',
    category: 'lighting',
    tags: ['材质光线', '木质', '自然'],
    keywords: ['木质打光', '木材光线', '木制品布光', '自然光效'],
    priority: 4,
    source: 'manual',
    examples: ['家具', '木雕', '乐器']
  },
  {
    id: 'light-062',
    text: '石材材质打光建议使用硬光源配合质感阴影，展现石材的厚重和质感',
    category: 'lighting',
    tags: ['材质光线', '石材', '厚重'],
    keywords: ['石材打光', '石头光线', '大理石布光', '厚重光效'],
    priority: 4,
    source: 'manual',
    examples: ['石材家具', '雕塑', '建筑装饰']
  },
  // 光源类型
  {
    id: 'light-063',
    text: '自然光拍摄建议利用窗户光或户外光，配合反光板填充阴影',
    category: 'lighting',
    tags: ['光源类型', '自然光', '窗户'],
    keywords: ['自然光打光', '日光拍摄', '户外光线', '窗户光'],
    priority: 5,
    source: 'manual',
    examples: ['人像产品', '食品', '生活用品']
  },
  {
    id: 'light-064',
    text: '环形灯拍摄建议用于美妆和珠宝，提供均匀的无影光效',
    category: 'lighting',
    tags: ['光源类型', '环形灯', '无影'],
    keywords: ['环形灯打光', '美妆光线', '无影光', '环光拍摄'],
    priority: 5,
    source: 'manual',
    examples: ['美妆产品', '珠宝', '小型商品']
  },
  {
    id: 'light-065',
    text: '柔光箱拍摄建议用于大部分产品，提供柔和均匀的漫射光',
    category: 'lighting',
    tags: ['光源类型', '柔光箱', '柔光'],
    keywords: ['柔光箱打光', '柔光拍摄', '箱光布光', '漫射光线'],
    priority: 5,
    source: 'manual',
    examples: ['服装', '电子产品', '日用品']
  },
  {
    id: 'light-066',
    text: '聚光灯拍摄建议用于强调产品细节，创造戏剧性的光影效果',
    category: 'lighting',
    tags: ['光源类型', '聚光灯', '戏剧'],
    keywords: ['聚光灯打光', '聚光拍摄', '重点光', '戏剧光效'],
    priority: 4,
    source: 'manual',
    examples: ['艺术品', '珠宝', '高端产品']
  },
  {
    id: 'light-067',
    text: 'LED灯带拍摄建议用于营造氛围，提供柔和的环境光和轮廓光',
    category: 'lighting',
    tags: ['光源类型', 'LED', '氛围'],
    keywords: ['LED打光', '灯带光线', '氛围光', '轮廓光'],
    priority: 4,
    source: 'manual',
    examples: ['科技产品', '家居', '装饰品']
  },
  {
    id: 'light-068',
    text: '闪光灯拍摄建议用于冻结动作，配合柔光罩避免硬阴影',
    category: 'lighting',
    tags: ['光源类型', '闪光灯', '冻结'],
    keywords: ['闪光灯打光', '闪光拍摄', '频闪光线', '瞬间光'],
    priority: 4,
    source: 'manual',
    examples: ['运动产品', '动态展示', '高速摄影']
  },
  // 光线效果
  {
    id: 'light-069',
    text: '高调光线建议使用明亮的背景和高光，营造清新和高级感',
    category: 'lighting',
    tags: ['光线效果', '高调', '明亮'],
    keywords: ['高调打光', '高调光线', '明亮效果', '高级光效'],
    priority: 4,
    source: 'manual',
    examples: ['化妆品', '护肤品', '时尚产品']
  },
  {
    id: 'light-070',
    text: '低调光线建议使用深色背景和有限光源，营造神秘和戏剧感',
    category: 'lighting',
    tags: ['光线效果', '低调', '神秘'],
    keywords: ['低调打光', '低调光线', '暗调效果', '戏剧光效'],
    priority: 4,
    source: 'manual',
    examples: ['高端酒类', '奢侈品', '艺术品']
  },
  {
    id: 'light-071',
    text: '伦勃朗光线建议使用45度侧光，营造经典和艺术感',
    category: 'lighting',
    tags: ['光线效果', '伦勃朗', '经典'],
    keywords: ['伦勃朗打光', '伦勃朗光线', '经典光效', '艺术布光'],
    priority: 4,
    source: 'manual',
    examples: ['艺术品', '肖像产品', '高端商品']
  },
  {
    id: 'light-072',
    text: '蝴蝶光线建议使用正上方光源，营造优雅和对称感',
    category: 'lighting',
    tags: ['光线效果', '蝴蝶光', '优雅'],
    keywords: ['蝴蝶打光', '蝴蝶光线', '派拉蒙光', '优雅光效'],
    priority: 4,
    source: 'manual',
    examples: ['美妆产品', '珠宝', '时尚配饰']
  },
  {
    id: 'light-073',
    text: '分离光线建议使用侧光将主体与背景分离，营造立体感',
    category: 'lighting',
    tags: ['光线效果', '分离光', '立体'],
    keywords: ['分离打光', '分离光线', '背景分离', '立体光效'],
    priority: 4,
    source: 'manual',
    examples: ['产品摄影', '静物', '艺术品']
  },
  {
    id: 'light-074',
    text: '轮廓光线建议使用背光勾勒产品轮廓，营造梦幻和高级感',
    category: 'lighting',
    tags: ['光线效果', '轮廓光', '梦幻'],
    keywords: ['轮廓打光', '轮廓光线', '边缘光', '逆光效果'],
    priority: 4,
    source: 'manual',
    examples: ['透明产品', '玻璃', '珠宝']
  },
  {
    id: 'light-075',
    text: '眼神光建议使用反光板或小光源，在产品表面创造亮点',
    category: 'lighting',
    tags: ['光线效果', '眼神光', '亮点'],
    keywords: ['眼神打光', '眼神光线', 'Catchlight', '高光点'],
    priority: 3,
    source: 'manual',
    examples: ['人偶', '眼镜', '反射产品']
  },
  // 特殊光线
  {
    id: 'light-076',
    text: '霓虹光线建议使用彩色LED灯，营造赛博朋克和未来感',
    category: 'lighting',
    tags: ['特殊光线', '霓虹', '未来'],
    keywords: ['霓虹打光', '霓虹光线', '赛博朋克光', '未来光效'],
    priority: 4,
    source: 'manual',
    examples: ['科技产品', '游戏周边', '街头风格']
  },
  {
    id: 'light-077',
    text: '烛光建议使用温暖的黄色点光源，营造温馨和浪漫感',
    category: 'lighting',
    tags: ['特殊光线', '烛光', '温馨'],
    keywords: ['烛光打光', '蜡烛光线', '温暖光效', '浪漫氛围'],
    priority: 4,
    source: 'manual',
    examples: ['香薰', '礼品', '节日产品']
  },
  {
    id: 'light-078',
    text: '火光建议使用动态的橙红色光源，营造温暖和活力感',
    category: 'lighting',
    tags: ['特殊光线', '火光', '温暖'],
    keywords: ['火光打光', '火焰光线', '营火氛围', '动态光效'],
    priority: 3,
    source: 'manual',
    examples: ['户外产品', '野营装备', '烧烤用品']
  },
  {
    id: 'light-079',
    text: '星光建议使用细小的点状光源，营造梦幻和童趣感',
    category: 'lighting',
    tags: ['特殊光线', '星光', '梦幻'],
    keywords: ['星光打光', '星空光线', '梦幻光效', '童话氛围'],
    priority: 3,
    source: 'manual',
    examples: ['儿童产品', '礼品', '节日装饰']
  },
  {
    id: 'light-080',
    text: '极光光线建议使用渐变的绿紫蓝色，营造神秘和梦幻感',
    category: 'lighting',
    tags: ['特殊光线', '极光', '神秘'],
    keywords: ['极光打光', '北极光光效', 'Aurora光线', '梦幻光效'],
    priority: 3,
    source: 'manual',
    examples: ['护肤品', '冬季产品', '限量版']
  },
  {
    id: 'light-081',
    text: '彩虹光线建议使用多彩渐变光源，营造活力和欢快感',
    category: 'lighting',
    tags: ['特殊光线', '彩虹', '活力'],
    keywords: ['彩虹打光', '彩虹光线', '多彩光效', '活力氛围'],
    priority: 3,
    source: 'manual',
    examples: ['儿童产品', '美妆', '派对用品']
  },
  // 光线控制
  {
    id: 'light-082',
    text: '光线衰减建议控制光源距离，创造从亮到暗的自然过渡',
    category: 'lighting',
    tags: ['光线控制', '衰减', '过渡'],
    keywords: ['光线衰减', '渐变光线', '衰减控制', '过渡光效'],
    priority: 4,
    source: 'manual',
    examples: ['产品摄影', '人像产品', '艺术品']
  },
  {
    id: 'light-083',
    text: '光线扩散建议使用柔光罩或扩散板，软化硬光源',
    category: 'lighting',
    tags: ['光线控制', '扩散', '柔化'],
    keywords: ['光线扩散', '扩散光效', '柔光技巧', '漫射光线'],
    priority: 5,
    source: 'manual',
    examples: ['人像产品', '食品', '日用品']
  },
  {
    id: 'light-084',
    text: '光线反射建议使用反光板填充阴影，平衡光比',
    category: 'lighting',
    tags: ['光线控制', '反射', '填充'],
    keywords: ['光线反射', '反光板技巧', '填充光', '补光技巧'],
    priority: 5,
    source: 'manual',
    examples: ['产品摄影', '人像', '静物']
  },
  {
    id: 'light-085',
    text: '光线遮挡建议使用遮光板控制光线范围，创造精确的光影',
    category: 'lighting',
    tags: ['光线控制', '遮挡', '精确'],
    keywords: ['光线遮挡', '遮光板技巧', '控光技巧', '精确布光'],
    priority: 4,
    source: 'manual',
    examples: ['高端产品', '艺术品', '珠宝']
  },
  {
    id: 'light-086',
    text: '光线混合建议组合不同色温的光源，创造丰富的光影层次',
    category: 'lighting',
    tags: ['光线控制', '混合', '层次'],
    keywords: ['光线混合', '混合色温', '多层次光线', '复合光效'],
    priority: 4,
    source: 'manual',
    examples: ['时尚产品', '创意摄影', '氛围展示']
  },
  // 行业光线
  {
    id: 'light-087',
    text: '电商主图光线建议使用均匀的柔光，确保产品细节清晰可见',
    category: 'lighting',
    tags: ['行业光线', '电商', '主图'],
    keywords: ['电商打光', '主图光线', '商品布光', '电商摄影光'],
    priority: 5,
    source: 'manual',
    examples: ['淘宝主图', '京东产品', '电商展示']
  },
  {
    id: 'light-088',
    text: '社交媒体光线建议使用自然和活力的光效，吸引年轻受众',
    category: 'lighting',
    tags: ['行业光线', '社交媒体', '活力'],
    keywords: ['社交媒体打光', 'Instagram光', '小红书光线', '网红产品光'],
    priority: 4,
    source: 'manual',
    examples: ['美妆', '时尚', '生活用品']
  },
  {
    id: 'light-089',
    text: '直播光线建议使用环形灯配合柔光箱，确保主播和产品都清晰',
    category: 'lighting',
    tags: ['行业光线', '直播', '清晰'],
    keywords: ['直播打光', '直播光线', '直播间布光', '主播光效'],
    priority: 5,
    source: 'manual',
    examples: ['直播带货', '美妆直播', '产品展示']
  },
  {
    id: 'light-090',
    text: '短视频光线建议使用动态和吸引眼球的光效，提高观看完播率',
    category: 'lighting',
    tags: ['行业光线', '短视频', '动态'],
    keywords: ['短视频打光', '抖音光线', 'TikTok光效', '视频布光'],
    priority: 4,
    source: 'manual',
    examples: ['抖音产品', '快手展示', '短视频内容']
  },
  {
    id: 'light-091',
    text: '奢侈品光线建议使用低调和精致的布光，展现品牌的高级感',
    category: 'lighting',
    tags: ['行业光线', '奢侈品', '精致'],
    keywords: ['奢侈品打光', '高端光线', '精品布光', '奢华光效'],
    priority: 5,
    source: 'manual',
    examples: ['名牌包', '高级珠宝', '豪华腕表']
  },
  {
    id: 'light-092',
    text: '快消品光线建议使用明亮和鲜艳的光效，吸引消费者的快速注意',
    category: 'lighting',
    tags: ['行业光线', '快消品', '鲜艳'],
    keywords: ['快消品打光', 'FMCG光线', '消费品布光', '促销光效'],
    priority: 4,
    source: 'manual',
    examples: ['零食', '饮料', '日用品']
  },
  {
    id: 'light-093',
    text: '科技产品光线建议使用冷色调和现代感的布光，展现科技感',
    category: 'lighting',
    tags: ['行业光线', '科技', '现代'],
    keywords: ['科技产品打光', '数码光线', '科技布光', '未来感光效'],
    priority: 5,
    source: 'manual',
    examples: ['手机', '电脑', '智能设备']
  },
  {
    id: 'light-094',
    text: '食品光线建议使用暖色调和诱人的光效，展现食品的美味感',
    category: 'lighting',
    tags: ['行业光线', '食品', '诱人'],
    keywords: ['食品打光', '美食光线', '食品布光', '美味光效'],
    priority: 5,
    source: 'manual',
    examples: ['餐厅菜品', '食品包装', '外卖展示']
  },
  {
    id: 'light-095',
    text: '美妆光线建议使用柔和高显色光，准确还原产品颜色',
    category: 'lighting',
    tags: ['行业光线', '美妆', '显色'],
    keywords: ['美妆打光', '化妆品光线', '美妆布光', '显色光效'],
    priority: 5,
    source: 'manual',
    examples: ['口红', '粉底', '眼影']
  },
  {
    id: 'light-096',
    text: '服装光线建议使用均匀的柔光，展现面料质感和色彩',
    category: 'lighting',
    tags: ['行业光线', '服装', '均匀'],
    keywords: ['服装打光', '衣服光线', '服装布光', '面料光效'],
    priority: 5,
    source: 'manual',
    examples: ['女装', '男装', '童装']
  },
  {
    id: 'light-097',
    text: '珠宝光线建议使用多角度的聚光和背光，展现宝石的闪耀',
    category: 'lighting',
    tags: ['行业光线', '珠宝', '闪耀'],
    keywords: ['珠宝打光', '首饰光线', '珠宝布光', '闪耀光效'],
    priority: 5,
    source: 'manual',
    examples: ['钻石', '宝石', '黄金首饰']
  },
  {
    id: 'light-098',
    text: '家具光线建议使用温暖的环境光，营造家居的舒适氛围',
    category: 'lighting',
    tags: ['行业光线', '家具', '舒适'],
    keywords: ['家具打光', '家居光线', '家具布光', '舒适光效'],
    priority: 4,
    source: 'manual',
    examples: ['沙发', '床品', '餐桌']
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
    keywords: ['二次元风', '动漫风', 'ACG风', '动漫风格', '日系动漫'],
    priority: 3,
    source: 'manual',
    examples: ['动漫周边', '游戏周边']
  },
  // 扩展风格模板 - 更具体的描述
  {
    id: 'style-021',
    text: '轻奢风格使用金属质感配件和大理石纹理，搭配柔和灯光和精致道具，适合展示珠宝、手表、高端化妆品',
    category: 'style_template',
    tags: ['奢华风', '轻奢', '精致'],
    keywords: ['轻奢风', '轻奢风格', '小奢', '精致奢华', '轻奢展示'],
    priority: 5,
    source: 'manual',
    examples: ['珠宝展示', '手表展示', '高端化妆品']
  },
  {
    id: 'style-022',
    text: '工业风格使用深灰色背景和金属支架，搭配水泥纹理和暖色灯光，适合展示男士用品、电子产品、工具',
    category: 'style_template',
    tags: ['工业风', '金属', '硬朗'],
    keywords: ['工业风', '工业风格', '硬朗风格', '金属风', '工业展示'],
    priority: 4,
    source: 'manual',
    examples: ['男士用品', '工具展示', '工业产品']
  },
  {
    id: 'style-023',
    text: 'ins风格使用粉色或米色背景，搭配绿植和杂志道具，注重构图美感和生活氛围，适合展示服饰、化妆品、家居',
    category: 'style_template',
    tags: ['潮流风', 'ins风', '网红'],
    keywords: ['ins风', 'ins风格', '网红风', 'Instagram风', 'ins展示'],
    priority: 4,
    source: 'manual',
    examples: ['网红产品', '服饰展示', '化妆品展示']
  },
  {
    id: 'style-024',
    text: '国潮风格融合中国传统元素和现代设计，使用国风配色和传统纹样，适合展示国货品牌、文创产品、茶叶',
    category: 'style_template',
    tags: ['潮流风', '国潮', '国风'],
    keywords: ['国潮风', '国潮风格', '中国风', '国货风', '新中式'],
    priority: 4,
    source: 'manual',
    examples: ['国货品牌', '文创产品', '茶叶展示']
  },
  {
    id: 'style-025',
    text: '森系风格使用大量绿植和木质元素，搭配自然光线和棉麻材质，营造清新自然氛围，适合展示护肤品、有机产品',
    category: 'style_template',
    tags: ['自然风', '森系', '清新'],
    keywords: ['森系风', '森系风格', '森林风', '清新自然', '森系展示'],
    priority: 4,
    source: 'manual',
    examples: ['护肤品展示', '有机产品', '天然产品']
  },
  {
    id: 'style-026',
    text: '赛博朋克风格使用霓虹灯光和金属质感，搭配紫色蓝色渐变背景，适合展示科技产品、游戏周边、潮玩',
    category: 'style_template',
    tags: ['科技风', '赛博朋克', '未来'],
    keywords: ['赛博朋克', '赛博风', '未来风', '霓虹风', '科技感'],
    priority: 4,
    source: 'manual',
    examples: ['科技产品', '游戏周边', '潮玩展示']
  },
  {
    id: 'style-027',
    text: '复古港风使用暖黄色调和胶片质感，搭配复古道具和怀旧元素，适合展示港风服饰、复古产品、老字号品牌',
    category: 'style_template',
    tags: ['复古风', '港风', '怀旧'],
    keywords: ['港风', '港风复古', '复古港风', '香港风', '怀旧风'],
    priority: 3,
    source: 'manual',
    examples: ['港风服饰', '复古产品', '老字号']
  },
  {
    id: 'style-028',
    text: '奶油风格使用米白色和浅咖色为主，搭配柔和灯光和圆润造型，营造温馨治愈氛围，适合展示母婴产品、家居用品',
    category: 'style_template',
    tags: ['自然风', '奶油风', '温馨'],
    keywords: ['奶油风', '奶油风格', '治愈风', '温馨风', '奶油色'],
    priority: 4,
    source: 'manual',
    examples: ['母婴产品', '家居用品', '治愈系产品']
  },
  {
    id: 'style-029',
    text: '暗黑风格使用深色背景和冷色调灯光，搭配金属配饰和神秘元素，适合展示香水、男士护肤、个性潮牌',
    category: 'style_template',
    tags: ['潮流风', '暗黑', '个性'],
    keywords: ['暗黑风', '暗黑风格', '哥特风', '神秘风', '个性展示'],
    priority: 3,
    source: 'manual',
    examples: ['香水展示', '男士护肤', '潮牌展示']
  },
  {
    id: 'style-030',
    text: '电商大促风格使用红色或橙色主色调，搭配促销标签和倒计时元素，营造紧迫感和购买欲望，适合展示促销商品',
    category: 'style_template',
    tags: ['电商风', '促销', '大促'],
    keywords: ['大促风', '促销风', '电商促销', '双11风', '大促展示'],
    priority: 4,
    source: 'manual',
    examples: ['促销商品', '大促活动', '限时折扣']
  },
  {
    id: 'style-031',
    text: '杂志风格使用专业摄影构图，搭配模特和时尚道具，营造高端时尚杂志感，适合展示服装、配饰、美妆',
    category: 'style_template',
    tags: ['奢华风', '杂志', '时尚'],
    keywords: ['杂志风', '时尚杂志', '大片风', '时尚大片', '杂志展示'],
    priority: 4,
    source: 'manual',
    examples: ['服装展示', '配饰展示', '美妆展示']
  },
  {
    id: 'style-032',
    text: '圣诞风格使用红绿配色和圣诞元素，搭配雪花和礼物盒道具，营造节日氛围，适合展示节日礼品、冬季商品',
    category: 'style_template',
    tags: ['节日风', '圣诞', '冬季'],
    keywords: ['圣诞风', '圣诞节风格', '节日风', '圣诞展示', '冬日风'],
    priority: 3,
    source: 'manual',
    examples: ['圣诞礼品', '冬季商品', '节日产品']
  },
  {
    id: 'style-033',
    text: '新年风格使用红金配色和中国传统元素，搭配灯笼和福字道具，营造喜庆氛围，适合展示年货礼品、新年商品',
    category: 'style_template',
    tags: ['节日风', '新年', '喜庆'],
    keywords: ['新年风', '春节风', '喜庆风', '中国年', '新年展示'],
    priority: 3,
    source: 'manual',
    examples: ['年货礼品', '新年商品', '春节产品']
  },
  {
    id: 'style-034',
    text: 'Y2K千禧风格使用银色和镭射材质，搭配透明塑料和荧光色彩，营造未来复古感，适合展示潮流服饰、电子产品',
    category: 'style_template',
    tags: ['潮流风', 'Y2K', '千禧'],
    keywords: ['Y2K风', '千禧风', 'Y2K风格', '千禧年风', '镭射风'],
    priority: 3,
    source: 'manual',
    examples: ['潮流服饰', '电子产品', '千禧风产品']
  },
  {
    id: 'style-035',
    text: '日式风格使用浅木色和米白色，搭配简约线条和自然材质，营造禅意和宁静感，适合展示日系产品、家居用品',
    category: 'style_template',
    tags: ['极简风', '日式', '禅意'],
    keywords: ['日式风', '日系风格', '和风', '日式简约', '禅意风'],
    priority: 4,
    source: 'manual',
    examples: ['日系产品', '家居用品', '简约产品']
  },
  {
    id: 'style-036',
    text: '欧美风格使用大胆配色和强烈对比，搭配简约几何元素和时尚道具，营造摩登前卫感，适合展示国际品牌、设计师服饰、潮流单品',
    category: 'style_template',
    tags: ['潮流风', '欧美', '时尚'],
    keywords: ['欧美风', '欧美风格', '欧美时尚', '西方风', '国际风'],
    priority: 4,
    source: 'manual',
    examples: ['国际品牌', '设计师服饰', '潮流单品']
  },
  {
    id: 'style-037',
    text: '波西米亚风格使用丰富色彩和民族图案，搭配流苏、编织和自然材质，营造自由浪漫感，适合展示度假服饰、民族风产品、艺术饰品',
    category: 'style_template',
    tags: ['民族风', '波西米亚', '浪漫'],
    keywords: ['波西米亚风', '波西米亚风格', '民族风', '波西米亚', 'bohemi'],
    priority: 3,
    source: 'manual',
    examples: ['度假服饰', '民族风产品', '艺术饰品']
  },

  // ==================== 扩展风格模板 (30条) ====================
  {
    id: 'style-038',
    text: '小清新风格使用浅色调和简约元素，搭配绿植和自然光线，营造干净舒适感，适合展示文具、手账、生活小物',
    category: 'style_template',
    tags: ['清新风', '小清新', '简约'],
    keywords: ['小清新风格', '清新风', '文艺小清新', '简约清新', '日系小清新'],
    priority: 4,
    source: 'manual',
    examples: ['文具展示', '手账周边', '生活小物']
  },
  {
    id: 'style-039',
    text: '复古风格使用怀旧色调和老式元素，搭配胶片质感和复古道具，营造年代感，适合展示复古服饰、怀旧产品、老字号品牌',
    category: 'style_template',
    tags: ['复古风', '怀旧', '年代'],
    keywords: ['复古风格', '怀旧风', 'retro style', 'vintage风', '经典复古'],
    priority: 4,
    source: 'manual',
    examples: ['复古服饰', '怀旧产品', '老字号']
  },
  {
    id: 'style-040',
    text: '极简北欧风格使用白色和原木色搭配，搭配简洁线条和功能性设计，营造清新舒适感，适合展示家居用品、北欧品牌产品',
    category: 'style_template',
    tags: ['极简风', '北欧', '简约'],
    keywords: ['北欧极简', 'Nordic style', '斯堪的纳维亚风', '北欧简约', '宜家风'],
    priority: 5,
    source: 'manual',
    examples: ['IKEA产品', '北欧家居', '简约家具']
  },
  {
    id: 'style-041',
    text: '田园风格使用花卉和格子元素，搭配柔和色彩和田园道具，营造温馨浪漫感，适合展示家纺、厨房用品、女性产品',
    category: 'style_template',
    tags: ['田园风', '花卉', '温馨'],
    keywords: ['田园风格', '乡村田园', '花卉风', '英伦田园', '法式田园'],
    priority: 3,
    source: 'manual',
    examples: ['家纺产品', '厨房用品', '女性服饰']
  },
  {
    id: 'style-042',
    text: '商务风格使用深蓝色和灰色主色调，搭配专业道具和简洁设计，营造专业可信感，适合展示办公用品、商务礼品、企业产品',
    category: 'style_template',
    tags: ['商务风', '专业', '企业'],
    keywords: ['商务风格', '商务风', 'business style', '专业风格', '企业风'],
    priority: 4,
    source: 'manual',
    examples: ['办公用品', '商务礼品', '企业产品']
  },
  {
    id: 'style-043',
    text: '学院风格使用格子元素和书卷气道具，搭配学院风配色，营造青春知性感，适合展示学生用品、文具、年轻服饰',
    category: 'style_template',
    tags: ['学院风', '青春', '知性'],
    keywords: ['学院风格', '学院风', 'preppy style', '校园风', '学生风'],
    priority: 3,
    source: 'manual',
    examples: ['学生用品', '文具', '年轻服饰']
  },
  {
    id: 'style-044',
    text: '度假风格使用明亮色彩和热带元素，搭配海滩和阳光道具，营造轻松休闲感，适合展示泳装、度假服饰、旅行用品',
    category: 'style_template',
    tags: ['度假风', '休闲', '热带'],
    keywords: ['度假风格', '度假风', 'resort style', '热带风', '海岛风'],
    priority: 4,
    source: 'manual',
    examples: ['泳装', '度假服饰', '旅行用品']
  },
  {
    id: 'style-045',
    text: '文艺风格使用柔和色调和文艺道具，搭配书籍和绿植元素，营造知性优雅感，适合展示文创产品、书籍、艺术周边',
    category: 'style_template',
    tags: ['文艺风', '知性', '优雅'],
    keywords: ['文艺风格', '文艺风', 'artistic style', '知性风', '文青风'],
    priority: 4,
    source: 'manual',
    examples: ['文创产品', '书籍', '艺术周边']
  },
  {
    id: 'style-046',
    text: '街头风格使用涂鸦和潮流元素，搭配亮色和动感设计，营造年轻活力感，适合展示潮牌服饰、街头配饰、滑板用品',
    category: 'style_template',
    tags: ['街头风', '潮流', '活力'],
    keywords: ['街头风格', '街头风', 'street style', '潮牌风', '嘻哈风'],
    priority: 4,
    source: 'manual',
    examples: ['潮牌服饰', '街头配饰', '滑板用品']
  },
  {
    id: 'style-047',
    text: '运动风格使用活力色彩和运动元素，搭配动感设计和运动道具，营造健康活力感，适合展示运动服饰、健身器材、运动配件',
    category: 'style_template',
    tags: ['运动风', '活力', '健康'],
    keywords: ['运动风格', '运动风', 'sporty style', '健身风', 'athleisure'],
    priority: 5,
    source: 'manual',
    examples: ['运动服饰', '健身器材', '运动配件']
  },
  {
    id: 'style-048',
    text: '暗黑风格使用深色调和神秘元素，搭配金属点缀和哥特道具，营造神秘酷炫感，适合展示个性服饰、暗黑系产品、摇滚周边',
    category: 'style_template',
    tags: ['暗黑风', '神秘', '个性'],
    keywords: ['暗黑风格', '暗黑风', 'gothic style', '哥特风', '朋克风'],
    priority: 3,
    source: 'manual',
    examples: ['个性服饰', '暗黑系产品', '摇滚周边']
  },
  {
    id: 'style-049',
    text: '卡通风格使用明亮色彩和可爱元素，搭配卡通形象和童趣设计，营造活泼可爱感，适合展示儿童产品、动漫周边、萌系产品',
    category: 'style_template',
    tags: ['卡通风', '可爱', '童趣'],
    keywords: ['卡通风格', '卡通风', 'cartoon style', '可爱风', '萌系风'],
    priority: 4,
    source: 'manual',
    examples: ['儿童产品', '动漫周边', '萌系产品']
  },
  {
    id: 'style-050',
    text: '法式优雅风格使用米色和金色搭配，搭配蕾丝和珍珠元素，营造浪漫优雅感，适合展示高端女装、法式护肤品、优雅配饰',
    category: 'style_template',
    tags: ['法式风', '优雅', '浪漫'],
    keywords: ['法式优雅', '法式风格', 'French style', '巴黎风', '浪漫优雅'],
    priority: 5,
    source: 'manual',
    examples: ['高端女装', '法式护肤品', '优雅配饰']
  },
  {
    id: 'style-051',
    text: '英伦风格使用格子元素和经典配色，搭配绅士淑女道具，营造经典优雅感，适合展示经典服饰、英伦品牌、高端配饰',
    category: 'style_template',
    tags: ['英伦风', '经典', '优雅'],
    keywords: ['英伦风格', '英伦风', 'British style', '英式风', '格子风'],
    priority: 4,
    source: 'manual',
    examples: ['经典服饰', '英伦品牌', '高端配饰']
  },
  {
    id: 'style-052',
    text: '甜美风格使用粉色系和可爱元素，搭配蝴蝶结和花朵道具，营造甜美可爱感，适合展示少女服饰、甜美系化妆品、可爱配饰',
    category: 'style_template',
    tags: ['甜美风', '可爱', '少女'],
    keywords: ['甜美风格', '甜美风', 'sweet style', '少女风', '公主风'],
    priority: 4,
    source: 'manual',
    examples: ['少女服饰', '甜美系化妆品', '可爱配饰']
  },
  {
    id: 'style-053',
    text: '中性风格使用黑白灰配色和简约设计，搭配无性别元素，营造酷帅干练感，适合展示中性服饰、无性别产品、简约配饰',
    category: 'style_template',
    tags: ['中性风', '简约', '干练'],
    keywords: ['中性风格', '中性风', 'unisex style', '无性别风', '酷帅风'],
    priority: 3,
    source: 'manual',
    examples: ['中性服饰', '无性别产品', '简约配饰']
  },
  {
    id: 'style-054',
    text: '户外风格使用大地色系和自然元素，搭配户外场景和功能性设计，营造探险野性感，适合展示户外装备、登山用品、露营产品',
    category: 'style_template',
    tags: ['户外风', '探险', '自然'],
    keywords: ['户外风格', '户外风', 'outdoor style', '探险风', '野性风'],
    priority: 4,
    source: 'manual',
    examples: ['户外装备', '登山用品', '露营产品']
  },
  {
    id: 'style-055',
    text: '宫廷风格使用金色和深色搭配，搭配华丽装饰和复古元素，营造奢华高贵感，适合展示高端珠宝、复古服饰、奢华礼品',
    category: 'style_template',
    tags: ['宫廷风', '奢华', '高贵'],
    keywords: ['宫廷风格', '宫廷风', 'palace style', '华丽风', '贵族风'],
    priority: 4,
    source: 'manual',
    examples: ['高端珠宝', '复古服饰', '奢华礼品']
  },
  {
    id: 'style-056',
    text: '度假休闲风格使用明亮色彩和轻松元素，搭配度假场景和休闲道具，营造轻松愉悦感，适合展示度假服饰、休闲用品、旅行产品',
    category: 'style_template',
    tags: ['度假风', '休闲', '轻松'],
    keywords: ['度假休闲风', '休闲风格', 'vacation style', '轻松风', '度假休闲'],
    priority: 4,
    source: 'manual',
    examples: ['度假服饰', '休闲用品', '旅行产品']
  },
  {
    id: 'style-057',
    text: '商务休闲风格使用中性色和简约设计，搭配商务与休闲结合的元素，营造得体舒适感，适合展示通勤服饰、商务休闲用品、办公配件',
    category: 'style_template',
    tags: ['商务风', '休闲', '通勤'],
    keywords: ['商务休闲风', '商务休闲', 'business casual', '通勤风', '办公室风'],
    priority: 4,
    source: 'manual',
    examples: ['通勤服饰', '商务休闲用品', '办公配件']
  },
  {
    id: 'style-058',
    text: '电竞风格使用霓虹色和科技元素，搭配RGB灯效和动感设计，营造炫酷游戏感，适合展示电竞装备、游戏周边、玩家产品',
    category: 'style_template',
    tags: ['电竞风', '科技', '炫酷'],
    keywords: ['电竞风格', '电竞风', 'gaming style', '游戏风', '玩家风'],
    priority: 4,
    source: 'manual',
    examples: ['电竞装备', '游戏周边', '玩家产品']
  },
  {
    id: 'style-059',
    text: '轻奢风格使用金属点缀和精致元素，搭配高级配色和简约设计，营造精致高级感，适合展示轻奢品牌、精致配饰、品质生活产品',
    category: 'style_template',
    tags: ['轻奢风', '精致', '高级'],
    keywords: ['轻奢风格', '轻奢风', 'affordable luxury', '精致轻奢', '品质风'],
    priority: 5,
    source: 'manual',
    examples: ['轻奢品牌', '精致配饰', '品质生活产品']
  },
  {
    id: 'style-060',
    text: '森系风格使用绿色和原木色搭配，搭配大量绿植和自然元素，营造清新自然感，适合展示自然护肤品、棉麻服饰、手工艺品',
    category: 'style_template',
    tags: ['森系风', '自然', '清新'],
    keywords: ['森系风格', '森系风', 'mori style', '森林风', '自然森系'],
    priority: 4,
    source: 'manual',
    examples: ['自然护肤品', '棉麻服饰', '手工艺品']
  },
  {
    id: 'style-061',
    text: '网红风格使用明亮色彩和时尚道具，搭配流行元素和吸睛设计，营造潮流网红感，适合展示网红产品、潮流单品、爆款产品',
    category: 'style_template',
    tags: ['网红风', '潮流', '时尚'],
    keywords: ['网红风格', '网红风', 'viral style', '网红爆款风', '潮流网红'],
    priority: 4,
    source: 'manual',
    examples: ['网红产品', '潮流单品', '爆款产品']
  },
  {
    id: 'style-062',
    text: '环保风格使用自然色和可持续元素，搭配环保材质和简约设计，营造环保责任感，适合展示环保产品、可持续品牌、绿色产品',
    category: 'style_template',
    tags: ['环保风', '自然', '可持续'],
    keywords: ['环保风格', '环保风', 'eco style', '可持续风', '绿色风'],
    priority: 3,
    source: 'manual',
    examples: ['环保产品', '可持续品牌', '绿色产品']
  },
  {
    id: 'style-063',
    text: '动漫风格使用明亮色彩和二次元元素，搭配动漫角色和萌系设计，营造动漫可爱感，适合展示动漫周边、二次元产品、ACG文化产品',
    category: 'style_template',
    tags: ['动漫风', '二次元', '可爱'],
    keywords: ['动漫风格', '动漫风', 'anime style', '二次元风', 'ACG风'],
    priority: 4,
    source: 'manual',
    examples: ['动漫周边', '二次元产品', 'ACG文化产品']
  },
  {
    id: 'style-064',
    text: '高端奢华风格使用深色和金色搭配，搭配奢华材质和精致细节，营造顶级高端感，适合展示奢侈品、高端珠宝、顶级品牌产品',
    category: 'style_template',
    tags: ['奢华风', '高端', '顶级'],
    keywords: ['高端奢华风', '奢华风格', 'luxury style', '顶级风', '高端风'],
    priority: 5,
    source: 'manual',
    examples: ['奢侈品', '高端珠宝', '顶级品牌产品']
  },
  {
    id: 'style-065',
    text: '极简生活风格使用白色和原木色搭配，搭配简约设计和实用元素，营造极简生活感，适合展示极简家居、生活用品、收纳产品',
    category: 'style_template',
    tags: ['极简风', '生活', '简约'],
    keywords: ['极简生活风', '极简风格', 'minimalist life', '断舍离风', '简约生活'],
    priority: 4,
    source: 'manual',
    examples: ['极简家居', '生活用品', '收纳产品']
  },
  {
    id: 'style-066',
    text: '韩系风格使用浅色调和清新元素，搭配韩式妆容和潮流设计，营造清新潮流感，适合展示韩系服饰、韩妆、韩国品牌产品',
    category: 'style_template',
    tags: ['韩系风', '清新', '潮流'],
    keywords: ['韩系风格', '韩系风', 'Korean style', '韩风', '韩式潮流'],
    priority: 5,
    source: 'manual',
    examples: ['韩系服饰', '韩妆', '韩国品牌产品']
  },
  {
    id: 'style-067',
    text: '美式风格使用大地色和休闲元素，搭配美式复古和经典设计，营造休闲经典感，适合展示美式服饰、复古产品、休闲品牌',
    category: 'style_template',
    tags: ['美式风', '休闲', '经典'],
    keywords: ['美式风格', '美式风', 'American style', '美式复古', '休闲美式'],
    priority: 4,
    source: 'manual',
    examples: ['美式服饰', '复古产品', '休闲品牌']
  },
  {
    id: 'style-068',
    text: '波西米亚风格使用民族图案和流苏元素，搭配手工编织和异域风情，营造自由浪漫感，适合展示民族服饰、手工艺品、度假产品',
    category: 'style_template',
    tags: ['波西米亚', '民族', '浪漫'],
    keywords: ['波西米亚风格', '波西米亚风', 'Bohemian style', '民族风', '异域风'],
    priority: 4,
    source: 'manual',
    examples: ['民族服饰', '手工艺品', '度假产品']
  },
  {
    id: 'style-069',
    text: '哥特风格使用深色调和神秘元素，搭配暗黑美学和戏剧化设计，营造神秘冷酷感，适合展示暗黑系服饰、摇滚产品、个性配饰',
    category: 'style_template',
    tags: ['哥特', '暗黑', '神秘'],
    keywords: ['哥特风格', '哥特风', 'Gothic style', '暗黑风', '神秘风'],
    priority: 3,
    source: 'manual',
    examples: ['暗黑服饰', '摇滚产品', '个性配饰']
  },
  {
    id: 'style-070',
    text: '洛可可风格使用柔和粉色和精致装饰，搭配华丽曲线和柔美设计，营造浪漫柔美感，适合展示女性产品、浪漫礼品、精致饰品',
    category: 'style_template',
    tags: ['洛可可', '浪漫', '柔美'],
    keywords: ['洛可可风格', '洛可可风', 'Rococo style', '浪漫风', '柔美风'],
    priority: 3,
    source: 'manual',
    examples: ['女性产品', '浪漫礼品', '精致饰品']
  },
  {
    id: 'style-071',
    text: '巴洛克风格使用金色装饰和华丽元素，搭配复杂雕刻和戏剧化设计，营造奢华庄重感，适合展示高端礼品、艺术品、奢侈品',
    category: 'style_template',
    tags: ['巴洛克', '华丽', '庄重'],
    keywords: ['巴洛克风格', '巴洛克风', 'Baroque style', '华丽风', '奢华风'],
    priority: 3,
    source: 'manual',
    examples: ['高端礼品', '艺术品', '奢侈品']
  },
  {
    id: 'style-072',
    text: '艺术装饰风格使用几何图案和金属质感，搭配对称设计和精致细节，营造复古高级感，适合展示珠宝首饰、高端产品、艺术品',
    category: 'style_template',
    tags: ['艺术装饰', '几何', '高级'],
    keywords: ['艺术装饰风格', 'Art Deco风格', 'Art Deco', '几何风', '装饰风'],
    priority: 4,
    source: 'manual',
    examples: ['珠宝首饰', '高端产品', '艺术品']
  },
  {
    id: 'style-073',
    text: '包豪斯风格使用简洁线条和功能主义，搭配原色搭配和几何形状，营造理性简约感，适合展示现代家具、设计产品、工业产品',
    category: 'style_template',
    tags: ['包豪斯', '功能主义', '简约'],
    keywords: ['包豪斯风格', 'Bauhaus style', '功能主义', '现代主义', '理性设计'],
    priority: 4,
    source: 'manual',
    examples: ['现代家具', '设计产品', '工业产品']
  },
  {
    id: 'style-074',
    text: '孟菲斯风格使用鲜艳色彩和几何图形，搭配不规则形状和趣味设计，营造活泼俏皮感，适合展示创意产品、儿童产品、潮流设计',
    category: 'style_template',
    tags: ['孟菲斯', '鲜艳', '趣味'],
    keywords: ['孟菲斯风格', 'Memphis style', '孟菲斯设计', '趣味风', '俏皮风'],
    priority: 3,
    source: 'manual',
    examples: ['创意产品', '儿童产品', '潮流设计']
  },
  {
    id: 'style-075',
    text: '蒸汽朋克风格使用黄铜元素和机械美学，搭配复古未来主义设计，营造科幻复古感，适合展示机械产品、复古玩具、创意礼品',
    category: 'style_template',
    tags: ['蒸汽朋克', '机械', '复古'],
    keywords: ['蒸汽朋克风格', 'Steampunk style', '蒸汽朋克', '机械美学', '复古科幻'],
    priority: 3,
    source: 'manual',
    examples: ['机械产品', '复古玩具', '创意礼品']
  },
  {
    id: 'style-076',
    text: '赛博朋克风格使用霓虹色彩和科技元素，搭配未来主义和暗黑设计，营造未来科技感，适合展示科技产品、游戏周边、潮流玩具',
    category: 'style_template',
    tags: ['赛博朋克', '科技', '未来'],
    keywords: ['赛博朋克风格', 'Cyberpunk style', '赛博风', '科技风', '未来风'],
    priority: 4,
    source: 'manual',
    examples: ['科技产品', '游戏周边', '潮流玩具']
  },
  {
    id: 'style-077',
    text: '侘寂风格使用自然材质和朴素设计，搭配留白美学和岁月痕迹，营造宁静禅意感，适合展示茶具、手工艺品、日式产品',
    category: 'style_template',
    tags: ['侘寂', '朴素', '禅意'],
    keywords: ['侘寂风格', 'Wabi-sabi style', '侘寂风', '禅意风', '朴素风'],
    priority: 4,
    source: 'manual',
    examples: ['茶具', '手工艺品', '日式产品']
  },
  {
    id: 'style-078',
    text: '摩洛哥风格使用马赛克图案和丰富色彩，搭配拱形设计和异域元素，营造神秘浪漫感，适合展示家居装饰、手工艺品、异域产品',
    category: 'style_template',
    tags: ['摩洛哥', '马赛克', '异域'],
    keywords: ['摩洛哥风格', 'Moroccan style', '摩洛哥风', '异域风', '马赛克风'],
    priority: 3,
    source: 'manual',
    examples: ['家居装饰', '手工艺品', '异域产品']
  },
  {
    id: 'style-079',
    text: '维多利亚风格使用繁复花纹和深色木质，搭配复古装饰和优雅设计，营造古典优雅感，适合展示复古产品、高端礼品、传统工艺品',
    category: 'style_template',
    tags: ['维多利亚', '复古', '优雅'],
    keywords: ['维多利亚风格', 'Victorian style', '维多利亚风', '复古风', '古典风'],
    priority: 3,
    source: 'manual',
    examples: ['复古产品', '高端礼品', '传统工艺品']
  },
  {
    id: 'style-080',
    text: '极简主义风格使用纯净白色和简洁线条，搭配大面积留白和功能性设计，营造清爽简约感，适合展示现代产品、设计品牌、简约产品',
    category: 'style_template',
    tags: ['极简主义', '简约', '纯净'],
    keywords: ['极简主义风格', 'Minimalism style', '极简风', '简约风', '纯净风'],
    priority: 5,
    source: 'manual',
    examples: ['现代产品', '设计品牌', '简约产品']
  },
  {
    id: 'style-081',
    text: '新中式风格使用传统元素和现代设计，搭配水墨意境和东方美学，营造雅致现代感，适合展示中式产品、文化礼品、传统工艺品',
    category: 'style_template',
    tags: ['新中式', '东方', '雅致'],
    keywords: ['新中式风格', 'New Chinese style', '新中式', '东方美学', '现代中式'],
    priority: 5,
    source: 'manual',
    examples: ['中式产品', '文化礼品', '传统工艺品']
  },
  {
    id: 'style-082',
    text: '地中海风格使用蓝白配色和拱形元素，搭配海洋元素和自然材质，营造清新浪漫感，适合展示家居产品、度假产品、户外用品',
    category: 'style_template',
    tags: ['地中海', '清新', '浪漫'],
    keywords: ['地中海风格', 'Mediterranean style', '地中海风', '蓝白风', '海洋风'],
    priority: 4,
    source: 'manual',
    examples: ['家居产品', '度假产品', '户外用品']
  },
  {
    id: 'style-083',
    text: '热带风格使用绿色植物和鲜艳花朵，搭配自然材质和热带元素，营造活力热情感，适合展示度假产品、户外用品、夏季服饰',
    category: 'style_template',
    tags: ['热带', '植物', '活力'],
    keywords: ['热带风格', 'Tropical style', '热带风', '植物风', '度假风'],
    priority: 4,
    source: 'manual',
    examples: ['度假产品', '户外用品', '夏季服饰']
  },
  {
    id: 'style-084',
    text: '乡村田园风格使用碎花图案和自然材质，搭配温馨色调和乡村元素，营造温馨自然感，适合展示家居产品、田园服饰、手工艺品',
    category: 'style_template',
    tags: ['乡村田园', '碎花', '温馨'],
    keywords: ['乡村田园风格', 'Country style', '田园风', '乡村风', '碎花风'],
    priority: 4,
    source: 'manual',
    examples: ['家居产品', '田园服饰', '手工艺品']
  },
  {
    id: 'style-085',
    text: '都市现代风格使用中性色调和简约设计，搭配都市元素和时尚感，营造专业时尚感，适合展示都市产品、职场用品、现代家居',
    category: 'style_template',
    tags: ['都市现代', '时尚', '专业'],
    keywords: ['都市现代风格', 'Urban modern style', '都市风', '现代风', '时尚风'],
    priority: 5,
    source: 'manual',
    examples: ['都市产品', '职场用品', '现代家居']
  },
  {
    id: 'style-086',
    text: '复古怀旧风格使用做旧质感和复古色调，搭配怀旧元素和历史感，营造复古情怀感，适合展示复古产品、怀旧礼品、老式产品',
    category: 'style_template',
    tags: ['复古怀旧', '做旧', '怀旧'],
    keywords: ['复古怀旧风格', 'Vintage style', '复古风', '怀旧风', '做旧风'],
    priority: 4,
    source: 'manual',
    examples: ['复古产品', '怀旧礼品', '老式产品']
  },
  {
    id: 'style-087',
    text: '运动风格使用动感线条和活力色彩，搭配运动元素和功能性设计，营造活力动感感，适合展示运动产品、健身器材、户外装备',
    category: 'style_template',
    tags: ['运动', '动感', '活力'],
    keywords: ['运动风格', 'Sport style', '运动风', '动感风', '活力风'],
    priority: 5,
    source: 'manual',
    examples: ['运动产品', '健身器材', '户外装备']
  },
  {
    id: 'style-088',
    text: '学院风格使用格子元素和经典配色，搭配青春元素和学生气，营造青春学院感，适合展示学生用品、校园产品、青春服饰',
    category: 'style_template',
    tags: ['学院', '格子', '青春'],
    keywords: ['学院风格', 'Preppy style', '学院风', '格子风', '青春风'],
    priority: 4,
    source: 'manual',
    examples: ['学生用品', '校园产品', '青春服饰']
  },
  {
    id: 'style-089',
    text: '街头潮流风格使用涂鸦元素和潮流设计，搭配街头文化和个性表达，营造潮流个性感，适合展示潮流服饰、街头产品、滑板产品',
    category: 'style_template',
    tags: ['街头潮流', '涂鸦', '个性'],
    keywords: ['街头潮流风格', 'Street style', '街头风', '潮流风', '涂鸦风'],
    priority: 4,
    source: 'manual',
    examples: ['潮流服饰', '街头产品', '滑板产品']
  },
  {
    id: 'style-090',
    text: '机能风格使用科技面料和功能性设计，搭配战术元素和未来感，营造科技机能感，适合展示户外装备、科技服饰、功能性产品',
    category: 'style_template',
    tags: ['机能', '科技', '功能'],
    keywords: ['机能风格', 'Techwear style', '机能风', '科技风', '功能风'],
    priority: 4,
    source: 'manual',
    examples: ['户外装备', '科技服饰', '功能性产品']
  },
  {
    id: 'style-091',
    text: '优雅淑女风格使用柔和色调和优雅设计，搭配女性元素和精致细节，营造优雅柔美感，适合展示女性产品、淑女服饰、精致礼品',
    category: 'style_template',
    tags: ['优雅淑女', '柔和', '精致'],
    keywords: ['优雅淑女风格', 'Elegant lady style', '淑女风', '优雅风', '柔美风'],
    priority: 4,
    source: 'manual',
    examples: ['女性产品', '淑女服饰', '精致礼品']
  },
  {
    id: 'style-092',
    text: '硬朗酷帅风格使用深色调和金属元素，搭配硬朗线条和酷帅设计，营造帅气酷感，适合展示男性产品、潮流服饰、酷帅配饰',
    category: 'style_template',
    tags: ['硬朗酷帅', '金属', '帅气'],
    keywords: ['硬朗酷帅风格', 'Cool style', '酷帅风', '硬朗风', '帅气风'],
    priority: 4,
    source: 'manual',
    examples: ['男性产品', '潮流服饰', '酷帅配饰']
  },
  {
    id: 'style-093',
    text: '自然森系风格使用绿色植物和自然元素，搭配森系设计和清新色调，营造自然清新感，适合展示植物产品、森系服饰、自然产品',
    category: 'style_template',
    tags: ['自然森系', '植物', '清新'],
    keywords: ['自然森系风格', 'Mori style', '森系风', '自然风', '清新风'],
    priority: 4,
    source: 'manual',
    examples: ['植物产品', '森系服饰', '自然产品']
  },
  {
    id: 'style-094',
    text: '东方禅意风格使用素雅色调和禅意元素，搭配东方美学和意境设计，营造宁静禅意感，适合展示茶道产品、禅意家居、东方礼品',
    category: 'style_template',
    tags: ['东方禅意', '素雅', '宁静'],
    keywords: ['东方禅意风格', 'Zen style', '禅意风', '东方风', '宁静风'],
    priority: 4,
    source: 'manual',
    examples: ['茶道产品', '禅意家居', '东方礼品']
  },
  {
    id: 'style-095',
    text: '复古未来风格使用金属光泽和未来元素，搭配复古科幻设计，营造复古未来感，适合展示复古科技产品、创意礼品、潮流设计',
    category: 'style_template',
    tags: ['复古未来', '金属', '科幻'],
    keywords: ['复古未来风格', 'Retro-futurism style', '复古未来风', '科幻风', '未来复古'],
    priority: 3,
    source: 'manual',
    examples: ['复古科技产品', '创意礼品', '潮流设计']
  },
  {
    id: 'style-096',
    text: '梦幻童话风格使用柔和色彩和童话元素，搭配梦幻设计和浪漫氛围，营造梦幻浪漫感，适合展示儿童产品、浪漫礼品、梦幻饰品',
    category: 'style_template',
    tags: ['梦幻童话', '浪漫', '梦幻'],
    keywords: ['梦幻童话风格', 'Fairytale style', '童话风', '梦幻风', '浪漫风'],
    priority: 3,
    source: 'manual',
    examples: ['儿童产品', '浪漫礼品', '梦幻饰品']
  },
  {
    id: 'style-097',
    text: '奢华宫廷风格使用金色装饰和华丽元素，搭配宫廷设计和高贵气质，营造奢华高贵感，适合展示奢侈品、高端礼品、宫廷风产品',
    category: 'style_template',
    tags: ['奢华宫廷', '金色', '高贵'],
    keywords: ['奢华宫廷风格', 'Royal style', '宫廷风', '奢华风', '高贵风'],
    priority: 4,
    source: 'manual',
    examples: ['奢侈品', '高端礼品', '宫廷风产品']
  },
  {
    id: 'style-098',
    text: '清新文艺风格使用浅色调和文艺元素，搭配简洁设计和艺术气息，营造清新文艺感，适合展示文艺产品、书店产品、清新服饰',
    category: 'style_template',
    tags: ['清新文艺', '文艺', '清新'],
    keywords: ['清新文艺风格', 'Artistic style', '文艺风', '清新风', '艺术风'],
    priority: 4,
    source: 'manual',
    examples: ['文艺产品', '书店产品', '清新服饰']
  },
  {
    id: 'style-099',
    text: '商务精英风格使用深色系和专业设计，搭配商务元素和高端质感，营造专业精英感，适合展示商务产品、办公用品、职场服饰',
    category: 'style_template',
    tags: ['商务精英', '专业', '高端'],
    keywords: ['商务精英风格', 'Business style', '商务风', '精英风', '专业风'],
    priority: 5,
    source: 'manual',
    examples: ['商务产品', '办公用品', '职场服饰']
  },
  {
    id: 'style-100',
    text: '极简北欧风格使用浅木色和白色，搭配简约设计和功能性，营造简洁温馨感，适合展示北欧家具、简约家居、现代产品',
    category: 'style_template',
    tags: ['极简北欧', '简约', '温馨'],
    keywords: ['极简北欧风格', 'Nordic minimal style', '北欧风', '简约风', '极简风'],
    priority: 5,
    source: 'manual',
    examples: ['北欧家具', '简约家居', '现代产品']
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
  },
  {
    id: 'platform-011',
    text: '拼多多主图要求简洁醒目，突出价格优势，建议使用白底图或场景图，图片尺寸建议800x800以上，支持视频主图',
    category: 'platform_spec',
    tags: ['拼多多', '低价', '团购'],
    keywords: ['拼多多主图', '拼多多图片', 'PDD主图', '多多进宝'],
    priority: 4,
    source: 'manual',
    examples: ['拼多多店铺', '拼多多商品']
  },
  {
    id: 'platform-012',
    text: '拼多多详情页建议突出价格对比和团购优惠，使用长图展示产品卖点，第一屏展示核心优惠信息',
    category: 'platform_spec',
    tags: ['拼多多', '详情页', '优惠'],
    keywords: ['拼多多详情页', 'PDD详情页', '团购详情'],
    priority: 4,
    source: 'manual',
    examples: ['拼多多商品详情', '团购商品']
  },
  {
    id: 'platform-013',
    text: '京东主图要求专业品质感，建议使用白底图或浅色背景，产品清晰居中，支持360度展示和视频',
    category: 'platform_spec',
    tags: ['京东', '品质', '专业'],
    keywords: ['京东主图', 'JD主图', '京东商品图'],
    priority: 4,
    source: 'manual',
    examples: ['京东店铺', '京东自营']
  },
  {
    id: 'platform-014',
    text: '京东详情页建议突出品牌故事和品质保证，使用专业拍摄的场景图和细节图，支持AR展示',
    category: 'platform_spec',
    tags: ['京东', '详情页', '品牌'],
    keywords: ['京东详情页', 'JD详情页', '品牌详情'],
    priority: 4,
    source: 'manual',
    examples: ['京东商品详情', '品牌店铺']
  },
  {
    id: 'platform-015',
    text: 'TikTok商品展示建议使用短视频形式，9:16竖版比例，前3秒吸引注意力，展示产品使用效果和真实反馈',
    category: 'platform_spec',
    tags: ['TikTok', '短视频', '海外'],
    keywords: ['TikTok', 'TikTok Shop', '抖音国际版', '海外短视频'],
    priority: 4,
    source: 'manual',
    examples: ['TikTok电商', 'TikTok带货']
  },
  {
    id: 'platform-016',
    text: 'TikTok Shop主图建议使用真人展示图，营造真实感，可使用GIF或短视频展示产品功能',
    category: 'platform_spec',
    tags: ['TikTok', 'Shop', '主图'],
    keywords: ['TikTok Shop主图', 'TikTok商品图', '海外电商主图'],
    priority: 3,
    source: 'manual',
    examples: ['TikTok小店', '海外电商']
  },
  {
    id: 'platform-017',
    text: 'Instagram商品展示建议使用正方形1:1或竖版4:5比例，注重美学和生活方式呈现，可使用轮播展示多角度',
    category: 'platform_spec',
    tags: ['Instagram', '社交电商', '美学'],
    keywords: ['Instagram', 'IG', 'Ins', 'Instagram电商'],
    priority: 4,
    source: 'manual',
    examples: ['Instagram店铺', '社交电商']
  },
  {
    id: 'platform-018',
    text: 'Instagram Stories建议使用9:16竖版比例，添加互动元素和购买链接，适合限时促销和新品发布',
    category: 'platform_spec',
    tags: ['Instagram', 'Stories', '限时'],
    keywords: ['Instagram Stories', 'IG Stories', '限时动态'],
    priority: 3,
    source: 'manual',
    examples: ['Instagram营销', '限时活动']
  },
  {
    id: 'platform-019',
    text: '快手短视频建议使用真实接地气的风格，9:16竖版比例，突出产品性价比和真实使用场景，增强信任感',
    category: 'platform_spec',
    tags: ['快手', '短视频', '真实'],
    keywords: ['快手', '快手视频', '快手直播', '快手电商'],
    priority: 4,
    source: 'manual',
    examples: ['快手店铺', '快手带货']
  },
  {
    id: 'platform-020',
    text: '快手直播商品展示建议提前预热，展示产品细节和使用效果，主播亲自试用增加说服力',
    category: 'platform_spec',
    tags: ['快手', '直播', '带货'],
    keywords: ['快手直播', '快手带货', '直播展示'],
    priority: 3,
    source: 'manual',
    examples: ['快手直播间', '直播带货']
  },
  {
    id: 'platform-021',
    text: '微信小店商品图建议使用简洁清晰的风格，支持小程序内展示，可搭配公众号文章推广',
    category: 'platform_spec',
    tags: ['微信小店', '小程序', '私域'],
    keywords: ['微信小店', '微信小程序', '小程序店铺', '私域电商'],
    priority: 4,
    source: 'manual',
    examples: ['微信小商店', '小程序商城']
  },
  {
    id: 'platform-022',
    text: '微信小店详情页建议突出产品核心卖点和用户评价，支持视频和图文混排，适合私域流量转化',
    category: 'platform_spec',
    tags: ['微信小店', '详情页', '私域'],
    keywords: ['微信小店详情', '小程序详情', '私域转化'],
    priority: 3,
    source: 'manual',
    examples: ['微信商城', '私域运营']
  },
  {
    id: 'platform-023',
    text: '得物商品展示建议突出正品保证和鉴别服务，使用多角度细节图展示产品真伪特征，强调品牌调性',
    category: 'platform_spec',
    tags: ['得物', '潮流', '正品'],
    keywords: ['得物', '毒APP', '潮流电商', '球鞋交易'],
    priority: 4,
    source: 'manual',
    examples: ['得物店铺', '潮流商品']
  },
  {
    id: 'platform-024',
    text: '得物主图建议使用纯色背景突出产品本身，展示鉴别标识和防伪细节，营造专业正品感',
    category: 'platform_spec',
    tags: ['得物', '主图', '鉴别'],
    keywords: ['得物主图', '得物商品图', '潮流主图'],
    priority: 3,
    source: 'manual',
    examples: ['得物商品', '球鞋展示']
  },
  {
    id: 'platform-025',
    text: '天猫旗舰店主图要求高端品质感，支持视频和360度展示，建议使用专业摄影的场景图和白底图组合',
    category: 'platform_spec',
    tags: ['天猫', '旗舰店', '高端'],
    keywords: ['天猫主图', '天猫旗舰店', 'TMALL主图'],
    priority: 5,
    source: 'manual',
    examples: ['天猫旗舰店', '天猫品牌店']
  },
  {
    id: 'platform-026',
    text: '天猫详情页建议突出品牌故事和产品科技，使用专业拍摄的细节图和场景图，支持AR试穿和3D展示',
    category: 'platform_spec',
    tags: ['天猫', '详情页', '品牌'],
    keywords: ['天猫详情页', '天猫商品详情', '品牌详情页'],
    priority: 4,
    source: 'manual',
    examples: ['天猫商品详情', '品牌旗舰店']
  },

  // ==================== 扩展平台规范 (20条) ====================
  {
    id: 'platform-027',
    text: '小红书笔记图片建议3:4竖版比例，首图要有吸引眼球的标题或封面效果，后续图片展示产品细节和使用效果',
    category: 'platform_spec',
    tags: ['小红书', '笔记', '种草'],
    keywords: ['小红书笔记', '小红书图片规范', '种草笔记', '笔记封面'],
    priority: 5,
    source: 'manual',
    examples: ['美妆笔记', '穿搭笔记', '好物分享']
  },
  {
    id: 'platform-028',
    text: '小红书视频建议竖版9:16比例，时长15秒-5分钟，前3秒抓住眼球，展示产品使用前后对比效果',
    category: 'platform_spec',
    tags: ['小红书', '视频', '种草'],
    keywords: ['小红书视频', '种草视频', '小红书短视频', '小红书Vlog'],
    priority: 4,
    source: 'manual',
    examples: ['开箱视频', '测评视频', '使用教程']
  },
  {
    id: 'platform-029',
    text: '抖音商品橱窗图片建议1:1正方形比例，突出产品主体，背景简洁干净，支持视频展示产品使用效果',
    category: 'platform_spec',
    tags: ['抖音', '橱窗', '商品'],
    keywords: ['抖音橱窗', '抖音商品', '商品橱窗图', '抖音小店'],
    priority: 4,
    source: 'manual',
    examples: ['抖音小店商品', '抖音橱窗展示']
  },
  {
    id: 'platform-030',
    text: '抖音直播商品卡片建议简洁醒目，突出价格优惠和产品卖点，使用对比色突出促销信息',
    category: 'platform_spec',
    tags: ['抖音', '直播', '商品卡片'],
    keywords: ['抖音直播卡片', '直播商品展示', '抖音带货卡片', '直播间商品'],
    priority: 4,
    source: 'manual',
    examples: ['直播间商品', '带货商品卡片']
  },
  {
    id: 'platform-031',
    text: '淘宝直播商品展示建议使用竖屏9:16，主播亲自试用产品，展示产品细节和使用效果，增加信任感',
    category: 'platform_spec',
    tags: ['淘宝', '直播', '带货'],
    keywords: ['淘宝直播', '淘宝直播规范', '淘宝带货', '直播展示'],
    priority: 4,
    source: 'manual',
    examples: ['淘宝直播间', '淘宝直播带货']
  },
  {
    id: 'platform-032',
    text: '淘宝短视频建议竖版9:16或横版16:9，时长15秒-3分钟，展示产品核心卖点和使用场景',
    category: 'platform_spec',
    tags: ['淘宝', '短视频', '商品'],
    keywords: ['淘宝短视频', '淘宝商品视频', '主图视频', '商品展示视频'],
    priority: 4,
    source: 'manual',
    examples: ['商品展示视频', '产品介绍视频']
  },
  {
    id: 'platform-033',
    text: '京东秒杀专区图片建议使用红色或橙色元素，突出限时折扣和价格优势，营造紧迫购买氛围',
    category: 'platform_spec',
    tags: ['京东', '秒杀', '促销'],
    keywords: ['京东秒杀', '秒杀专区', '京东促销', '限时秒杀图'],
    priority: 4,
    source: 'manual',
    examples: ['京东秒杀活动', '限时折扣']
  },
  {
    id: 'platform-034',
    text: '拼多多百亿补贴商品建议突出补贴标识和价格对比，使用醒目的补贴标签，展示正品保障',
    category: 'platform_spec',
    tags: ['拼多多', '百亿补贴', '正品'],
    keywords: ['百亿补贴', '拼多多补贴', 'PDD补贴', '正品补贴'],
    priority: 5,
    source: 'manual',
    examples: ['百亿补贴商品', '品牌正品']
  },
  {
    id: 'platform-035',
    text: '得物鉴别图片建议多角度展示产品细节，包括鞋标、鞋盒、五金件等鉴别点，配合鉴别证书展示',
    category: 'platform_spec',
    tags: ['得物', '鉴别', '正品'],
    keywords: ['得物鉴别', '球鞋鉴别', '正品鉴别', '鉴别图片'],
    priority: 4,
    source: 'manual',
    examples: ['球鞋鉴别', '潮牌鉴别', '奢侈品鉴别']
  },
  {
    id: 'platform-036',
    text: '唯品会商品图片建议展示品牌Logo和折扣信息，使用专业模特图和产品细节图，突出品牌正品保障',
    category: 'platform_spec',
    tags: ['唯品会', '品牌', '折扣'],
    keywords: ['唯品会图片', '品牌折扣', '唯品会商品图', '品牌特卖'],
    priority: 3,
    source: 'manual',
    examples: ['品牌特卖', '折扣商品']
  },
  {
    id: 'platform-037',
    text: '小红书商品笔记建议使用真实使用场景图，搭配使用心得文字，避免过度修图，保持真实感',
    category: 'platform_spec',
    tags: ['小红书', '笔记', '真实'],
    keywords: ['小红书商品笔记', '种草笔记规范', '真实分享', '使用心得'],
    priority: 5,
    source: 'manual',
    examples: ['真实测评', '使用分享', '好物推荐']
  },
  {
    id: 'platform-038',
    text: '抖音品牌号视频建议使用高清画质和专业剪辑，展示品牌形象和产品故事，增强品牌认知',
    category: 'platform_spec',
    tags: ['抖音', '品牌号', '专业'],
    keywords: ['抖音品牌号', '品牌视频', '抖音品牌内容', '品牌形象'],
    priority: 4,
    source: 'manual',
    examples: ['品牌宣传视频', '品牌故事']
  },
  {
    id: 'platform-039',
    text: '微信朋友圈广告图片建议使用原生风格，融入朋友圈内容，避免硬广感，展示产品使用场景',
    category: 'platform_spec',
    tags: ['微信', '朋友圈', '广告'],
    keywords: ['朋友圈广告', '微信广告', '朋友圈推广', '原生广告'],
    priority: 4,
    source: 'manual',
    examples: ['朋友圈推广', '微信推广']
  },
  {
    id: 'platform-040',
    text: '哔哩哔哩商品展示建议融入二次元元素或梗文化，使用弹幕互动形式，增强用户参与感',
    category: 'platform_spec',
    tags: ['B站', '二次元', '互动'],
    keywords: ['B站商品', '哔哩哔哩电商', 'B站带货', '二次元电商'],
    priority: 3,
    source: 'manual',
    examples: ['二次元周边', '动漫产品', 'UP主推荐']
  },
  {
    id: 'platform-041',
    text: '淘宝逛逛内容建议使用真实买家秀风格，展示产品实际使用效果，配合种草文案和标签',
    category: 'platform_spec',
    tags: ['淘宝', '逛逛', '种草'],
    keywords: ['淘宝逛逛', '逛逛内容', '淘宝种草', '买家秀'],
    priority: 4,
    source: 'manual',
    examples: ['买家秀', '种草内容', '好物推荐']
  },
  {
    id: 'platform-042',
    text: 'YouTube购物视频建议使用横版16:9比例，详细展示产品功能和评测，添加购物链接和时间戳',
    category: 'platform_spec',
    tags: ['YouTube', '视频', '购物'],
    keywords: ['YouTube购物', 'YouTube评测', '海外视频电商', 'YouTube带货'],
    priority: 3,
    source: 'manual',
    examples: ['产品评测', '开箱视频', '购物推荐']
  },
  {
    id: 'platform-043',
    text: '抖音团购商品建议突出团购价格和优惠力度，展示产品实际使用效果，添加团购倒计时元素',
    category: 'platform_spec',
    tags: ['抖音', '团购', '本地生活'],
    keywords: ['抖音团购', '本地生活', '抖音团购图', '团购商品'],
    priority: 4,
    source: 'manual',
    examples: ['本地团购', '餐饮团购', '生活服务']
  },
  {
    id: 'platform-044',
    text: '小红书品牌号内容建议使用高质量视觉内容，保持品牌调性一致性，结合热点话题和KOL合作',
    category: 'platform_spec',
    tags: ['小红书', '品牌号', 'KOL'],
    keywords: ['小红书品牌号', '品牌内容', 'KOL合作', '品牌营销'],
    priority: 4,
    source: 'manual',
    examples: ['品牌营销', 'KOL种草', '品牌内容']
  },
  {
    id: 'platform-045',
    text: '抖音达人带货视频建议前3秒展示产品亮点，中间展示使用效果，结尾添加购买引导和优惠信息',
    category: 'platform_spec',
    tags: ['抖音', '达人', '带货'],
    keywords: ['达人带货', '抖音达人', '达人视频', '带货视频规范'],
    priority: 5,
    source: 'manual',
    examples: ['达人推荐', '带货视频', '种草视频']
  },
  {
    id: 'platform-046',
    text: '淘宝内容营销建议使用故事化形式展示产品，配合场景化拍摄和情感化文案，增强用户共鸣',
    category: 'platform_spec',
    tags: ['淘宝', '内容营销', '故事化'],
    keywords: ['淘宝内容营销', '故事化营销', '场景化内容', '情感营销'],
    priority: 4,
    source: 'manual',
    examples: ['品牌故事', '场景营销', '情感内容']
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