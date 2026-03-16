-- Models 表结构
-- 在 Supabase Dashboard -> SQL Editor 中运行

CREATE TABLE IF NOT EXISTS public.models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,
  trip_task_id TEXT,
  model_3d_url TEXT,
  thumbnail_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  quality VARCHAR(20) DEFAULT 'standard',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

-- 公开读取策略（开发环境，生产环境应限制）
CREATE POLICY "Public read access"
ON public.models FOR SELECT
USING (true);

-- 公开写入策略（开发环境，生产环境应限制为认证用户）
CREATE POLICY "Public write access"
ON public.models FOR ALL
USING (true);

-- 索引
CREATE INDEX IF NOT EXISTS idx_models_user_id ON public.models(user_id);
CREATE INDEX IF NOT EXISTS idx_models_status ON public.models(status);
CREATE INDEX IF NOT EXISTS idx_models_created_at ON public.models(created_at DESC);

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_models_updated_at
BEFORE UPDATE ON public.models
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();