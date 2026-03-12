#!/bin/bash

# Easy3D 状态检查脚本
# 查看所有服务运行状态

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Easy3D 服务状态${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Next.js 状态
echo -e "${YELLOW}Next.js 开发服务器:${NC}"
if pgrep -f "next dev" > /dev/null; then
    PORT=$(lsof -i -P | grep "node.*LISTEN" | grep -E "300[0-9]" | head -1 | awk '{print $9}' | cut -d: -f2)
    echo -e "  状态: ${GREEN}运行中${NC}"
    echo -e "  端口: ${GREEN}$PORT${NC}"
    echo -e "  地址: http://localhost:$PORT"
else
    echo -e "  状态: ${RED}未运行${NC}"
fi
echo ""

# Qdrant 状态
echo -e "${YELLOW}Qdrant 向量数据库:${NC}"
if docker ps 2>/dev/null | grep -q easy3d-qdrant; then
    echo -e "  状态: ${GREEN}运行中${NC}"
    echo -e "  地址: http://localhost:6333"

    # 检查知识库
    COLLECTION=$(curl -s http://localhost:6333/collections/product-knowledge 2>/dev/null)
    if echo "$COLLECTION" | grep -q "result"; then
        POINTS=$(echo "$COLLECTION" | grep -o '"points_count":[0-9]*' | grep -o '[0-9]*')
        echo -e "  知识库条目: ${GREEN}$POINTS${NC}"
    else
        echo -e "  知识库: ${YELLOW}未初始化${NC}"
    fi
else
    echo -e "  状态: ${RED}未运行${NC}"
fi
echo ""

# 环境变量
echo -e "${YELLOW}环境配置:${NC}"
if [ -f ".env.local" ]; then
    if grep -q "DASHSCOPE_API_KEY=." .env.local 2>/dev/null; then
        echo -e "  百炼 API Key: ${GREEN}已配置${NC}"
    else
        echo -e "  百炼 API Key: ${RED}未配置${NC}"
    fi
    if grep -q "TRIPO_API_KEY=." .env.local 2>/dev/null; then
        echo -e "  Tripo API Key: ${GREEN}已配置${NC}"
    else
        echo -e "  Tripo API Key: ${YELLOW}未配置${NC}"
    fi
else
    echo -e "  ${RED}.env.local 不存在${NC}"
fi
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "命令："
echo -e "  启动服务: ${GREEN}./scripts/start.sh${NC}"
echo -e "  停止服务: ${GREEN}./scripts/stop.sh${NC}"
echo -e "  查看状态: ${GREEN}./scripts/status.sh${NC}"
echo -e "${BLUE}========================================${NC}"