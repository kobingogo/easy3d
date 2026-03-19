# Blender 3D Model Optimizer V1.0

AI-powered 3D model optimization service for easy3d project.

## 🚀 快速开始

### 前置要求

1. **Blender 3.0+** 已安装
   - macOS: `/Applications/Blender.app/Contents/MacOS/Blender`
   - Linux: `/usr/bin/blender`
   - Windows: `C:\Program Files\Blender Foundation\Blender\blender.exe`

2. **Python 3.8+** 已安装

### 安装

```bash
# 1. 进入目录
cd blender-optimizer

# 2. 安装依赖
pip install -r requirements.txt

# 3. 设置 Blender 路径（如果需要）
export BLENDER_BIN="/Applications/Blender.app/Contents/MacOS/Blender"

# 4. 启动服务
uvicorn server.main:app --reload --port 8000
```

### 验证安装

```bash
# 健康检查
curl http://localhost:8000/health

# 预期输出:
# {"status":"healthy","blender":"/Applications/...","blender_exists":true}
```

---

## 📖 API 使用

### 1. 优化 3D 模型

```bash
# 上传模型并优化
curl -X POST http://localhost:8000/api/optimize \
  -F "file=@model.glb" \
  -F 'options={"smooth_mesh":true,"smooth_iterations":2}'

# 响应:
# {
#   "task_id": "abc-123-def",
#   "status": "pending",
#   "created_at": "2026-03-19T19:00:00"
# }
```

### 2. 查询任务状态

```bash
curl http://localhost:8000/api/tasks/abc-123-def

# 响应:
# {
#   "task_id": "abc-123-def",
#   "status": "completed",
#   "output_url": "/api/downloads/abc-123-def",
#   "created_at": "2026-03-19T19:00:00",
#   "completed_at": "2026-03-19T19:02:00"
# }
```

### 3. 下载优化后的模型

```bash
curl -O http://localhost:8000/api/downloads/abc-123-def
```

### 4. 高质量渲染

```bash
curl -X POST http://localhost:8000/api/render \
  -F "file=@model.glb" \
  -F 'options={"samples":128,"resolution":1024}'
```

---

## 🛠️ 优化选项

### 网格平滑

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `smooth_mesh` | bool | true | 是否启用平滑 |
| `smooth_iterations` | int | 2 | 细分迭代次数 (1-3) |
| `smooth_strength` | float | 0.5 | 平滑强度 (0-1) |

### 材质增强

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enhance_materials` | bool | true | 是否增强材质 |
| `material_type` | string | "auto" | 材质类型 (auto/metal/fabric/plastic/glass) |

### 渲染设置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `render` | bool | false | 是否渲染输出 |
| `render_samples` | int | 128 | 采样数 (64-256) |
| `render_resolution` | int | 1024 | 输出分辨率 |

---

## 💻 前端调用示例

### TypeScript/JavaScript

```typescript
// lib/blender-optimizer.ts

interface OptimizeOptions {
  smooth_mesh?: boolean;
  smooth_iterations?: number;
  smooth_strength?: number;
  enhance_materials?: boolean;
  material_type?: string;
}

interface TaskStatus {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  output_url?: string;
  error?: string;
}

export async function optimizeModel(
  file: File,
  options: OptimizeOptions = {}
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('options', JSON.stringify(options));
  
  const response = await fetch('http://localhost:8000/api/optimize', {
    method: 'POST',
    body: formData,
  });
  
  const { task_id } = await response.json();
  return task_id;
}

export async function pollTaskStatus(taskId: string): Promise<TaskStatus> {
  const response = await fetch(`http://localhost:8000/api/tasks/${taskId}`);
  return response.json();
}

export async function waitForCompletion(
  taskId: string,
  intervalMs: number = 2000,
  timeoutMs: number = 300000
): Promise<TaskStatus> {
  const startTime = Date.now();
  
  while (true) {
    const status = await pollTaskStatus(taskId);
    
    if (status.status === 'completed' || status.status === 'failed') {
      return status;
    }
    
    if (Date.now() - startTime > timeoutMs) {
      throw new Error('Task timeout');
    }
    
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
}

export async function downloadOptimizedModel(taskId: string): Promise<Blob> {
  const response = await fetch(`http://localhost:8000/api/downloads/${taskId}`);
  return response.blob();
}

// 使用示例
async function example() {
  const file = document.querySelector('input[type=file]').files[0];
  
  // 提交优化任务
  const taskId = await optimizeModel(file, {
    smooth_mesh: true,
    smooth_iterations: 2,
    enhance_materials: true,
  });
  
  // 等待完成
  const status = await waitForCompletion(taskId);
  
  if (status.status === 'completed') {
    // 下载优化后的模型
    const blob = await downloadOptimizedModel(taskId);
    const url = URL.createObjectURL(blob);
    
    // 在 3D 查看器中加载
    loadModel(url);
  } else {
    console.error('优化失败:', status.error);
  }
}
```

### React 组件

```tsx
// components/ModelOptimizer.tsx

import { useState } from 'react';
import { optimizeModel, waitForCompletion, downloadOptimizedModel } from '@/lib/blender-optimizer';

export function ModelOptimizer() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const handleOptimize = async (file: File) => {
    try {
      setStatus('uploading');
      setProgress(0);
      
      // 提交任务
      const taskId = await optimizeModel(file, {
        smooth_mesh: true,
        smooth_iterations: 2,
        enhance_materials: true,
      });
      
      setStatus('processing');
      setProgress(30);
      
      // 轮询状态
      const result = await waitForCompletion(taskId, 2000, 300000);
      setProgress(90);
      
      if (result.status === 'completed') {
        // 下载结果
        const blob = await downloadOptimizedModel(taskId);
        setProgress(100);
        setStatus('completed');
        
        // 触发自定义事件或回调
        window.dispatchEvent(new CustomEvent('model-optimized', { detail: { blob } }));
      } else {
        setStatus('failed');
        setError(result.error || '优化失败');
      }
    } catch (err) {
      setStatus('failed');
      setError(err.message);
    }
  };
  
  return (
    <div className="optimizer">
      <input
        type="file"
        accept=".glb,.gltf,.obj,.fbx"
        onChange={(e) => e.target.files[0] && handleOptimize(e.target.files[0])}
        disabled={status === 'processing'}
      />
      
      {status === 'processing' && (
        <div className="progress">
          <div className="bar" style={{ width: `${progress}%` }} />
          <span>正在优化... {progress}%</span>
        </div>
      )}
      
      {status === 'completed' && (
        <div className="success">✅ 优化完成!</div>
      )}
      
      {status === 'failed' && (
        <div className="error">❌ {error}</div>
      )}
    </div>
  );
}
```

---

## 🐳 Docker 部署

### Dockerfile

```dockerfile
FROM python:3.11-slim

# 安装 Blender
RUN apt-get update && apt-get install -y \
    wget \
    libxrender1 \
    libxi6 \
    libxkbcommon0 \
    && rm -rf /var/lib/apt/lists/*

# 下载并安装 Blender
RUN wget https://download.blender.org/release/Blender3.6/blender-3.6.5-linux-x64.tar.xz \
    && tar -xf blender-3.6.5-linux-x64.tar.xz \
    && mv blender-3.6.5-linux-x64 /opt/blender \
    && ln -s /opt/blender/blender /usr/bin/blender

WORKDIR /app

# 安装 Python 依赖
COPY requirements.txt .
RUN pip install -r requirements.txt

# 复制代码
COPY scripts/ ./scripts/
COPY server/ ./server/

EXPOSE 8000

CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 运行

```bash
# 构建镜像
docker build -t blender-optimizer .

# 运行容器
docker run -p 8000:8000 blender-optimizer

# 或使用 docker-compose
docker-compose up -d
```

---

## 📊 性能基准

| 操作 | 模型大小 | 处理时间 | 内存占用 |
|------|----------|----------|----------|
| 网格平滑 | 10k faces | 30 秒 | 500MB |
| 材质增强 | 10k faces | 10 秒 | 300MB |
| 高质量渲染 | 10k faces | 2 分钟 | 1GB |
| 完整优化 | 10k faces | 3 分钟 | 1.5GB |

---

## ⚠️ 注意事项

1. **超时设置**: 默认 5 分钟超时，大模型可能需要更长时间
2. **并发限制**: 建议限制并发任务数（Blender 资源占用高）
3. **磁盘清理**: 定期清理 `/tmp/blender-optimizer` 目录
4. **GPU 加速**: 如果有 GPU，设置 `render_device='GPU'`

---

## 🔧 故障排查

### Blender 找不到

```bash
# 检查 Blender 路径
which blender

# 或设置环境变量
export BLENDER_BIN="/path/to/blender"
```

### 任务一直 pending

```bash
# 检查服务日志
tail -f /tmp/blender-optimizer/*.log

# 检查 Blender 版本
blender --version
```

### 内存不足

```bash
# 限制并发任务数
# 在 server/main.py 中调整
MAX_CONCURRENT_TASKS = 2
```

---

## 📝 待办事项

- [ ] Redis 任务队列（生产环境）
- [ ] 材质识别 AI 集成
- [ ] 批量优化支持
- [ ] Web 管理界面
- [ ] 性能监控和告警

---

## 📄 License

MIT
