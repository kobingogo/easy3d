#!/bin/bash
# Blender Optimizer 快速启动脚本

set -e

echo "🚀 Blender Optimizer V1.0"
echo "========================="

# 检查 Blender
if ! command -v blender &> /dev/null; then
    if [ ! -f "/Applications/Blender.app/Contents/MacOS/Blender" ]; then
        echo "❌ Blender 未安装"
        echo "请下载安装：https://www.blender.org/download/"
        exit 1
    fi
    export BLENDER_BIN="/Applications/Blender.app/Contents/MacOS/Blender"
fi

echo "✅ Blender: $(blender --version 2>&1 | head -1)"

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "📦 创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
echo "📦 安装依赖..."
pip install -q -r requirements.txt

# 启动服务
echo "🚀 启动服务..."
echo "API 文档：http://localhost:8000/docs"
echo ""

uvicorn server.main:app --reload --port 8000
