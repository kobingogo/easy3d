# Blender 优化服务 - FastAPI V1.0
# 启动：uvicorn server.main:app --reload --port 8000

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import subprocess
import uuid
import os
import json
import shutil
from pathlib import Path
from datetime import datetime
import asyncio

app = FastAPI(
    title="Blender 3D Model Optimizer",
    description="AI-powered 3D model optimization service",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境要限制
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 配置
BLENDER_BIN = os.getenv(
    "BLENDER_BIN",
    "/Applications/Blender.app/Contents/MacOS/Blender"  # macOS 默认路径
)
# Linux: /usr/bin/blender
# Windows: C:\Program Files\Blender Foundation\Blender\blender.exe

WORK_DIR = Path("/tmp/blender-optimizer")
WORK_DIR.mkdir(parents=True, exist_ok=True)

# 任务状态存储（生产环境用 Redis）
tasks: Dict[str, Dict[str, Any]] = {}


class OptimizeOptions(BaseModel):
    """优化选项"""
    smooth_mesh: bool = True
    smooth_iterations: int = 2
    smooth_strength: float = 0.5
    enhance_materials: bool = True
    material_type: str = "auto"  # auto/metal/fabric/plastic/glass
    cleanup: bool = True
    apply_modifiers: bool = True
    render: bool = False
    render_samples: int = 128
    render_resolution: int = 1024


class RenderOptions(BaseModel):
    """渲染选项"""
    samples: int = 128
    resolution: int = 1024
    hdri: Optional[str] = None
    format: str = "png"  # png/jpg


class TaskResponse(BaseModel):
    """任务响应"""
    task_id: str
    status: str  # pending/processing/completed/failed
    output_url: Optional[str] = None
    error: Optional[str] = None
    created_at: str
    completed_at: Optional[str] = None


def get_blender_path() -> str:
    """获取 Blender 可执行文件路径"""
    # 检查环境变量
    if os.getenv("BLENDER_BIN"):
        return os.getenv("BLENDER_BIN")
    
    # 检查常见路径
    paths = [
        "/Applications/Blender.app/Contents/MacOS/Blender",  # macOS
        "/usr/bin/blender",  # Linux
        "/snap/bin/blender",  # Linux Snap
        "C:\\Program Files\\Blender Foundation\\Blender\\blender.exe",  # Windows
    ]
    
    for path in paths:
        if os.path.exists(path):
            return path
    
    # 尝试从 PATH 查找
    blender = shutil.which("blender")
    if blender:
        return blender
    
    raise RuntimeError(
        "Blender not found. Please set BLENDER_BIN environment variable "
        "or install Blender to a standard location."
    )


async def run_blender_task(task_id: str, script: str, args: list):
    """异步运行 Blender 任务"""
    try:
        tasks[task_id]["status"] = "processing"
        
        blender = get_blender_path()
        cmd = [
            blender,
            "--background",
            "--python", script,
            "--",
            *args
        ]
        
        print(f"[Task {task_id}] Running: {' '.join(cmd)}")
        
        # 运行 Blender（超时 5 分钟）
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await asyncio.wait_for(
            process.communicate(),
            timeout=300  # 5 分钟超时
        )
        
        if process.returncode != 0:
            error_msg = stderr.decode('utf-8', errors='ignore')
            print(f"[Task {task_id}] Error: {error_msg}")
            tasks[task_id]["status"] = "failed"
            tasks[task_id]["error"] = error_msg
            tasks[task_id]["completed_at"] = datetime.now().isoformat()
            return
        
        # 解析输出
        output = stdout.decode('utf-8', errors='ignore')
        print(f"[Task {task_id}] Output: {output}")
        
        # 提取 JSON 结果
        for line in output.split('\n'):
            if line.strip().startswith('{'):
                try:
                    result = json.loads(line)
                    if result.get("status") == "success":
                        tasks[task_id]["status"] = "completed"
                        tasks[task_id]["result"] = result
                    else:
                        tasks[task_id]["status"] = "failed"
                        tasks[task_id]["error"] = result.get("error", "Unknown error")
                    break
                except json.JSONDecodeError:
                    continue
        
        tasks[task_id]["completed_at"] = datetime.now().isoformat()
        print(f"[Task {task_id}] Completed: {tasks[task_id]['status']}")
    
    except asyncio.TimeoutError:
        print(f"[Task {task_id}] Timeout")
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = "Task timeout (5 minutes)"
        tasks[task_id]["completed_at"] = datetime.now().isoformat()
    
    except Exception as e:
        print(f"[Task {task_id}] Exception: {str(e)}")
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)
        tasks[task_id]["completed_at"] = datetime.now().isoformat()


@app.get("/")
async def root():
    """健康检查"""
    return {
        "service": "Blender Optimizer",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    try:
        blender = get_blender_path()
        return {
            "status": "healthy",
            "blender": blender,
            "blender_exists": os.path.exists(blender)
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


@app.post("/api/optimize", response_model=TaskResponse)
async def optimize_model(
    file: UploadFile = File(..., description="3D model file (GLB/GLTF/OBJ/FBX)"),
    options: OptimizeOptions = None,
    background_tasks: BackgroundTasks = None
):
    """
    优化 3D 模型
    
    - 网格平滑
    - 材质增强
    - 高质量渲染
    """
    # 验证文件
    allowed_extensions = ['.glb', '.gltf', '.obj', '.fbx']
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # 生成任务 ID
    task_id = str(uuid.uuid4())
    
    # 保存上传文件
    input_path = WORK_DIR / f"{task_id}_input{file_ext}"
    output_ext = ".glb"  # 默认输出 GLB
    output_path = WORK_DIR / f"{task_id}_output{output_ext}"
    
    with open(input_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    # 创建任务记录
    tasks[task_id] = {
        "task_id": task_id,
        "status": "pending",
        "input_file": str(input_path),
        "output_file": str(output_path),
        "created_at": datetime.now().isoformat(),
        "completed_at": None,
        "error": None,
        "result": None
    }
    
    # 准备选项
    options_dict = options.dict() if options else {}
    
    # 启动后台任务
    script_path = Path(__file__).parent.parent / "scripts" / "optimize_model.py"
    args = [
        str(input_path),
        str(output_path),
        json.dumps(options_dict)
    ]
    
    background_tasks.add_task(run_blender_task, task_id, str(script_path), args)
    
    return TaskResponse(
        task_id=task_id,
        status="pending",
        created_at=tasks[task_id]["created_at"]
    )


@app.post("/api/render", response_model=TaskResponse)
async def render_beauty(
    file: UploadFile = File(..., description="3D model file"),
    options: RenderOptions = None,
    background_tasks: BackgroundTasks = None
):
    """
    高质量渲染 3D 模型
    """
    # 验证文件
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ['.glb', '.gltf', '.obj', '.fbx']:
        raise HTTPException(status_code=400, detail="Unsupported file format")
    
    # 生成任务 ID
    task_id = str(uuid.uuid4())
    
    # 保存上传文件
    input_path = WORK_DIR / f"{task_id}_input{file_ext}"
    output_ext = ".png" if (options and options.format == "png") else ".jpg"
    output_path = WORK_DIR / f"{task_id}_render{output_ext}"
    
    with open(input_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    # 创建任务记录
    tasks[task_id] = {
        "task_id": task_id,
        "status": "pending",
        "input_file": str(input_path),
        "output_file": str(output_path),
        "created_at": datetime.now().isoformat(),
        "completed_at": None,
        "error": None,
        "result": None
    }
    
    # 准备选项
    options_dict = options.dict() if options else {}
    options_dict["render"] = True
    
    # 启动后台任务
    script_path = Path(__file__).parent.parent / "scripts" / "optimize_model.py"
    args = [
        str(input_path),
        str(output_path),
        json.dumps(options_dict)
    ]
    
    background_tasks.add_task(run_blender_task, task_id, str(script_path), args)
    
    return TaskResponse(
        task_id=task_id,
        status="pending",
        created_at=tasks[task_id]["created_at"]
    )


@app.get("/api/tasks/{task_id}", response_model=TaskResponse)
async def get_task_status(task_id: str):
    """查询任务状态"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = tasks[task_id]
    
    response = TaskResponse(
        task_id=task["task_id"],
        status=task["status"],
        created_at=task["created_at"],
        completed_at=task["completed_at"],
        error=task.get("error")
    )
    
    # 如果完成，添加输出 URL
    if task["status"] == "completed" and task.get("output_file"):
        response.output_url = f"/api/downloads/{task_id}"
    
    return response


@app.get("/api/downloads/{task_id}")
async def download_output(task_id: str):
    """下载优化后的文件"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = tasks[task_id]
    
    if task["status"] != "completed":
        raise HTTPException(status_code=400, detail="Task not completed")
    
    output_path = Path(task["output_file"])
    
    if not output_path.exists():
        raise HTTPException(status_code=404, detail="Output file not found")
    
    # 根据扩展名设置 MIME 类型
    file_ext = output_path.suffix.lower()
    media_type = {
        ".glb": "model/gltf-binary",
        ".gltf": "model/gltf+json",
        ".obj": "application/octet-stream",
        ".fbx": "application/octet-stream",
        ".png": "image/png",
        ".jpg": "image/jpeg",
    }.get(file_ext, "application/octet-stream")
    
    return FileResponse(
        path=str(output_path),
        media_type=media_type,
        filename=output_path.name
    )


@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str):
    """删除任务"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = tasks[task_id]
    
    # 清理文件
    for path in [task.get("input_file"), task.get("output_file")]:
        if path and os.path.exists(path):
            os.remove(path)
    
    del tasks[task_id]
    
    return {"status": "deleted", "task_id": task_id}


@app.get("/api/tasks")
async def list_tasks(limit: int = 50):
    """列出最近的任务"""
    sorted_tasks = sorted(
        tasks.values(),
        key=lambda x: x["created_at"],
        reverse=True
    )
    
    return {
        "tasks": [
            {
                "task_id": t["task_id"],
                "status": t["status"],
                "created_at": t["created_at"],
                "completed_at": t.get("completed_at")
            }
            for t in sorted_tasks[:limit]
        ],
        "total": len(tasks)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
