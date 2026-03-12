#!/bin/bash

# Easy3D 一键启动脚本
# 启动所有必需服务：Qdrant、Next.js 开发服务器

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
    echo -e "${YELLOW}[1/5] 检查环境配置...${NC}"

    if [ ! -f "$PROJECT_DIR/.env.local" ]; then
        echo -e "${RED}错误: .env.local 文件不存在${NC}"
        echo "请复制 .env.local.example 并填入配置："
        echo "  cp .env.local.example .env.local"
        exit 1
    fi

    # 检查必要的 API Key
    if ! grep -q "DASHSCOPE_API_KEY=." "$PROJECT_DIR/.env.local" 2>/dev/null; then
        echo -e "${RED}错误: DASHSCOPE_API_KEY 未配置${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ 环境配置检查通过${NC}"
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
    echo -e "${YELLOW}[2/5] 检查并停止已有服务...${NC}"

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

# 启动 Qdrant
start_qdrant() {
    echo -e "${YELLOW}[3/5] 启动 Qdrant 向量数据库...${NC}"

    if command -v docker &> /dev/null; then
        if docker ps | grep -q easy3d-qdrant; then
            echo -e "${GREEN}✓ Qdrant 已在运行${NC}"
        else
            echo "  启动 Qdrant 容器..."
            cd "$PROJECT_DIR"
            docker compose up -d 2>/dev/null || {
                echo -e "${YELLOW}⚠ Docker 启动失败，RAG 功能可能不可用${NC}"
                echo "  请确保 Docker 已启动"
            }

            if docker ps | grep -q easy3d-qdrant; then
                echo -e "${GREEN}✓ Qdrant 启动成功 (http://localhost:6333)${NC}"
            fi
        fi
    else
        echo -e "${YELLOW}⚠ Docker 未安装，跳过 Qdrant 启动${NC}"
        echo "  RAG 知识库功能将不可用"
    fi
    echo ""
}

# 启动 Next.js
start_nextjs() {
    echo -e "${YELLOW}[4/5] 启动 Next.js 开发服务器...${NC}"

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

# 构建知识库（可选）
build_knowledge() {
    echo -e "${YELLOW}[5/5] 检查知识库...${NC}"

    # 检查 Qdrant 是否运行
    if curl -s http://localhost:6333/collections/product-knowledge 2>/dev/null | grep -q "result"; then
        echo -e "${GREEN}✓ 知识库已存在${NC}"
    else
        echo -e "${YELLOW}  知识库未初始化${NC}"
        echo "  构建命令: npx tsx scripts/build-knowledge.ts"
    fi
    echo ""
}

# 主流程
main() {
    print_title
    check_env
    stop_existing
    start_qdrant
    start_nextjs
    build_knowledge
}

# 运行
main "$@"