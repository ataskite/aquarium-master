-- 水族大师数据库初始化脚本
-- 用途：清理所有数据并插入更贴近真实水族场景的初始化数据
--
-- 鱼种参数参考：
-- - FishBase: https://fishbase.se
-- - Seriously Fish: https://www.seriouslyfish.com
-- - Practical Fishkeeping: https://www.practicalfishkeeping.co.uk
-- - Fishkeeping.co.uk care sheets: https://www.fishkeeping.co.uk
-- - Tropical Fish Co care guides: https://tropicalfishco.co.uk/care-guides

-- 清理业务表数据（按外键依赖顺序），保留 Prisma 迁移历史
TRUNCATE TABLE "WaterQualityRecord", "MaintenanceRecord", "Reminder", "AquariumStock", "AquariumDevice", "WaterParameterProfile", "FeedingTemplate", "FishSpecies", "Aquarium", "User", "KnowledgeArticle", "FileObject" CASCADE;

-- 插入本地体验用户
INSERT INTO "User" (id, "openId", "nickname", "avatarUrl", "createdAt", "updatedAt") VALUES
  ('demo-user-001', 'mock-openid-demo', '水族新手', 'https://api.dicebear.com/7.x/avataaars/svg?seed=aquarium', NOW(), NOW());

-- 插入真实常见鱼种组合的鱼缸档案
INSERT INTO "Aquarium" (id, "userId", name, "coverUrl", "volumeLiters", "lengthCm", "widthCm", "heightCm", species, status, "healthScore", "createdAt", "updatedAt") VALUES
  (
    'demo-aquarium-community',
    'demo-user-001',
    '南美小型灯鱼缸',
    'https://images.unsplash.com/photo-1520301255226-bf5f144451c1?auto=format&fit=crop&w=800&q=80',
    84,
    60,
    40,
    35,
    '红绿灯鱼 Paracheirodon innesi 12只、熊猫鼠 Corydoras panda 6只、小精灵 Otocinclus spp. 3只',
    'RUNNING',
    94,
    NOW(),
    NOW()
  ),
  (
    'demo-aquarium-livebearer',
    'demo-user-001',
    '硬水卵胎生鱼缸',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    96,
    80,
    35,
    35,
    '孔雀鱼 Poecilia reticulata 10只、米奇鱼 Xiphophorus maculatus 6只、苹果螺 Pomacea bridgesii 2只',
    'RUNNING',
    91,
    NOW(),
    NOW()
  ),
  (
    'demo-aquarium-betta',
    'demo-user-001',
    '斗鱼阴性草缸',
    'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=800&q=80',
    36,
    45,
    30,
    30,
    '暹罗斗鱼 Betta splendens 1只、蜜蜂角螺 Clithon corona 2只、水榕 Anubias barteri',
    'RUNNING',
    89,
    NOW(),
    NOW()
  ),
  (
    'demo-aquarium-coldwater',
    'demo-user-001',
    '冷水金鱼大缸',
    'https://images.unsplash.com/photo-1555861496-0666c8981751?auto=format&fit=crop&w=800&q=80',
    180,
    120,
    45,
    45,
    '琉金金鱼 Carassius auratus 2只、狮子头金鱼 Carassius auratus 1只',
    'MAINTENANCE',
    82,
    NOW(),
    NOW()
  );

-- 插入真实常见鱼种档案
INSERT INTO "FishSpecies" (id, "commonName", "scientificName", category, origin, "careLevel", temperament, diet, "waterLayer", "minGroupSize", "minTankLiters", "adultSizeCm", "temperatureMin", "temperatureMax", "phMin", "phMax", hardness, notes, "sourceUrls", "createdAt", "updatedAt") VALUES
  ('species-neon-tetra', '红绿灯鱼', 'Paracheirodon innesi', '灯科鱼', '南美亚马逊流域', 'Easy', 'Peaceful', 'Omnivore', '中层', 6, 40, 4.0, 20.0, 26.0, 5.0, 7.5, '1-10 dGH', '群游鱼，适合软水、弱酸到中性草缸，避免高温长期饲养。', 'https://fishbase.se/summary/Paracheirodon-innesi.html;https://www.seriouslyfish.com/species/paracheirodon-innesi/;https://tropicalfishco.co.uk/care-guides/neon-tetra', NOW(), NOW()),
  ('species-panda-cory', '熊猫鼠', 'Corydoras panda', '鼠鱼', '南美秘鲁溪流', 'Easy', 'Peaceful', 'Omnivore', '底层', 6, 60, 5.0, 22.0, 26.0, 6.0, 7.8, 'soft to medium', '同种 6 只以上群养，细砂底床更适合翻砂觅食。', 'https://www.seriouslyfish.com/species/corydoras-panda/;https://tropicalfishco.co.uk/care-guides/corydoras', NOW(), NOW()),
  ('species-otocinclus', '小精灵', 'Otocinclus spp.', '异型/藻食鱼', '南美溪流', 'Moderate', 'Peaceful', 'Herbivore', '底层/附着面', 3, 60, 4.5, 22.0, 26.0, 6.0, 7.5, 'soft to medium', '适合成熟草缸，依赖稳定水质和藻类/植物性饲料补充。', 'https://www.seriouslyfish.com/genus/otocinclus/;https://fishbase.se', NOW(), NOW()),
  ('species-guppy', '孔雀鱼', 'Poecilia reticulata', '卵胎生鱼', '南美北部及加勒比水域', 'Easy', 'Peaceful', 'Omnivore', '上中层', 3, 40, 6.0, 22.0, 28.0, 7.0, 8.5, '8-25 dGH', '偏硬、弱碱水更稳定，繁殖快，注意密度和公母比例。', 'https://fishbase.se/summary/Poecilia-reticulata.html;https://www.seriouslyfish.com/species/poecilia-reticulata/;https://tropicalfishco.co.uk/care-guides/guppy', NOW(), NOW()),
  ('species-platy', '米奇鱼/月光鱼', 'Xiphophorus maculatus', '卵胎生鱼', '中美洲', 'Easy', 'Peaceful', 'Omnivore', '中层', 5, 60, 6.0, 20.0, 28.0, 6.8, 8.0, '10-25 dGH', '与孔雀鱼、玛丽鱼等水质需求接近，适合偏硬水。', 'https://fishbase.se/summary/Xiphophorus-maculatus.html;https://tropicalfishco.co.uk/care-guides/platy-fish', NOW(), NOW()),
  ('species-apple-snail', '苹果螺', 'Pomacea bridgesii', '螺类', '南美', 'Easy', 'Peaceful', 'Omnivore', '底层/缸壁', 1, 20, 5.0, 20.0, 28.0, 7.0, 8.0, 'medium to hard', '需要钙质和稳定硬度，避免与啃咬触角的鱼混养。', 'https://www.fishkeeping.co.uk;https://fishbase.se', NOW(), NOW()),
  ('species-betta', '暹罗斗鱼', 'Betta splendens', '攀鲈/斗鱼', '泰国、柬埔寨等东南亚静水环境', 'Easy', 'Territorial', 'Carnivore', '上层', 1, 30, 6.5, 24.0, 30.0, 6.0, 8.0, '5-19 dGH', '雄鱼通常单养，水流要缓，缸口防跳并保留温暖湿润空气层。', 'https://fishbase.se/summary/Betta-splendens.html;https://www.seriouslyfish.com/species/betta-splendens/;https://www.fishkeeping.co.uk/modules/caresheets/caresheet.php?caresheetID=82', NOW(), NOW()),
  ('species-horned-nerite', '蜜蜂角螺', 'Clithon corona', '螺类', '印度-太平洋沿岸溪流', 'Easy', 'Peaceful', 'Algae grazer', '缸壁/硬景', 1, 20, 2.0, 22.0, 28.0, 7.0, 8.2, 'medium to hard', '擅长清理硬景藻类，淡水中通常不会爆缸繁殖。', 'https://www.fishkeeping.co.uk;https://www.seriouslyfish.com', NOW(), NOW()),
  ('species-goldfish', '金鱼', 'Carassius auratus', '冷水鱼', '东亚人工选育品系', 'Easy', 'Peaceful', 'Omnivore', '全水层', 1, 120, 20.0, 18.0, 24.0, 6.5, 8.0, '6-16 dGH', '排泄量大，需要大水体和强过滤，不适合热带鱼混养。', 'https://fishbase.se/summary/Carassius-auratus.html;https://www.practicalfishkeeping.co.uk/features/comet-goldfish-carassius-auratus-auratus;https://www.fishkeeping.co.uk/modules/caresheets/caresheet.php?caresheetID=80', NOW(), NOW());

-- 插入鱼缸鱼只库存
INSERT INTO "AquariumStock" (id, "aquariumId", "speciesId", quantity, "displayName", color, note, "createdAt", "updatedAt") VALUES
  ('stock-community-neon', 'demo-aquarium-community', 'species-neon-tetra', 12, '红绿灯鱼', '#1f8fff', '主群游鱼，观察体色和群游紧密度。', NOW(), NOW()),
  ('stock-community-cory', 'demo-aquarium-community', 'species-panda-cory', 6, '熊猫鼠', '#2fbd79', '底层清理残饵，但不能替代人工维护。', NOW(), NOW()),
  ('stock-community-oto', 'demo-aquarium-community', 'species-otocinclus', 3, '小精灵', '#18385d', '成熟草缸少量控藻，补充植物性饲料。', NOW(), NOW()),
  ('stock-livebearer-guppy', 'demo-aquarium-livebearer', 'species-guppy', 10, '孔雀鱼', '#ff8717', '全雄展示为主，减少爆缸风险。', NOW(), NOW()),
  ('stock-livebearer-platy', 'demo-aquarium-livebearer', 'species-platy', 6, '米奇鱼', '#f3b833', '同属硬水卵胎生鱼，活泼中层活动。', NOW(), NOW()),
  ('stock-livebearer-snail', 'demo-aquarium-livebearer', 'species-apple-snail', 2, '苹果螺', '#8d6e4f', '辅助清理残饵，注意补钙和硬度。', NOW(), NOW()),
  ('stock-betta-betta', 'demo-aquarium-betta', 'species-betta', 1, '暹罗斗鱼', '#c24572', '雄鱼单养，避免强水流和啃鳍鱼。', NOW(), NOW()),
  ('stock-betta-snail', 'demo-aquarium-betta', 'species-horned-nerite', 2, '蜜蜂角螺', '#635b4b', '清理缸壁藻类，需防逃。', NOW(), NOW()),
  ('stock-coldwater-goldfish', 'demo-aquarium-coldwater', 'species-goldfish', 3, '金鱼', '#ff9f1c', '冷水大缸，重点关注过滤和硝酸盐。', NOW(), NOW());

-- 插入设备档案
INSERT INTO "AquariumDevice" (id, "aquariumId", type, name, status, "powerWatts", "flowRateLph", schedule, note, "createdAt", "updatedAt") VALUES
  ('device-community-filter', 'demo-aquarium-community', 'FILTER', '外置过滤桶 600 L/h', 'RUNNING', 12, 600, NULL, '适合 60cm 草缸，出水口缓流避免冲散灯鱼群。', NOW(), NOW()),
  ('device-community-light', 'demo-aquarium-community', 'LIGHT', '水草 LED 灯', 'SCHEDULED', 24, NULL, '10:00-18:00', '中等光照，控制藻类。', NOW(), NOW()),
  ('device-community-heater', 'demo-aquarium-community', 'HEATER', '恒温加热棒 100W', 'RUNNING', 100, NULL, '24℃', '红绿灯鱼不宜长期高温。', NOW(), NOW()),
  ('device-livebearer-filter', 'demo-aquarium-livebearer', 'FILTER', '背滤系统 700 L/h', 'RUNNING', 15, 700, NULL, '卵胎生鱼密度上升快，过滤留有余量。', NOW(), NOW()),
  ('device-livebearer-light', 'demo-aquarium-livebearer', 'LIGHT', '观赏 LED 灯', 'SCHEDULED', 18, NULL, '09:30-19:30', '配合浮水植物给幼鱼躲避。', NOW(), NOW()),
  ('device-betta-filter', 'demo-aquarium-betta', 'FILTER', '低流量水妖精', 'RUNNING', 3, 120, NULL, '低流量过滤，避免斗鱼长期顶水流。', NOW(), NOW()),
  ('device-betta-heater', 'demo-aquarium-betta', 'HEATER', '迷你恒温加热棒 50W', 'RUNNING', 50, NULL, '26℃', '小水体注意温度稳定。', NOW(), NOW()),
  ('device-coldwater-filter', 'demo-aquarium-coldwater', 'FILTER', '大流量外置过滤桶 1200 L/h', 'RUNNING', 28, 1200, NULL, '金鱼排泄量大，过滤优先级高。', NOW(), NOW()),
  ('device-coldwater-air', 'demo-aquarium-coldwater', 'AIR_PUMP', '双头增氧泵', 'RUNNING', 5, NULL, '全天', '提升溶氧并辅助水体循环。', NOW(), NOW());

-- 插入目标水质区间
INSERT INTO "WaterParameterProfile" (id, "aquariumId", "temperatureMin", "temperatureMax", "phMin", "phMax", "ammoniaMax", "nitriteMax", "nitrateMax", "tdsMin", "tdsMax", note, "sourceUrls", "createdAt", "updatedAt") VALUES
  ('profile-community', 'demo-aquarium-community', 22.0, 25.0, 6.2, 7.2, 0.0, 0.0, 20.0, 80, 160, '按红绿灯鱼、鼠鱼和小精灵的重叠区间设置，偏软弱酸到中性。', 'https://fishbase.se;https://www.seriouslyfish.com;https://tropicalfishco.co.uk/care-guides', NOW(), NOW()),
  ('profile-livebearer', 'demo-aquarium-livebearer', 24.0, 27.0, 7.2, 8.0, 0.0, 0.0, 30.0, 180, 320, '按孔雀鱼和米奇鱼设置，偏硬弱碱水更稳定。', 'https://fishbase.se;https://www.seriouslyfish.com;https://tropicalfishco.co.uk/care-guides', NOW(), NOW()),
  ('profile-betta', 'demo-aquarium-betta', 25.0, 28.0, 6.5, 7.5, 0.0, 0.0, 20.0, 100, 220, '按人工斗鱼常见饲养区间设置，小缸重点控制波动。', 'https://fishbase.se;https://www.seriouslyfish.com;https://www.fishkeeping.co.uk', NOW(), NOW()),
  ('profile-coldwater', 'demo-aquarium-coldwater', 18.0, 22.0, 7.0, 8.0, 0.0, 0.0, 30.0, 150, 280, '金鱼冷水大缸，硝酸盐阈值设得更保守以提示换水。', 'https://fishbase.se;https://www.practicalfishkeeping.co.uk;https://www.fishkeeping.co.uk', NOW(), NOW());

-- 插入投喂模板
INSERT INTO "FeedingTemplate" (id, "aquariumId", "speciesId", food, amount, frequency, note, "createdAt", "updatedAt") VALUES
  ('feed-community-neon', 'demo-aquarium-community', 'species-neon-tetra', '小型热带鱼薄片/微颗粒', '2 分钟内吃完', '每日 1-2 次', '少量多次，避免残饵沉底。', NOW(), NOW()),
  ('feed-community-cory', 'demo-aquarium-community', 'species-panda-cory', '鼠鱼沉底饲料片', '每 6 只半片到 1 片', '每日 1 次，关灯前', '不要只依赖上层鱼残饵。', NOW(), NOW()),
  ('feed-livebearer', 'demo-aquarium-livebearer', 'species-guppy', '卵胎生鱼薄片/螺旋藻薄片', '2 分钟内吃完', '每日 1-2 次', '繁殖期可搭配丰年虾或冻干饲料。', NOW(), NOW()),
  ('feed-betta', 'demo-aquarium-betta', 'species-betta', '斗鱼高蛋白颗粒', '3-5 粒', '每日 1-2 次，每周停食 1 天', '观察腹部，避免过量导致便秘和坏水。', NOW(), NOW()),
  ('feed-goldfish', 'demo-aquarium-coldwater', 'species-goldfish', '金鱼缓沉颗粒/植物性饲料', '3 分钟内吃完', '每日 1-2 次', '金鱼排泄量大，投喂量直接影响硝酸盐。', NOW(), NOW());

-- 插入水质记录：数值按鱼种常见饲养区间设置
INSERT INTO "WaterQualityRecord" (id, "aquariumId", temperature, ph, ammonia, nitrite, nitrate, tds, note, "recordedAt", "createdAt", "updatedAt") VALUES
  ('demo-water-001', 'demo-aquarium-community', 24.0, 6.8, 0.0, 0.0, 8.0, 110, '红绿灯鱼适合偏软、弱酸到中性水，当前水质稳定。', NOW() - INTERVAL '6 days', NOW(), NOW()),
  ('demo-water-002', 'demo-aquarium-community', 24.2, 6.7, 0.0, 0.0, 10.0, 118, '鼠鱼状态活跃，底砂无明显残饵。', NOW() - INTERVAL '3 days', NOW(), NOW()),
  ('demo-water-003', 'demo-aquarium-community', 24.4, 6.8, 0.0, 0.0, 12.0, 120, '硝酸盐仍在安全范围内，周末按计划换水。', NOW() - INTERVAL '12 hours', NOW(), NOW()),
  ('demo-water-004', 'demo-aquarium-livebearer', 25.6, 7.6, 0.0, 0.0, 15.0, 260, '孔雀鱼和米奇鱼适合偏硬、弱碱水，TDS 与 pH 匹配。', NOW() - INTERVAL '5 days', NOW(), NOW()),
  ('demo-water-005', 'demo-aquarium-livebearer', 25.8, 7.7, 0.0, 0.0, 18.0, 268, '幼鱼较多，注意少量多餐并加强换水。', NOW() - INTERVAL '1 day', NOW(), NOW()),
  ('demo-water-006', 'demo-aquarium-betta', 26.5, 7.0, 0.0, 0.0, 7.0, 145, '斗鱼缸水流偏缓，温度稳定，适合单养。', NOW() - INTERVAL '4 days', NOW(), NOW()),
  ('demo-water-007', 'demo-aquarium-betta', 26.3, 7.1, 0.0, 0.0, 9.0, 150, '浮叶植物覆盖正常，保留水面呼吸空间。', NOW() - INTERVAL '18 hours', NOW(), NOW()),
  ('demo-water-008', 'demo-aquarium-coldwater', 20.0, 7.5, 0.0, 0.0, 24.0, 210, '金鱼排泄量大，硝酸盐接近换水阈值。', NOW() - INTERVAL '3 days', NOW(), NOW()),
  ('demo-water-009', 'demo-aquarium-coldwater', 20.5, 7.6, 0.0, 0.0, 32.0, 220, '建议换水 30%-40%，并检查过滤棉堵塞情况。', NOW() - INTERVAL '8 hours', NOW(), NOW());

-- 插入维护记录
INSERT INTO "MaintenanceRecord" (id, "aquariumId", type, note, "imageUrl", "happenedAt", "createdAt", "updatedAt") VALUES
  ('demo-maint-001', 'demo-aquarium-community', '换水', '更换 25% 已除氯新水，保持水温差小于 1℃。', NULL, NOW() - INTERVAL '7 days', NOW(), NOW()),
  ('demo-maint-002', 'demo-aquarium-community', '投喂', '红绿灯鱼少量薄片饲料，鼠鱼补充沉底饲料片。', NULL, NOW() - INTERVAL '1 day', NOW(), NOW()),
  ('demo-maint-003', 'demo-aquarium-livebearer', '修剪水草', '修剪金鱼藻和蜈蚣草，保留幼鱼躲避区。', NULL, NOW() - INTERVAL '4 days', NOW(), NOW()),
  ('demo-maint-004', 'demo-aquarium-livebearer', '添加鱼只', '新增 3 条全雄孔雀鱼，入缸前滴流过水 40 分钟。', NULL, NOW() - INTERVAL '12 days', NOW(), NOW()),
  ('demo-maint-005', 'demo-aquarium-betta', '清洗过滤', '轻洗水妖精棉，避免强水流刺激斗鱼。', NULL, NOW() - INTERVAL '9 days', NOW(), NOW()),
  ('demo-maint-006', 'demo-aquarium-betta', '换水', '更换 20% 水，补充榄仁叶。', NULL, NOW() - INTERVAL '2 days', NOW(), NOW()),
  ('demo-maint-007', 'demo-aquarium-coldwater', '换水', '更换 35% 水并虹吸底部粪便。', NULL, NOW() - INTERVAL '8 days', NOW(), NOW()),
  ('demo-maint-008', 'demo-aquarium-coldwater', '清洗过滤', '清洗前置过滤棉，保留主滤材硝化菌。', NULL, NOW() - INTERVAL '1 day', NOW(), NOW());

-- 插入提醒
INSERT INTO "Reminder" (id, "userId", "aquariumId", title, note, "dueAt", "repeatRule", status, "createdAt", "updatedAt") VALUES
  ('demo-reminder-001', 'demo-user-001', 'demo-aquarium-community', '南美缸换水', '每周换水 20%-30%，尽量保持软水和弱酸环境稳定。', NOW() + INTERVAL '2 days', 'weekly', 'PENDING', NOW(), NOW()),
  ('demo-reminder-002', 'demo-user-001', 'demo-aquarium-community', '鼠鱼沉底饲料', '关灯前少量投喂，避免残饵过夜。', NOW() + INTERVAL '1 day', 'daily', 'PENDING', NOW(), NOW()),
  ('demo-reminder-003', 'demo-user-001', 'demo-aquarium-livebearer', '观察孔雀鱼幼鱼', '记录幼鱼数量，必要时增加浮水植物躲避。', NOW() + INTERVAL '3 days', NULL, 'PENDING', NOW(), NOW()),
  ('demo-reminder-004', 'demo-user-001', 'demo-aquarium-betta', '斗鱼缸换水', '小缸每周换水 20%-30%，避免一次性大幅波动。', NOW() + INTERVAL '4 days', 'weekly', 'PENDING', NOW(), NOW()),
  ('demo-reminder-005', 'demo-user-001', 'demo-aquarium-coldwater', '金鱼缸硝酸盐复测', '金鱼排泄量大，复测 NO3 并按结果决定换水比例。', NOW() + INTERVAL '1 day', NULL, 'PENDING', NOW(), NOW()),
  ('demo-reminder-006', 'demo-user-001', NULL, '补充试剂', '补充 pH、氨氮、亚硝酸盐和硝酸盐测试剂。', NOW() + INTERVAL '6 days', NULL, 'PENDING', NOW(), NOW());

-- 插入知识库文章
INSERT INTO "KnowledgeArticle" (id, title, category, summary, content, "createdAt", "updatedAt") VALUES
  (
    'demo-knowledge-001',
    '常见观赏鱼参数速查',
    '鱼种',
    '整理常见淡水观赏鱼的温度、pH、群养和缸体建议。',
    '## 常见观赏鱼参数速查\n\n> 参数来自 FishBase、Seriously Fish、Practical Fishkeeping、Fishkeeping.co.uk 和 Tropical Fish Co 的鱼种档案。不同人工品系、当地水源和饲养密度会带来差异，实际管理以稳定水质和鱼只状态为准。\n\n| 中文名 | 学名 | 常见温度 | pH | 建议 |\n| --- | --- | --- | --- | --- |\n| 红绿灯鱼 | Paracheirodon innesi | 20-26℃ | 5.0-7.5 | 5-10 只以上群游，适合软水、弱酸到中性草缸 |\n| 孔雀鱼 | Poecilia reticulata | 22-28℃ | 7.0-8.5 | 适合偏硬弱碱水，注意公母比例和繁殖密度 |\n| 暹罗斗鱼 | Betta splendens | 24-30℃ | 6.0-8.0 | 雄鱼单养，水流要缓，缸口需防跳并留水面空气层 |\n| 斑马鱼 | Danio rerio | 18-25℃ | 6.0-8.0 | 活泼群游鱼，建议长缸和 6 只以上群体 |\n| 米奇鱼/月光鱼 | Xiphophorus maculatus | 20-28℃ | 6.8-8.0 | 与孔雀鱼等卵胎生鱼水质相近，偏硬水更稳 |\n| 花鳉/玛丽鱼 | Poecilia sphenops | 22-28℃ | 7.0-8.5 | 喜硬碱水，过滤和溶氧要足 |\n| 鼠鱼 | Corydoras spp. | 22-26℃ | 6.0-7.8 | 6 只以上同种群养，底砂以细砂为佳 |\n| 琉金/狮子头金鱼 | Carassius auratus | 18-24℃ | 6.5-8.0 | 冷水鱼、排泄量大，需要大水体和强过滤 |\n\n### 数据怎么用\n\n- 选鱼先看温度和 pH 是否重叠，再看体型、速度、攻击性和水层。\n- 氨氮和亚硝酸盐应保持 0；硝酸盐长期高于 20-40 mg/L 时应提高换水频率。\n- 小型热带鱼通常每周换水 20%-30%；金鱼等高排泄鱼需要更大的水体和更勤维护。\n\n### 参考来源\n\n- FishBase: https://fishbase.se\n- Seriously Fish: https://www.seriouslyfish.com\n- Practical Fishkeeping: https://www.practicalfishkeeping.co.uk\n- Fishkeeping.co.uk care sheets: https://www.fishkeeping.co.uk/modules/caresheets\n- Tropical Fish Co care guides: https://tropicalfishco.co.uk/care-guides',
    NOW(),
    NOW()
  ),
  (
    'demo-knowledge-002',
    '新手养鱼入门指南',
    '入门',
    '从开缸、过水、检疫到日常维护的基础流程。',
    '## 新手养鱼入门指南\n\n### 1. 先定鱼，再定缸\n\n不要先买一个很小的缸再塞鱼。先确认目标鱼种的成年体型、群养数量和水质范围，再选择缸体尺寸、过滤和加热设备。\n\n### 2. 开缸养水\n\n- 清洗鱼缸和器材，不使用洗洁精。\n- 安装过滤、加热和照明。\n- 注入除氯后的水，运行过滤并建立硝化系统。\n- 新缸前 2-4 周少量进鱼，持续检测氨氮和亚硝酸盐。\n\n### 3. 新鱼入缸\n\n- 外袋浮缸 20-30 分钟平衡温度。\n- 分批加入缸水，让鱼适应 pH 和硬度。\n- 用鱼网转移，尽量不要把运输袋水倒入主缸。\n- 条件允许时，新鱼先隔离检疫 1-2 周。\n\n### 4. 日常维护\n\n- 每天观察呼吸、体色、进食和游姿。\n- 每周检测 pH、氨氮、亚硝酸盐和硝酸盐。\n- 多数社区缸每周换水 20%-30%，高密度或金鱼缸需要更频繁。',
    NOW(),
    NOW()
  ),
  (
    'demo-knowledge-003',
    '水质参数详解',
    '水质',
    '理解温度、pH、氨氮、亚硝酸盐、硝酸盐和 TDS。',
    '## 水质参数详解\n\n### 温度\n\n温度要按鱼种匹配。红绿灯鱼偏凉，常见范围约 20-26℃；斗鱼和多数热带鱼更适合 24-28℃；金鱼属于冷水鱼，不适合和热带鱼混养。\n\n### pH\n\npH 不是越接近 7 越好，而是要稳定并符合鱼种来源。孔雀鱼、米奇鱼和玛丽鱼更适合偏硬、弱碱水；南美灯鱼和鼠鱼通常更适合软水到中性水。\n\n### 氨氮和亚硝酸盐\n\n成熟鱼缸中氨氮和亚硝酸盐应为 0。任何可测出的氨氮或亚硝酸盐都说明硝化系统、饲养密度或喂食量需要排查。\n\n### 硝酸盐\n\n硝酸盐毒性低于氨氮和亚硝酸盐，但长期偏高会增加压力。一般社区缸建议尽量低于 20-40 mg/L。\n\n### TDS\n\nTDS 可帮助观察水体总溶解物变化，但不能单独代表水质好坏。换水、补水和矿物盐添加都应结合 pH、硬度和鱼种需求判断。',
    NOW(),
    NOW()
  ),
  (
    'demo-knowledge-004',
    '常见混养组合',
    '混养',
    '按水质和行为匹配鱼只，减少追咬和长期压力。',
    '## 常见混养组合\n\n### 南美小型社区缸\n\n红绿灯鱼、宝莲灯鱼、鼠鱼、小精灵和部分小型异型可以形成上中下水层分工。关键是软水到中性、低硝酸盐和足够群体数量。\n\n### 硬水卵胎生鱼缸\n\n孔雀鱼、米奇鱼、剑尾鱼和玛丽鱼水质需求接近，适合偏硬、弱碱水。需要注意繁殖过快、雄鱼追逐和密度上升。\n\n### 斗鱼单养缸\n\n雄性斗鱼建议单养，可搭配螺类或在足够空间里谨慎尝试温和底栖鱼。避免强水流、啃鳍鱼和颜色鲜艳长鳍鱼。\n\n### 金鱼缸\n\n金鱼应作为冷水、大水体、高过滤场景处理。不要和热带鱼混养，也不要把金鱼长期养在小缸或无过滤环境。',
    NOW(),
    NOW()
  );
-- 水族大师数据库扩展初始化脚本
-- 添加更多专业鱼友常用的鱼种和鱼缸配置
--
-- 参考来源：
-- - Aquarium Co-Op: https://www.aquariumcoop.com
-- - 2Hr Aquarist: https://www.2hraquarist.com
-- - Seriously Fish: https://www.seriouslyfish.com
-- - Practical Fishkeeping: https://www.practicalfishkeeping.co.uk
-- - Tropica Aquarium Plants: https://tropica.com

-- ============================================
-- 扩展鱼种档案
-- ============================================

-- 更多灯科鱼
INSERT INTO "FishSpecies" (id, "commonName", "scientificName", category, origin, "careLevel", temperament, diet, "waterLayer", "minGroupSize", "minTankLiters", "adultSizeCm", "temperatureMin", "temperatureMax", "phMin", "phMax", hardness, notes, "sourceUrls", "createdAt", "updatedAt") VALUES
  ('species-cardinal-tetra', '宝莲灯鱼', 'Paracheirodon axelrodi', '灯科鱼', '南美尼格罗河', 'Moderate', 'Peaceful', 'Omnivore', '中层', 8, 60, 5.0, 23.0, 28.0, 4.5, 7.0, 'soft', '比红绿灯更敏感，需要软水弱酸和稳定水质，成鱼体色更红。', 'https://www.seriouslyfish.com/species/paracheirodon-axelrodi/', NOW(), NOW()),
  ('species-black-neon', '黑灯鱼', 'Hyphessobrycon herbertaxelrodi', '灯科鱼', '南美巴拉圭河流域', 'Easy', 'Peaceful', 'Omnivore', '中层', 6, 40, 4.0, 20.0, 28.0, 5.5, 7.5, 'soft to medium', '体侧黑色纵带明显，比红绿灯更耐造，适合新手入门。', 'https://www.seriouslyfish.com/species/hyphessobrycon-herbertaxelrodi/', NOW(), NOW()),
  ('species-rummy-nose', '红鼻剪刀', 'Hemigrammus rhodostomus', '灯科鱼', '南美亚马逊河流域', 'Moderate', 'Peaceful', 'Omnivore', '中层', 8, 80, 5.0, 24.0, 28.0, 5.5, 7.0, 'soft', '头部红色区域对水质敏感，可作为水质指示鱼，需要稳定软水。', 'https://www.seriouslyfish.com/species/hemigrammus-rhodostomus/', NOW(), NOW()),
  ('species-glowlight', '火焰灯', 'Hemigrammus erythrozonus', '灯科鱼', '南美埃塞奎博河流域', 'Easy', 'Peaceful', 'Omnivore', '中层', 6, 40, 4.0, 24.0, 28.0, 5.5, 7.5, 'soft to medium', '体侧红色纵带发荧光，适应性强，适合小型草缸群游。', 'https://www.seriouslyfish.com/species/hemigrammus-erythrozonus/', NOW(), NOW()),
  ('species-emerald-eye', '蓝眼灯', 'Moenkhausia pittieri', '灯科鱼', '南美委内瑞拉', 'Easy', 'Peaceful', 'Omnivore', '中上层', 6, 60, 6.0, 22.0, 28.0, 6.0, 7.5, 'soft to medium', '眼部虹膜蓝色明显，活泼好动，可与其他小型灯鱼混养。', 'https://www.seriouslyfish.com/species/moenkhausia-pittieri/', NOW(), NOW()),
  ('species-chili-rasbora', '火焰火鹤/辣椒鲃', 'Boraras brigittae', '鲤科鱼', '东南亚婆罗洲黑水流域', 'Moderate', 'Peaceful', 'Omnivore', '中上层', 8, 30, 2.5, 20.0, 28.0, 4.0, 7.0, 'very soft', '微型鱼，仅2.5cm，适合超小型草缸，避免与活泼鱼混养。', 'https://www.seriouslyfish.com/species/boraras-brigittae/', NOW(), NOW()),
  ('species-celestial-pearl', '火鹤/珍珠丹', 'Danio margaritatus', '鲤科鱼', '东南亚缅甸', 'Moderate', 'Peaceful', 'Omnivore', '中上层', 8, 40, 2.5, 18.0, 26.0, 6.5, 7.5, 'soft to medium', '体布蓝色珍珠斑点和橘红鳍，适合密植水草缸，注意繁殖。', 'https://www.seriouslyfish.com/species/danio-margaritatus/', NOW(), NOW()),

-- 更多鼠鱼和底栖鱼
  ('species-bronze-cory', '青铜鼠', 'Corydoras aeneus', '鼠鱼', '南美特立尼达和亚马逊流域', 'Easy', 'Peaceful', 'Omnivore', '底层', 6, 60, 6.5, 22.0, 28.0, 6.0, 8.0, 'soft to hard', '最耐造的鼠鱼品种之一，适应各种水质，适合新手入门。', 'https://www.seriouslyfish.com/species/corydoras-aeneus/', NOW(), NOW()),
  ('species-leopard-cory', '豹纹鼠', 'Corydoras trilineatus', '鼠鱼', '南美亚马逊河流域', 'Easy', 'Peaceful', 'Omnivore', '底层', 6, 60, 6.0, 22.0, 26.0, 6.0, 7.5, 'soft to medium', '体侧豹纹明显，常与三线鼠 C. julii 混淆，适应性强。', 'https://www.seriouslyfish.com/species/corydoras-trilineatus/', NOW(), NOW()),
  ('species-striatus-cory', '三线鼠', 'Corydoras trilineatus', '鼠鱼', '南美亚马逊河流域', 'Easy', 'Peaceful', 'Omnivore', '底层', 6, 60, 6.0, 22.0, 26.0, 6.0, 7.5, 'soft to medium', '体侧三条纵线，与豹纹鼠相似，细砂底床更适合。', 'https://www.seriouslyfish.com/species/corydoras-julii/', NOW(), NOW()),
  ('species-sterbai-cory', '斯塔比鼠', 'Corydoras sterbai', '鼠鱼', '南美瓜apore河流域', 'Easy', 'Peaceful', 'Omnivore', '底层', 6, 80, 7.0, 23.0, 28.0, 6.0, 7.5, 'soft to medium', '头部斑点图案独特，耐高温，适合与小型慈鲷混养。', 'https://www.seriouslyfish.com/species/corydoras-sterbai/', NOW(), NOW()),
  ('species-habrosus-cory', '哈布斯鼠/迷你鼠', 'Corydoras habrosus', '鼠鱼', '南美奥里诺科河流域', 'Moderate', 'Peaceful', 'Omnivore', '底层', 8, 40, 3.5, 22.0, 26.0, 6.0, 7.5, 'soft to medium', '小型鼠鱼，仅3.5cm，适合纳米缸，需8只以上群养。', 'https://www.seriouslyfish.com/species/corydoras-habrosus/', NOW(), NOW()),
  ('species-pygmy-cory', '侏儒鼠', 'Corydoras pygmaeus', '鼠鱼', '南美巴拉圭河流域', 'Easy', 'Peaceful', 'Omnivore', '中底层', 8, 40, 3.2, 22.0, 28.0, 6.0, 7.5, 'soft to medium', '与其他鼠鱼不同，会在中水层群游，适合纳米草缸。', 'https://www.seriouslyfish.com/species/corydoras-pygmaeus/', NOW(), NOW()),
  ('species-kuhli-loach', '胡椒鼬/奶油鼠', 'Pangio kuhlii', '鳅科', '东南亚爪哇、苏门答腊', 'Moderate', 'Peaceful', 'Omnivore', '底层', 5, 60, 10.0, 24.0, 30.0, 6.0, 7.5, 'soft to medium', '蛇形身体，黄黑相间环纹，昼伏夜出，细砂和躲避处必需。', 'https://www.seriouslyfish.com/species/pangio-kuhlii/', NOW(), NOW()),

-- 虾类
  ('species-cherry-shrimp', '樱花虾', 'Neocaridina davidi var. red', '米虾', '东亚（人工选育）', 'Easy', 'Peaceful', 'Omnivore', '全水层', 10, 20, 2.5, 15.0, 28.0, 6.5, 8.0, '4-14 dGH', '最入门的观赏虾，适应性强，繁殖快，适合草缸控藻。', 'https://www.aquariumcoop.com/blogs/aquarium/cherry-shrimp-care', NOW(), NOW()),
  ('species-yellow-shrimp', '黄金虾', 'Neocaridina davidi var. yellow', '米虾', '东亚（人工选育）', 'Easy', 'Peaceful', 'Omnivore', '全水层', 10, 20, 2.5, 15.0, 28.0, 6.5, 8.0, '4-14 dGH', '樱花虾黄化品种，色彩鲜艳，适合与深色水草搭配。', 'https://buceplant.com/blogs/aquascaping-guides-and-tips/a-guide-for-keeping-freshwater-shrimp', NOW(), NOW()),
  ('species-blue-dream-shrimp', '蓝精灵虾', 'Neocaridina davidi var. blue', '米虾', '东亚（人工选育）', 'Easy', 'Peaceful', 'Omnivore', '全水层', 10, 20, 2.5, 15.0, 28.0, 6.5, 8.0, '4-14 dGH', '樱花虾蓝化品种，蓝色体色在绿色水草中对比明显。', 'https://buceplant.com/blogs/aquascaping-guides-and-tips/a-guide-for-keeping-freshwater-shrimp', NOW(), NOW()),
  ('species-crystal-red-shrimp', '水晶虾', 'Caridina cantonensis var. crystal red', '米虾', '东亚（人工选育）', 'Difficult', 'Peaceful', 'Omnivore', '全水层', 10, 30, 2.5, 18.0, 26.0, 5.5, 7.0, '4-6 dGH', '需软水弱酸、稳定水质，TDS 100-200，适合纯虾缸饲养。', 'https://www.2hraquarist.com/blogs/freshwater-fish-and-livestock/keeping-dwarf-shrimp-in-planted-tanks', NOW(), NOW()),
  ('species-black-tiger-shrimp', '黑金刚虾', 'Caridina cantonensis var. black tiger', '米虾', '东亚（人工选育）', 'Difficult', 'Peaceful', 'Omnivore', '全水层', 10, 30, 2.5, 18.0, 26.0, 5.5, 7.0, '4-6 dGH', '黑色条纹明显，与水晶虾水质需求相同，适合专业玩家。', 'https://buceplant.com/blogs/aquascaping-guides-and-tips/a-guide-for-keeping-freshwater-shrimp', NOW(), NOW()),
  ('species-amano-shrimp', '大和藻虾', 'Caridina multidentata', '米虾', '日本', 'Easy', 'Peaceful', 'Herbivore', '全水层', 3, 40, 5.0, 15.0, 28.0, 6.5, 7.5, 'soft to medium', '控藻能力最强，淡水不繁殖，适合大型草缸清理藻类。', 'https://www.aquariumcoop.com/blogs/aquarium/amano-shrimp-care', NOW(), NOW()),

-- 三湖慈鲷
  ('species-neolamprologus-brichardi', '布氏新亮丽鲷', 'Neolamprologus brichardi', '坦干伊克湖慈鲷', '东非坦干伊克湖', 'Moderate', 'Territorial', 'Carnivore', '中底层', 6, 120, 10.0, 23.0, 27.0, 7.8, 9.0, '10-20 dGH', '岩栖慈鲷，社会性强，幼鱼会协助照顾后代，岩石造景必需。', 'https://www.practicalfishkeeping.co.uk/features/how-to-set-up-a-tanganyikan-cichlid-aquarium/', NOW(), NOW()),
  ('species-neolamprologus-pulcher', '亮丽鲷/燕尾', 'Neolamprologus pulcher', '坦干伊克湖慈鲷', '东非坦干伊克湖', 'Easy', 'Territorial', 'Carnivore', '中底层', 6, 120, 8.0, 23.0, 27.0, 7.8, 9.0, '10-20 dGH', '最入门的坦湖鱼，尾巴呈燕尾状，适合岩石堆叠造景。', 'https://www.practicalfishkeeping.co.uk/features/how-to-set-up-a-tanganyikan-cichlid-aquarium/', NOW(), NOW()),
  ('species-julidochromis-transcriptus', '黄宽带凤凰', 'Julidochromis transcriptus', '坦干伊克湖慈鲷', '东非坦干伊克湖', 'Moderate', 'Territorial', 'Carnivore', '岩缝', 4, 120, 10.0, 23.0, 27.0, 7.8, 9.0, '10-20 dGH', '喜欢岩缝生活，细长身体，成对后领地意识强。', 'https://www.seriouslyfish.com/species/julidochromis-transcriptus/', NOW(), NOW()),
  ('species-cyphotilapia-frontosa', '六间', 'Cyphotilapia frontosa', '坦干伊克湖慈鲷', '东非坦干伊克湖', 'Moderate', 'Peaceful', 'Carnivore', '底层', 4, 400, 30.0, 23.0, 27.0, 7.8, 9.0, '10-20 dGH', '大型深水慈鲷，头部隆起，需要大水体，幼鱼群养成年后配对。', 'https://tanganyika.si', NOW(), NOW()),
  ('species-cyprichromis-leptosoma', '沙丁鱼慈鲷', 'Cyprichromis leptosoma', '坦干伊克湖慈鲷', '东非坦干伊克湖', 'Moderate', 'Peaceful', 'Planktivore', '上层', 12, 200, 10.0, 23.0, 26.0, 7.8, 9.0, '10-20 dGH', '开放水域群游鱼，雄鱼体色鲜艳，可与岩栖慈鲷混养。', 'https://tanganyika.si', NOW(), NOW()),
  ('species-labidochromis-caeruleus', '非洲王子/黄孔雀', 'Labidochromis caeruleus', '马拉维湖慈鲷', '东非马拉维湖', 'Easy', 'Moderate', 'Omnivore', '全水层', 4, 120, 10.0, 23.0, 28.0, 7.5, 8.5, '10-18 dGH', '最入门的马湖鱼，亮黄色体色，Mbuna岩栖类，杂食性。', 'https://aquariumscience.org/17-4-lake-malawi-cichlids/', NOW(), NOW()),
  ('species-melanochromis-auratus', '阿里', 'Melanochromis auratus', '马拉维湖慈鲷', '东非马拉维湖', 'Moderate', 'Aggressive', 'Omnivore', '岩礁', 4, 150, 12.0, 23.0, 28.0, 7.5, 8.5, '10-18 dGH', '雌雄二态明显，雄鱼黑底蓝纹，攻击性强，需要足够岩石躲避。', 'https://aquariumscience.org/17-4-lake-malawi-cichlids/', NOW(), NOW()),
  ('species-pseudotropheus-acei', '白嘴黄尾', 'Pseudotropheus acei', '马拉维湖慈鲷', '东非马拉维湖', 'Easy', 'Moderate', 'Herbivore', '全水层', 6, 150, 12.0, 23.0, 28.0, 7.5, 8.5, '10-18 dGH', '偏植食性，体色蓝紫偏白，性情相对温和，适合混养。', 'https://aquariumscience.org/17-4-lake-malawi-cichlids/', NOW(), NOW()),

-- 其他热门鱼种
  ('species-angel-fish', '神仙鱼/燕鱼', 'Pterophyllum scalare', '慈鲷', '南美亚马逊河流域', 'Moderate', 'Semi-aggressive', 'Omnivore', '全水层', 3, 120, 15.0, 24.0, 30.0, 6.0, 7.5, '3-8 dGH', '优雅的大型慈鲷，成鱼体型大，不适合与小型鱼或啃鳍鱼混养。', 'https://fishbase.se/summary/Pterophyllum-scalare.html', NOW(), NOW()),
  ('species-discus', '七彩神仙鱼', 'Symphysodon spp.', '慈鲷', '南美亚马逊河流域', 'Difficult', 'Peaceful', 'Omnivore', '中层', 4, 200, 15.0, 27.0, 31.0, 6.0, 7.0, 'soft', '被称为热带鱼之王，需要稳定软水和高温，适合单养或成对饲养。', 'https://fishbase.se', NOW(), NOW()),
  ('species-ramirezi', '蓝宝石/蓝波', 'Mikrogeophagus ramirezi', '慈鲷', '南美', 'Moderate', 'Territorial', 'Omnivore', '底层', 4, 80, 7.0, 24.0, 30.0, 5.5, 7.0, 'soft', '小型南美慈鲷，体色鲜艳，成鱼领地意识强，适合草缸。', 'https://www.seriouslyfish.com/species/mikrogeophagus-ramirezi/', NOW(), NOW()),
  ('species-apistogramma-agassizii', '阿卡西短鲷', 'Apistogramma agassizii', '慈鲷', '南美亚马逊河流域', 'Moderate', 'Territorial', 'Carnivore', '底层', 4, 60, 8.0, 24.0, 28.0, 5.5, 7.0, 'soft', '雄鱼尾剑延长，体色多变，需要躲避和酸性软水。', 'https://www.seriouslyfish.com/species/apistogramma-agassizii/', NOW(), NOW()),
  ('species-boesemani-rainbow', '波氏彩虹鱼', 'Melanotaenia boesemani', '彩虹鱼', '印尼巴布亚群岛', 'Easy', 'Peaceful', 'Omnivore', '中上层', 6, 120, 12.0, 26.0, 30.0, 7.0, 8.0, '10-15 dGH', '体色橙蓝渐变，群游效果佳，适合中大型草缸。', 'https://www.seriouslyfish.com/species/melanotaenia-boesemani/', NOW(), NOW()),
  ('species-forcipiger-flavissimus', '黄镊嘴鱼', 'Forcipiger flavissimus', '海水鱼', '印度-太平洋', 'Difficult', 'Peaceful', 'Carnivore', '中层', 1, 300, 20.0, 24.0, 28.0, 8.0, 8.5, '8-12 dKH', '海水鱼，需要海水设备和活石过滤系统，嘴部长管状吸食无脊椎动物。', 'https://fishbase.se', NOW(), NOW());

-- ============================================
-- 扩展鱼缸配置
-- ============================================

INSERT INTO "Aquarium" (id, "userId", name, "coverUrl", "volumeLiters", "lengthCm", "widthCm", "heightCm", species, status, "healthScore", "createdAt", "updatedAt") VALUES
  (
    'demo-aquarium-cherry-shrimp',
    'demo-user-001',
    '樱花虾专业繁殖缸',
    'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=800&q=80',
    30,
    40,
    30,
    25,
    '樱花虾 Neocaridina davidi 50只、日本莫斯 Vesicularia dubyana、水榕 Anubias nana',
    'RUNNING',
    96,
    NOW(),
    NOW()
  ),
  (
    'demo-aquarium-crystal-shrimp',
    'demo-user-001',
    '水晶虾纯软水缸',
    'https://images.unsplash.com/photo-1520301255226-bf5f144451c1?auto=format&fit=crop&w=800&q=80',
    35,
    45,
    35,
    25,
    '水晶虾 Caridina cantonensis 30只、ADA泥、辣椒草 Cryptocoryne wendtii',
    'RUNNING',
    88,
    NOW(),
    NOW()
  ),
  (
    'demo-aquarium-tanganyika',
    'demo-user-001',
    '坦干伊克湖岩景缸',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    250,
    120,
    50,
    50,
    '布氏新亮丽鲷 Neolamprologus brichardi 8只、黄宽带凤凰 Julidochromis transcriptus 4只',
    'RUNNING',
    92,
    NOW(),
    NOW()
  ),
  (
    'demo-aquarium-malawi',
    'demo-user-001',
    '马拉维湖Mbuna岩栖缸',
    'https://images.unsplash.com/photo-1555861496-0666c8981751?auto=format&fit=crop&w=800&q=80',
    300,
    120,
    60,
    50,
    '非洲王子 Labidochromis caeruleus 6只、白嘴黄尾 Pseudotropheus acei 8只、阿里 Melanochromis auratus 4只',
    'RUNNING',
    89,
    NOW(),
    NOW()
  ),
  (
    'demo-aquarium-nano-planted',
    'demo-user-001',
    '30cm微型草缸',
    'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=800&q=80',
    16,
    30,
    20,
    25,
    '辣椒鲃 Boraras brigittae 12只、侏儒鼠 Corydoras pygmaeus 8只、樱花虾 10只',
    'RUNNING',
    94,
    NOW(),
    NOW()
  ),
  (
    'demo-aquarium-biotope',
    'demo-user-001',
    '亚马逊黑水原生缸',
    'https://images.unsplash.com/photo-1520301255226-bf5f144451c1?auto=format&fit=crop&w=800&q=80',
    120,
    80,
    40,
    40,
    '红鼻剪刀 Hemigrammus rhodostomus 15只、红绿灯 Paracheirodon innesi 20只、榄仁叶',
    'RUNNING',
    91,
    NOW(),
    NOW()
  );

-- ============================================
-- 扩展鱼缸鱼只库存
-- ============================================

INSERT INTO "AquariumStock" (id, "aquariumId", "speciesId", quantity, "displayName", color, note, "createdAt", "updatedAt") VALUES
  -- 樱花虾缸
  ('stock-shrimp-cherry', 'demo-aquarium-cherry-shrimp', 'species-cherry-shrimp', 50, '樱花虾', '#ff4d4d', '纯虾缸，繁殖期注意水质稳定，避免金属铜。', NOW(), NOW()),

  -- 水晶虾缸
  ('stock-shrimp-crystal', 'demo-aquarium-crystal-shrimp', 'species-crystal-red-shrimp', 30, '水晶虾', '#ffffff', 'S-A级以上种虾，TDS控制在120-150。', NOW(), NOW()),

  -- 坦干伊克湖缸
  ('stock-tanga-brichardi', 'demo-aquarium-tanganyika', 'species-neolamprologus-brichardi', 8, '布氏新亮丽鲷', '#d4a574', '已形成繁殖群落，注意幼鱼被大鱼攻击。', NOW(), NOW()),
  ('stock-tanga-julidochromis', 'demo-aquarium-tanganyika', 'species-julidochromis-transcriptus', 4, '黄宽带凤凰', '#e8c86e', '岩缝生活，已在岩石间形成领地。', NOW(), NOW()),

  -- 马拉维湖缸
  ('stock-malawi-yellow', 'demo-aquarium-malawi', 'species-labidochromis-caeruleus', 6, '非洲王子', '#ffd700', '1雄5雌比例，减少雄鱼间争斗。', NOW(), NOW()),
  ('stock-malawi-acei', 'demo-aquarium-malawi', 'species-pseudotropheus-acei', 8, '白嘴黄尾', '#6b5b95', '偏植食性，多喂蔬菜和螺旋藻。', NOW(), NOW()),
  ('stock-malawi-auratus', 'demo-aquarium-malawi', 'species-melanochromis-auratus', 4, '阿里', '#1a1a2e', '攻击性强，确保足够岩石躲避。', NOW(), NOW()),

  -- 微型草缸
  ('stock-nano-chili', 'demo-aquarium-nano-planted', 'species-chili-rasbora', 12, '辣椒鲃', '#ff6b6b', '超小型鱼，避免与活泼鱼混养。', NOW(), NOW()),
  ('stock-nano-pygmy', 'demo-aquarium-nano-planted', 'species-pygmy-cory', 8, '侏儒鼠', '#c0c0c0', '会在中水层群游，比其他鼠鱼更活泼。', NOW(), NOW()),
  ('stock-nano-shrimp', 'demo-aquarium-nano-planted', 'species-cherry-shrimp', 10, '樱花虾', '#ff4d4d', '清理藻类和残饵，注意繁殖时幼虾被吃。', NOW(), NOW()),

  -- 原生缸
  ('stock-biotope-rummy', 'demo-aquarium-biotope', 'species-rummy-nose', 15, '红鼻剪刀', '#ff0000', '水质敏感，可作为水质指示鱼。', NOW(), NOW()),
  ('stock-biotope-neon', 'demo-aquarium-biotope', 'species-neon-tetra', 20, '红绿灯鱼', '#1f8fff', '经典搭配，弱酸软水群游效果佳。', NOW(), NOW());

-- ============================================
-- 扩展设备档案
-- ============================================

INSERT INTO "AquariumDevice" (id, "aquariumId", type, name, status, "powerWatts", "flowRateLph", schedule, note, "createdAt", "updatedAt") VALUES
  -- 樱花虾缸设备
  ('device-shrimp-filter', 'demo-aquarium-cherry-shrimp', 'FILTER', '水妖精过滤', 'RUNNING', 5, 150, NULL, '气举式过滤，不会吸走幼虾。', NOW(), NOW()),
  ('device-shrimp-light', 'demo-aquarium-cherry-shrimp', 'LIGHT', 'LED植物灯', 'SCHEDULED', 12, NULL, '09:00-18:00', '中等光强，控制藻类生长。', NOW(), NOW()),

  -- 水晶虾缸设备
  ('device-crystal-filter', 'demo-aquarium-crystal-shrimp', 'FILTER', '外置过滤桶', 'RUNNING', 8, 400, NULL, '内置生化滤材，保持硝化系统稳定。', NOW(), NOW()),
  ('device-crystal-ro', 'demo-aquarium-crystal-shrimp', 'RO_SYSTEM', 'RO纯水机', 'RUNNING', 30, NULL, NULL, '制取TDS 0的纯水，用于调配软水。', NOW(), NOW()),
  ('device-crystal-heater', 'demo-aquarium-crystal-shrimp', 'HEATER', '恒温加热棒', 'RUNNING', 50, NULL, '23℃', '水晶虾适合22-24℃，温度过高寿命缩短。', NOW(), NOW()),

  -- 坦干伊克湖缸设备
  ('device-tanga-filter', 'demo-aquarium-tanganyika', 'FILTER', '大流量外置过滤桶', 'RUNNING', 35, 1500, NULL, '慈鲷排泄量大，强过滤保持水质。', NOW(), NOW()),
  ('device-tanga-light', 'demo-aquarium-tanganyika', 'LIGHT', 'LED水族灯', 'SCHEDULED', 30, NULL, '10:00-17:00', '坦湖慈鲷不需要强光，岩石造景为主。', NOW(), NOW()),
  ('device-tanga-wave', 'demo-aquarium-tanganyika', 'WAVE_MAKER', '造浪泵', 'RUNNING', 8, NULL, '间歇', '模拟湖浪，增加溶氧。', NOW(), NOW()),

  -- 马拉维湖缸设备
  ('device-malawi-filter', 'demo-aquarium-malawi', 'FILTER', '双过滤桶系统', 'RUNNING', 50, 2400, NULL, 'Mbuna攻击性强且密度高，双桶保证硝化能力。', NOW(), NOW()),
  ('device-malawi-light', 'demo-aquarium-malawi', 'LIGHT', '金属卤化物灯', 'SCHEDULED', 150, NULL, '10:00-16:00', '强光促进蓝藻生长，供Mbuna刮食。', NOW(), NOW()),
  ('device-malawi-air', 'demo-aquarium-malawi', 'AIR_PUMP', '四头增氧泵', 'RUNNING', 10, NULL, '全天', '高密度饲养，保证溶氧充足。', NOW(), NOW()),

  -- 微型草缸设备
  ('device-nano-filter', 'demo-aquarium-nano-planted', 'FILTER', '外置迷你过滤桶', 'RUNNING', 3, 120, NULL, '小型过滤桶，配合活性炭和生化棉。', NOW(), NOW()),
  ('device-nano-co2', 'demo-aquarium-nano-planted', 'CO2', 'CO2钢瓶', 'RUNNING', NULL, NULL, '09:00-17:00', '草缸必需，配合光照和肥料。', NOW(), NOW()),
  ('device-nano-light', 'demo-aquarium-nano-planted', 'LIGHT', '迷你LED水草灯', 'SCHEDULED', 8, NULL, '09:00-17:00', '高光强，配合CO2促进矮珍珠爬地。', NOW(), NOW()),

  -- 原生缸设备
  ('device-biotope-filter', 'demo-aquarium-biotope', 'FILTER', '外置过滤桶', 'RUNNING', 15, 700, NULL, '黑水缸不需要强过滤，生物过滤为主。', NOW(), NOW()),
  ('device-biotope-light', 'demo-aquarium-biotope', 'LIGHT', '全光谱LED灯', 'SCHEDULED', 20, NULL, '10:00-16:00', '低光环境，模拟树荫下的河岸。', NOW(), NOW());

-- ============================================
-- 扩展目标水质区间
-- ============================================

INSERT INTO "WaterParameterProfile" (id, "aquariumId", "temperatureMin", "temperatureMax", "phMin", "phMax", "ammoniaMax", "nitriteMax", "nitrateMax", "tdsMin", "tdsMax", note, "sourceUrls", "createdAt", "updatedAt") VALUES
  ('profile-shrimp-cherry', 'demo-aquarium-cherry-shrimp', 20.0, 24.0, 6.5, 7.5, 0.0, 0.0, 20.0, 120, 250, '樱花虾适应性强，重点是避免重金属和农药。', 'https://www.aquariumcoop.com/blogs/aquarium/cherry-shrimp-care', NOW(), NOW()),
  ('profile-shrimp-crystal', 'demo-aquarium-crystal-shrimp', 22.0, 24.0, 5.8, 6.5, 0.0, 0.0, 10.0, 100, 150, '水晶虾需要软水弱酸，TDS和GH是关键指标。', 'https://www.2hraquarist.com/blogs/freshwater-fish-and-livestock/keeping-dwarf-shrimp-in-planted-tanks', NOW(), NOW()),
  ('profile-tanganyika', 'demo-aquarium-tanganyika', 23.0, 26.0, 7.8, 9.0, 0.0, 0.0, 25.0, 250, 400, '坦干伊克湖高硬高碱水，需要珊瑚砂或石灰石底材。', 'https://tanganyika.si', NOW(), NOW()),
  ('profile-malawi', 'demo-aquarium-malawi', 24.0, 27.0, 7.5, 8.5, 0.0, 0.0, 30.0, 200, 350, '马拉维湖高硬高碱水，与坦湖相近但略低。', 'https://aquariumscience.org/17-4-lake-malawi-cichlids/', NOW(), NOW()),
  ('profile-nano', 'demo-aquarium-nano-planted', 22.0, 26.0, 6.2, 7.0, 0.0, 0.0, 15.0, 80, 150, '小型草缸水质波动大，重点保持稳定。', 'https://tropica.com', NOW(), NOW()),
  ('profile-biotope', 'demo-aquarium-biotope', 24.0, 27.0, 5.5, 6.5, 0.0, 0.0, 15.0, 50, 100, '亚马逊黑水软水弱酸，榄仁叶释放单宁酸。', 'https://www.seriouslyfish.com', NOW(), NOW());

-- ============================================
-- 扩展投喂模板
-- ============================================

INSERT INTO "FeedingTemplate" (id, "aquariumId", "speciesId", food, amount, frequency, note, "createdAt", "updatedAt") VALUES
  ('feed-shrimp-cherry', 'demo-aquarium-cherry-shrimp', 'species-cherry-shrimp', '虾专用饲料/菠菜/胡萝卜', '每只虾可摄食量', '每日 1-2 次', '多样化食物保证营养均衡，蔬菜补充矿物质。', NOW(), NOW()),
  ('feed-shrimp-crystal', 'demo-aquarium-crystal-shrimp', 'species-crystal-red-shrimp', '水晶虾专用饲料', '2 分钟内吃完', '每日 1 次', '过量喂食会迅速败坏水质，少量多餐。', NOW(), NOW()),
  ('feed-tanga-carnivore', 'demo-aquarium-tanganyika', 'species-neolamprologus-brichardi', '丰年虾/红虫', '3 分钟内吃完', '每日 2 次', '肉食性慈鲷需要高蛋白食物。', NOW(), NOW()),
  ('feed-malawi-herbivore', 'demo-aquarium-malawi', 'species-labidochromis-caeruleus', '螺旋藻片/蔬菜', '3 分钟内吃完', '每日 2-3 次', 'Mbuna偏植食性，多喂蔬菜避免肠炎。', NOW(), NOW()),
  ('feed-nano-micro', 'demo-aquarium-nano-planted', 'species-chili-rasbora', '微型颗粒饲料', '1 分钟内吃完', '每日 2 次', '微型鱼嘴小，需要极小颗粒饲料。', NOW(), NOW()),
  ('feed-biotope-omnivore', 'demo-aquarium-biotope', 'species-rummy-nose', '小型薄片/冻红虫', '2 分钟内吃完', '每日 1-2 次', '野生鱼开口需要活食或冻食驯化。', NOW(), NOW());

-- ============================================
-- 扩展水质记录
-- ============================================

INSERT INTO "WaterQualityRecord" (id, "aquariumId", temperature, ph, ammonia, nitrite, nitrate, tds, note, "recordedAt", "createdAt", "updatedAt") VALUES
  -- 樱花虾缸
  ('demo-water-shrimp-001', 'demo-aquarium-cherry-shrimp', 22.5, 7.2, 0.0, 0.0, 5.0, 160, 'TDS 稳定，虾壳正常，观察到脱壳。', NOW() - INTERVAL '4 days', NOW(), NOW()),
  ('demo-water-shrimp-002', 'demo-aquarium-cherry-shrimp', 22.8, 7.1, 0.0, 0.0, 8.0, 165, '母虾抱卵数量增加，注意补钙。', NOW() - INTERVAL '1 day', NOW(), NOW()),

  -- 水晶虾缸
  ('demo-water-crystal-001', 'demo-aquarium-crystal-shrimp', 23.0, 6.2, 0.0, 0.0, 5.0, 130, 'TDS 略高，下次换水用更多纯水。', NOW() - INTERVAL '5 days', NOW(), NOW()),
  ('demo-water-crystal-002', 'demo-aquarium-crystal-shrimp', 23.2, 6.1, 0.0, 0.0, 8.0, 125, 'S级个体体色加深，继续保持。', NOW() - INTERVAL '2 days', NOW(), NOW()),

  -- 坦干伊克湖缸
  ('demo-water-tanga-001', 'demo-aquarium-tanganyika', 25.0, 8.2, 0.0, 0.0, 12.0, 320, 'KH 12，GH 16，符合坦湖硬水标准。', NOW() - INTERVAL '6 days', NOW(), NOW()),
  ('demo-water-tanga-002', 'demo-aquarium-tanganyika', 25.2, 8.3, 0.0, 0.0, 15.0, 325, '凤凰鱼在岩缝中护卵，减少惊扰。', NOW() - INTERVAL '2 days', NOW(), NOW()),

  -- 马拉维湖缸
  ('demo-water-malawi-001', 'demo-aquarium-malawi', 25.5, 8.0, 0.0, 0.0, 18.0, 280, '阿里攻击性增强，考虑重新调整岩石布局。', NOW() - INTERVAL '5 days', NOW(), NOW()),
  ('demo-water-malawi-002', 'demo-aquarium-malawi', 25.8, 8.1, 0.0, 0.0, 22.0, 290, '白嘴黄尾状态良好，多喂蔬菜。', NOW() - INTERVAL '1 day', NOW(), NOW()),

  -- 微型草缸
  ('demo-water-nano-001', 'demo-aquarium-nano-planted', 24.0, 6.5, 0.0, 0.0, 8.0, 110, 'CO2 注入后 pH 降至 6.3，鱼只状态正常。', NOW() - INTERVAL '4 days', NOW(), NOW()),
  ('demo-water-nano-002', 'demo-aquarium-nano-planted', 24.2, 6.6, 0.0, 0.0, 10.0, 115, '矮珍珠爬地良好，草缸状态稳定。', NOW() - INTERVAL '1 day', NOW(), NOW()),

  -- 原生缸
  ('demo-water-biotope-001', 'demo-aquarium-biotope', 26.0, 6.0, 0.0, 0.0, 5.0, 70, '黑水环境，单宁酸含量高，红鼻剪刀体色鲜艳。', NOW() - INTERVAL '5 days', NOW(), NOW()),
  ('demo-water-biotope-002', 'demo-aquarium-biotope', 26.2, 5.9, 0.0, 0.0, 8.0, 75, '添加新的榄仁叶，继续释放单宁酸。', NOW() - INTERVAL '1 day', NOW(), NOW());

-- ============================================
-- 扩展维护记录
-- ============================================

INSERT INTO "MaintenanceRecord" (id, "aquariumId", type, note, "imageUrl", "happenedAt", "createdAt", "updatedAt") VALUES
  -- 樱花虾缸
  ('demo-maint-shrimp-001', 'demo-aquarium-cherry-shrimp', '换水', 'RO水兑自来水调配TDS 150，换水30%。', NULL, NOW() - INTERVAL '6 days', NOW(), NOW()),
  ('demo-maint-shrimp-002', 'demo-aquarium-cherry-shrimp', '修剪水草', '修剪莫斯，保持造型并促进新芽生长。', NULL, NOW() - INTERVAL '2 days', NOW(), NOW()),

  -- 水晶虾缸
  ('demo-maint-crystal-001', 'demo-aquarium-crystal-shrimp', '换水', '纯水兑少量矿化液，TDS控制在130。', NULL, NOW() - INTERVAL '5 days', NOW(), NOW()),
  ('demo-maint-crystal-002', 'demo-aquarium-crystal-shrimp', '分拣虾', '分拣S级以上个体到展示缸，普通级到繁殖缸。', NULL, NOW() - INTERVAL '10 days', NOW(), NOW()),

  -- 坦干伊克湖缸
  ('demo-maint-tanga-001', 'demo-aquarium-tanganyika', '调整造景', '重新堆叠岩石，增加凤凰鱼专属岩缝。', NULL, NOW() - INTERVAL '8 days', NOW(), NOW()),
  ('demo-maint-tanga-002', 'demo-aquarium-tanganyika', '添加鱼只', '新增4只布氏新亮丽鲷亚成体，入缸前隔离两周。', NULL, NOW() - INTERVAL '15 days', NOW(), NOW()),

  -- 马拉维湖缸
  ('demo-maint-malawi-001', 'demo-aquarium-malawi', '换水', '换水40%，使用珊瑚砂提高KH。', NULL, NOW() - INTERVAL '7 days', NOW(), NOW()),
  ('demo-maint-malawi-002', 'demo-aquarium-malawi', '调整鱼只', '转移攻击性过强的阿里个体到隔离缸。', NULL, NOW() - INTERVAL '3 days', NOW(), NOW()),

  -- 微型草缸
  ('demo-maint-nano-001', 'demo-aquarium-nano-planted', '换水', '换水50%，配合添加水草液肥。', NULL, NOW() - INTERVAL '5 days', NOW(), NOW()),
  ('demo-maint-nano-002', 'demo-aquarium-nano-planted', '修剪水草', '修剪矮珍珠边缘，促进横向爬地。', NULL, NOW() - INTERVAL '2 days', NOW(), NOW()),

  -- 原生缸
  ('demo-maint-biotope-001', 'demo-aquarium-biotope', '添加造景材', '添加沉木和榄仁叶，增强黑水效果。', NULL, NOW() - INTERVAL '10 days', NOW(), NOW()),
  ('demo-maint-biotope-002', 'demo-aquarium-biotope', '换水', '换水30%，补充榄仁叶单宁酸。', NULL, NOW() - INTERVAL '4 days', NOW(), NOW());

-- ============================================
-- 扩展提醒
-- ============================================

INSERT INTO "Reminder" (id, "userId", "aquariumId", title, note, "dueAt", "repeatRule", status, "createdAt", "updatedAt") VALUES
  ('demo-reminder-shrimp-001', 'demo-user-001', 'demo-aquarium-cherry-shrimp', '樱花虾缸换水', '每周换水20-30%，TDS控制在150-200。', NOW() + INTERVAL '3 days', 'weekly', 'PENDING', NOW(), NOW()),
  ('demo-reminder-shrimp-002', 'demo-user-001', 'demo-aquarium-crystal-shrimp', '水晶虾TDS检测', 'TDS超过150需要换纯水调整。', NOW() + INTERVAL '2 days', 'weekly', 'PENDING', NOW(), NOW()),
  ('demo-reminder-tanga-001', 'demo-user-001', 'demo-aquarium-tanganyika', '坦湖慈鲷喂食', '布氏凤凰每日两次丰年虾，少量多餐。', NOW() + INTERVAL '1 day', 'daily', 'PENDING', NOW(), NOW()),
  ('demo-reminder-malawi-001', 'demo-user-001', 'demo-aquarium-malawi', '马拉维湖缸换水', '每周换水30-40%，保持高硬度。', NOW() + INTERVAL '4 days', 'weekly', 'PENDING', NOW(), NOW()),
  ('demo-reminder-nano-001', 'demo-user-001', 'demo-aquarium-nano-planted', '微型缸CO2检查', '检查CO2余量和减压阀，确保正常工作。', NOW() + INTERVAL '5 days', 'weekly', 'PENDING', NOW(), NOW()),
  ('demo-reminder-biotope-001', 'demo-user-001', 'demo-aquarium-biotope', '原生缸补充榄仁叶', '榄仁叶分解后需要补充，保持黑水效果。', NOW() + INTERVAL '6 days', NULL, 'PENDING', NOW(), NOW());

-- ============================================
-- 扩展知识库文章
-- ============================================

INSERT INTO "KnowledgeArticle" (id, title, category, summary, content, "createdAt", "updatedAt") VALUES
  (
    'demo-knowledge-005',
    '观赏虾入门指南',
    '虾类',
    '樱花虾、水晶虾等常见观赏虾的饲养要点。',
    '## 观赏虾入门指南\n\n### 樱花虾（Neocaridina davidi）\n\n- **难度**: 简单\n- **温度**: 15-28°C\n- **pH**: 6.5-8.0\n- **TDS**: 120-250\n- **GH**: 4-14 dGH\n\n樱花虾是最入门的观赏虾，适应性强，繁殖快。纯虾缸饲养最佳，避免与小型鱼混养导致幼虾被吃。\n\n### 水晶虾（Caridina cantonensis）\n\n- **难度**: 困难\n- **温度**: 18-26°C\n- **pH**: 5.5-7.0\n- **TDS**: 100-200\n- **GH**: 4-6 dGH\n\n水晶虾需要软水弱酸和稳定水质，TDS和GH是关键指标。建议使用RO水调配，配备专业设备。\n\n### 虾缸设备\n\n- 海绵过滤器或水妖精（不会吸走幼虾）\n- 活性炭吸附重金属\n- 避免含铜的药物和肥料\n- 充足的躲避处（莫斯、水榕）\n\n### 喂食\n\n- 虾专用饲料为主\n- 蔬菜补充（菠菜、胡萝卜）\n- 少量多餐，避免残饵败坏水质\n\n### 繁殖\n\n- 成熟雌虾背部可见黄色"鞍"\n- 脱壳后交配，抱卵约30天\n- 幼虾直接孵化为小型虾',
    NOW(),
    NOW()
  ),
  (
    'demo-knowledge-006',
    '三湖慈鲷饲养指南',
    '慈鲷',
    '坦干伊克湖和马拉维湖慈鲷的特点和饲养要点。',
    '## 三湖慈鲷饲养指南\n\n### 坦干伊克湖慈鲷\n\n**水质要求**:\n- 温度: 23-27°C\n- pH: 7.8-9.0\n- GH/KH: 高硬水（10-20 dGH）\n- TDS: 250-400\n\n**常见种类**:\n- **布氏新亮丽鲷** (Neolamprologus brichardi): 社会性强，幼鱼协助照顾后代\n- **亮丽鲷** (Neolamprologus pulcher): 最入门的坦湖鱼\n- **黄宽带凤凰** (Julidochromis spp.): 喜欢岩缝生活\n- **六间** (Cyphotilapia frontosa): 大型深水慈鲷\n\n**造景**:\n- 大量岩石堆叠，形成岩缝和洞穴\n- 细砂底床（部分种类会挖掘）\n- 不需要太多水草\n\n### 马拉维湖慈鲷\n\n**水质要求**:\n- 温度: 24-28°C\n- pH: 7.5-8.5\n- GH/KH: 高硬水\n- TDS: 200-350\n\n**常见种类**:\n- **非洲王子** (Labidochromis caeruleus): 最入门的马湖鱼\n- **阿里** (Melanochromis auratus): 攻击性强\n- **白嘴黄尾** (Pseudotropheus acei): 偏植食性\n\n**造景**:\n- 岩石堆叠为主\n- 保证足够的躲避空间\n- 可少量添加硬质水草\n\n### 饲养要点\n\n1. **一雄多雌**: 减少雄鱼间争斗\n2. **足够空间**: 慈鲷领地意识强\n3. **强过滤**: 排泄量大，需要强硝化系统\n4. **合理喂食**: 肉食性和植食性分开搭配',
    NOW(),
    NOW()
  ),
  (
    'demo-knowledge-007',
    '草缸入门指南',
    '草缸',
    '水草缸的基础知识、设备和维护。',
    '## 草缸入门指南\n\n### 设备清单\n\n1. **灯具**: LED水草灯或T5HO，光强按水草需求\n2. **CO2**: 钢瓶或发生器，大多数水草必需\n3. **过滤**: 外置过滤桶，生化滤材为主\n4. **底床**: ADA泥或陶粒，提供根系营养\n5. **肥料**: 液肥、根肥、钾肥等\n\n### 水草选择\n\n**阴性草（无CO2可养）**:\n- 水榕（Anubias）\n- 莫斯（Vesicularia）\n- 大水兰（Vallisneria）\n\n**阳性草（需要CO2）**:\n- 矮珍珠（Hemianthus callitrichoides）\n- 太阳草（Eusteralis stellata）\n- 辣椒草（Cryptocoryne）\n\n### 维护要点\n\n1. **换水**: 每周30-50%\n2. **修剪**: 定期修剪过长的水草\n3. **施肥**: 根据水草生长情况调整\n4. **控藻**: 控制光照时间和营养平衡\n5. **CO2**: 开灯前1小时开启，关灯前1小时关闭\n\n### 常见问题\n\n- **藻类爆发**: 减少光照、添加黑壳虾/小精灵\n- **水草融化**: 水质突变，检查换水和CO2\n- **生长缓慢**: 增加光照、CO2和肥料',
    NOW(),
    NOW()
  ),
  (
    'demo-knowledge-008',
    '小型观赏鱼混养表',
    '混养',
    '常见小型热带鱼的混养兼容性参考。',
    '## 小型观赏鱼混养表\n\n### 可混养组合\n\n| 鱼种 | 可混养 | 注意事项 |\n| --- | --- | --- |\n| 红绿灯鱼 | 灯科鱼、鼠鱼、异型 | 避免与攻击性鱼类 |\n| 孔雀鱼 | 卵胎生鱼、小型灯鱼 | 繁殖快，注意密度 |\n| 斗鱼 | 螺类、小型底栖鱼 | 单养最佳，避免同科 |\n| 鼠鱼 | 灯科鱼、卵胎生鱼 | 6只以上群养 |\n| 樱花虾 | 微型鱼、螺类 | 避免与吃虾鱼类 |\n\n### 不建议混养\n\n- **斗鱼 + 孔雀鱼**: 斗鱼可能攻击孔雀鱼\n- **金鱼 + 热带鱼**: 水温需求不同\n- **大型慈鲷 + 小型鱼**: 小型鱼会被捕食\n- **攻击性慈鲷 + 性格温和鱼类**\n\n### 混养原则\n\n1. **水温重叠**: 确保所有鱼类温度范围重叠\n2. **pH兼容**: 避免极端差异\n3. **水层互补**: 上中下水层搭配\n4. **性格匹配**: 攻击性鱼需要足够空间\n5. **成鱼体型**: 考虑最大体型而非购买时大小',
    NOW(),
    NOW()
  );
