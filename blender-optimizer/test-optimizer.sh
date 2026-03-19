#!/bin/bash
# Blender Optimizer V1.0 测试脚本

set -e

echo "========================================="
echo "Blender Optimizer V1.0 测试脚本"
echo "========================================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试目录
TEST_DIR="/tmp/blender-optimizer-test"
mkdir -p "$TEST_DIR"

# 清理函数
cleanup() {
    echo -e "\n${YELLOW}清理测试文件...${NC}"
    rm -rf "$TEST_DIR"
}

trap cleanup EXIT

# 1. 检查 Blender 是否安装
echo -e "\n${YELLOW}[1/5] 检查 Blender 安装...${NC}"
if command -v blender &> /dev/null; then
    BLENDER_PATH=$(which blender)
    echo -e "${GREEN}✓ Blender 已安装：$BLENDER_PATH${NC}"
    blender --version | head -1
else
    # 检查 macOS 默认路径
    if [ -f "/Applications/Blender.app/Contents/MacOS/Blender" ]; then
        BLENDER_PATH="/Applications/Blender.app/Contents/MacOS/Blender"
        echo -e "${GREEN}✓ Blender 已安装：$BLENDER_PATH${NC}"
        "$BLENDER_PATH" --version | head -1
    else
        echo -e "${RED}✗ Blender 未安装${NC}"
        echo "请安装 Blender: https://www.blender.org/download/"
        exit 1
    fi
fi

# 2. 检查 Python 依赖
echo -e "\n${YELLOW}[2/5] 检查 Python 依赖...${NC}"
cd "$(dirname "$0")"

if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt
echo -e "${GREEN}✓ Python 依赖已安装${NC}"

# 3. 启动服务
echo -e "\n${YELLOW}[3/5] 启动 Blender 优化服务...${NC}"
pkill -f "uvicorn server.main:app" 2>/dev/null || true
sleep 1

uvicorn server.main:app --port 8000 &
SERVER_PID=$!
echo "服务 PID: $SERVER_PID"

# 等待服务启动
echo "等待服务启动..."
for i in {1..10}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 服务已启动${NC}"
        break
    fi
    sleep 1
done

# 检查服务健康状态
HEALTH=$(curl -s http://localhost:8000/health)
echo "健康状态：$HEALTH"

if echo "$HEALTH" | grep -q '"status":"healthy"'; then
    echo -e "${GREEN}✓ 服务健康检查通过${NC}"
else
    echo -e "${RED}✗ 服务健康检查失败${NC}"
    kill $SERVER_PID
    exit 1
fi

# 4. 创建测试模型（简单的 GLB 文件）
echo -e "\n${YELLOW}[4/5] 创建测试模型...${NC}"

# 使用 Blender 创建简单立方体
"$BLENDER_PATH" --background --python <<EOF
import bpy

# 清除默认对象
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# 创建立方体
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))

# 添加材质
mat = bpy.data.materials.new(name="TestMaterial")
mat.use_nodes = True
cube = bpy.context.active_object
cube.data.materials.append(mat)

# 导出为 GLB
bpy.ops.export_scene.gltf(
    filepath="$TEST_DIR/test-cube.glb",
    export_format='GLB',
    export_apply=True
)

print("测试模型已创建：$TEST_DIR/test-cube.glb")
EOF

echo -e "${GREEN}✓ 测试模型已创建${NC}"

# 5. 测试优化 API
echo -e "\n${YELLOW}[5/5] 测试优化 API...${NC}"

# 提交优化任务
echo "提交优化任务..."
RESPONSE=$(curl -s -X POST http://localhost:8000/api/optimize \
    -F "file=@$TEST_DIR/test-cube.glb" \
    -F 'options={"smooth_mesh":true,"smooth_iterations":1}')

echo "响应：$RESPONSE"

TASK_ID=$(echo "$RESPONSE" | grep -o '"task_id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TASK_ID" ]; then
    echo -e "${RED}✗ 任务提交失败${NC}"
    kill $SERVER_PID
    exit 1
fi

echo -e "${GREEN}✓ 任务已提交：$TASK_ID${NC}"

# 轮询任务状态
echo "等待任务完成..."
for i in {1..30}; do
    STATUS=$(curl -s http://localhost:8000/api/tasks/$TASK_ID)
    TASK_STATUS=$(echo "$STATUS" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    
    echo "  [$i] 状态：$TASK_STATUS"
    
    if [ "$TASK_STATUS" = "completed" ]; then
        echo -e "${GREEN}✓ 任务完成${NC}"
        
        # 下载优化后的模型
        curl -s -o "$TEST_DIR/test-cube-optimized.glb" \
            http://localhost:8000/api/downloads/$TASK_ID
        
        if [ -f "$TEST_DIR/test-cube-optimized.glb" ]; then
            SIZE=$(ls -lh "$TEST_DIR/test-cube-optimized.glb" | awk '{print $5}')
            echo -e "${GREEN}✓ 优化后的模型已下载：$SIZE${NC}"
        fi
        break
    elif [ "$TASK_STATUS" = "failed" ]; then
        echo -e "${RED}✗ 任务失败${NC}"
        echo "$STATUS"
        kill $SERVER_PID
        exit 1
    fi
    
    sleep 2
done

# 清理服务
echo -e "\n${YELLOW}停止服务...${NC}"
kill $SERVER_PID

# 测试结果
echo -e "\n========================================="
echo -e "${GREEN}✓ 所有测试通过!${NC}"
echo "========================================="
echo ""
echo "测试文件位置：$TEST_DIR"
echo "  - test-cube.glb (原始模型)"
echo "  - test-cube-optimized.glb (优化后模型)"
echo ""
echo "下一步:"
echo "1. 检查优化后的模型质量"
echo "2. 调整优化参数获得更好效果"
echo "3. 集成到 easy3d 主应用"
echo ""
