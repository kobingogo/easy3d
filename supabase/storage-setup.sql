-- Supabase Storage Buckets Setup
-- 在 Supabase Dashboard -> SQL Editor 中运行此脚本

-- 创建存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('original-images', 'original-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('3d-models', '3d-models', true, 52428800, ARRAY['model/gltf-binary', 'application/octet-stream'])
ON CONFLICT (id) DO NOTHING;

-- 设置公开访问策略
CREATE POLICY "Public Access for original-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'original-images');

CREATE POLICY "Public Access for 3d-models"
ON storage.objects FOR SELECT
USING (bucket_id = '3d-models');

-- 允许上传（生产环境应该限制只有认证用户）
CREATE POLICY "Allow uploads to original-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'original-images');

CREATE POLICY "Allow uploads to 3d-models"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = '3d-models');