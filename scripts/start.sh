#!/bin/bash

# Easy3D 一键启动脚本
# 启动 Next.js 开发服务器
# 注：使用 Qdrant Cloud，无需本地 Docker

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目目录
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="/tmp/easy3d-logs"
PID_FILE="$PROJECT_DIR/.easy3d-pids"

# 创建日志目录
mkdir -p "$LOG_DIR"

# 打印标题
print_title() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}   Easy3D 服务启动脚本${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# 检查环境变量
check_env() {
    echo -e "${YELLOW}[1/3] 检查环境配置...${NC}"

    if [ ! -f "$PROJECT_DIR/.env.local" ]; then
        echo -e "${RED}错误: .env.local 文件不存在${NC}"
        echo "请复制 .env.local.example 并填入配置："
        echo "  cp .env.local.example .env.local"
        exit 1
    fi

    # 检查必要的 API Keys
    local missing_keys=()

    if ! grep -q "DASHSCOPE_API_KEY_V1=." "$PROJECT_DIR/.env.local" 2>/dev/null; then
        missing_keys+=("DASHSCOPE_API_KEY_V1")
    fi

    if ! grep -q "QDRANT_URL=." "$PROJECT_DIR/.env.local" 2>/dev/null; then
        missing_keys+=("QDRANT_URL")
    fi

    if ! grep -q "QDRANT_API_KEY=." "$PROJECT_DIR/.env.local" 2>/dev/null; then
        missing_keys+=("QDRANT_API_KEY")
    fi

    if [ ${#missing_keys[@]} -gt 0 ]; then
        echo -e "${RED}错误: 以下配置缺失:${NC}"
        for key in "${missing_keys[@]}"; do
            echo "  - $key"
        done
        exit 1
    fi

    echo -e "${GREEN}✓ 环境配置检查通过${NC}"
    echo -e "  - DashScope V1 API (embedding + qwen-plus)"
    echo -e "  - Qdrant Cloud (向量数据库)"
    echo ""
}

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        return 0  # 端口被占用
    fi
    return 1  # 端口空闲
}

# 停止已有服务
stop_existing() {
    echo -e "${YELLOW}[2/3] 检查并停止已有服务...${NC}"

    # 停止 Next.js
    if pgrep -f "next dev" > /dev/null; then
        echo "  停止 Next.js 开发服务器..."
        pkill -f "next dev" 2>/dev/null || true
        sleep 2
    fi

    # 读取 PID 文件并停止
    if [ -f "$PID_FILE" ]; then
        while read pid; do
            if kill -0 $pid 2>/dev/null; then
                kill $pid 2>/dev/null || true
            fi
        done < "$PID_FILE"
        rm -f "$PID_FILE"
    fi

    echo -e "${GREEN}✓ 已停止现有服务${NC}"
    echo ""
}

# 启动 Next.js
start_nextjs() {
    echo -e "${YELLOW}[3/3] 启动 Next.js 开发服务器...${NC}"

    cd "$PROJECT_DIR"

    # 检查端口
    if check_port 3000; then
        echo -e "${YELLOW}⚠ 端口 3000 已被占用，尝试其他端口...${NC}"
    fi

    # 启动服务
    echo "  启动中..."
    nohup npm run dev > "$LOG_DIR/nextjs.log" 2>&1 &
    echo $! >> "$PID_FILE"

    # 等待启动
    sleep 3

    # 检查是否启动成功
    if pgrep -f "next dev" > /dev/null; then
        echo -e "${GREEN}✓ Next.js 启动成功${NC}"
        echo ""
        echo -e "${BLUE}========================================${NC}"
        echo -e "${GREEN}   服务已就绪！${NC}"
        echo -e "${BLUE}========================================${NC}"
        echo ""
        echo -e "访问地址："
        echo -e "  ${GREEN}首页:${NC}         http://localhost:3000"
        echo -e "  ${GREEN}3D 生成:${NC}      http://localhost:3000/generate"
        echo -e "  ${GREEN}Agent 控制台:${NC}  http://localhost:3000/agent"
        echo -e "  ${GREEN}RAG 知识库:${NC}   http://localhost:3000/knowledge"
        echo -e "  ${GREEN}Prompt 优化:${NC}  http://localhost:3000/fine-tune"
        echo ""
        echo -e "服务状态："
        echo -e "  日志目录: $LOG_DIR"
        echo -e "  停止服务: ./scripts/stop.sh"
        echo ""
    else
        echo -e "${RED}✗ Next.js 启动失败${NC}"
        echo "  查看日志: cat $LOG_DIR/nextjs.log"
        exit 1
    fi
}

# 主流程
main() {
    print_title
    check_env
    stop_existing
    start_nextjs
}

# 运行
main "$@"