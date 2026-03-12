#!/bin/bash

# Easy3D 停止脚本
# 停止所有服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 项目目录
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="$PROJECT_DIR/.easy3d-pids"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Easy3D 服务停止脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 停止 Next.js
echo -e "${YELLOW}停止 Next.js 开发服务器...${NC}"
if pgrep -f "next dev" > /dev/null; then
    pkill -f "next dev" 2>/dev/null || true
    echo -e "${GREEN}✓ Next.js 已停止${NC}"
else
    echo "  Next.js 未运行"
fi

# 停止 Qdrant
echo -e "${YELLOW}停止 Qdrant 容器...${NC}"
if docker ps | grep -q easy3d-qdrant; then
    cd "$PROJECT_DIR"
    docker compose down 2>/dev/null || true
    echo -e "${GREEN}✓ Qdrant 已停止${NC}"
else
    echo "  Qdrant 未运行"
fi

# 清理 PID 文件
if [ -f "$PID_FILE" ]; then
    rm -f "$PID_FILE"
fi

echo ""
echo -e "${GREEN}所有服务已停止${NC}"