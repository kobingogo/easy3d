# Blender 3D 模型优化脚本 V1.0
# 用法：blender --background --python optimize_model.py -- input.glb output.glb

import bpy
import sys
import json
import os
from pathlib import Path


def log(message: str):
    """日志输出"""
    print(f"[Optimizer] {message}")


def delete_unused_data():
    """清理未使用的数据块"""
    # 清理未使用的材质
    for block in bpy.data.meshes:
        if block.users == 0:
            bpy.data.meshes.remove(block)
    
    for block in bpy.data.materials:
        if block.users == 0:
            bpy.data.materials.remove(block)
    
    for block in bpy.data.images:
        if block.users == 0:
            bpy.data.images.remove(block)
    
    log("已清理未使用的数据块")


def smooth_mesh(obj, iterations: int = 2, strength: float = 0.5):
    """
    网格平滑 - 使用细分修改器
    
    Args:
        obj: Blender 对象
        iterations: 细分迭代次数 (1-3 推荐)
        strength: 平滑强度 (0-1)
    """
    # 添加细分修改器
    modifier = obj.modifiers.new(name="Subdivision", type='SUBSURF')
    modifier.levels = iterations
    modifier.render_levels = iterations
    modifier.subdivision_type = 'CATMULL_CLARK'
    
    # 可选：添加边缘锐化，保持硬边
    if strength < 1.0:
        bevel = obj.modifiers.new(name="Bevel", type='BEVEL')
        bevel.amount = strength * 0.01
        bevel.segments = 4
        bevel.limit_method = 'ANGLE'
        bevel.angle_limit = 1.0472  # 60 度
    
    log(f"已为 {obj.name} 添加平滑修改器 (iterations={iterations})")
    return obj


def enhance_materials(obj, material_type: str = "auto"):
    """
    材质增强 - 调整 PBR 参数
    
    Args:
        obj: Blender 对象
        material_type: 材质类型 (auto/metal/fabric/plastic/glass)
    """
    for slot in obj.material_slots:
        mat = slot.material
        if not mat or not mat.use_nodes:
            continue
        
        nodes = mat.node_tree.nodes
        bsdf = nodes.get("Principled BSDF")
        
        if not bsdf:
            continue
        
        # 根据材质类型调整参数
        if material_type == "metal":
            bsdf.inputs["Metallic"].default_value = 0.9
            bsdf.inputs["Roughness"].default_value = 0.3
            bsdf.inputs["Clearcoat"].default_value = 0.5
        
        elif material_type == "fabric":
            bsdf.inputs["Metallic"].default_value = 0.0
            bsdf.inputs["Roughness"].default_value = 0.8
            bsdf.inputs["Sheen"].default_value = 0.5
        
        elif material_type == "plastic":
            bsdf.inputs["Metallic"].default_value = 0.1
            bsdf.inputs["Roughness"].default_value = 0.4
            bsdf.inputs["Clearcoat"].default_value = 0.3
        
        elif material_type == "glass":
            bsdf.inputs["Metallic"].default_value = 0.0
            bsdf.inputs["Roughness"].default_value = 0.0
            bsdf.inputs["Transmission"].default_value = 1.0
            bsdf.inputs["IOR"].default_value = 1.45
        
        else:  # auto - 智能调整
            # 稍微提升质感
            roughness = bsdf.inputs["Roughness"].default_value
            metalness = bsdf.inputs["Metallic"].default_value
            
            bsdf.inputs["Roughness"].default_value = max(0.1, roughness * 0.8)
            bsdf.inputs["Metallic"].default_value = min(1.0, metalness * 1.2)
            bsdf.inputs["Clearcoat"].default_value = 0.2
        
        log(f"已优化材质 {mat.name}")
    
    return obj


def setup_lighting():
    """
    设置专业级光照
    """
    # 清除默认灯光
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # 创建 HDRI 环境光
    world = bpy.context.scene.world
    if not world:
        world = bpy.data.worlds.new("World")
        bpy.context.scene.world = world
    
    world.use_nodes = True
    nodes = world.node_tree.nodes
    
    # 清除默认节点
    for node in nodes:
        nodes.remove(node)
    
    # 创建环境纹理节点
    env_texture = nodes.new(type='ShaderNodeTexEnvironment')
    # 使用 Blender 默认的 studio 灯光
    env_texture.image = bpy.data.images.load(
        bpy.utils.user_resource('DATAFILES') + "studiolights/world/curved_plane_01.exr",
        check_existing=True
    )
    
    # 创建背景节点
    background = nodes.new(type='ShaderNodeBackground')
    
    # 创建输出节点
    output = nodes.new(type='ShaderNodeOutputWorld')
    
    # 连接节点
    world.node_tree.links.new(env_texture.outputs['Color'], background.inputs['Color'])
    world.node_tree.links.new(background.outputs['Background'], output.inputs['Surface'])
    
    # 调整强度
    background.inputs['Strength'].default_value = 1.5
    
    log("已设置专业级光照")


def setup_camera():
    """
    设置产品摄影相机
    """
    # 创建相机
    cam_data = bpy.data.cameras.new('ProductCamera')
    cam_obj = bpy.data.objects.new('ProductCamera', cam_data)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj
    
    # 设置相机参数
    cam_data.lens = 50  # 50mm 标准镜头
    cam_data.clip_end = 1000
    
    # 设置景深（可选）
    cam_data.dof.use_dof = True
    cam_data.dof.aperture_fstop = 2.8
    cam_data.dof.focus_distance = 5.0
    
    log("已设置产品摄影相机")


def setup_render_settings(samples: int = 128, resolution: int = 1024):
    """
    设置高质量渲染参数
    
    Args:
        samples: 采样数 (64-256 推荐)
        resolution: 输出分辨率
    """
    scene = bpy.context.scene
    
    # 使用 Cycles 渲染器
    scene.render.engine = 'CYCLES'
    
    # 采样设置
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.cycles.device = 'GPU'  # 如果有 GPU
    
    # 分辨率设置
    scene.render.resolution_x = resolution
    scene.render.resolution_y = resolution
    scene.render.resolution_percentage = 100
    
    # 输出格式
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.image_settings.quality = 100
    
    # 透明背景
    scene.render.film_transparent = True
    
    log(f"已设置渲染参数 (samples={samples}, resolution={resolution})")


def optimize_model(input_path: str, output_path: str, options: dict):
    """
    主优化流程
    
    Args:
        input_path: 输入模型路径
        output_path: 输出模型路径
        options: 优化选项
    """
    log(f"开始优化：{input_path}")
    log(f"选项：{json.dumps(options, indent=2)}")
    
    # 1. 导入模型
    log("正在导入模型...")
    file_ext = Path(input_path).suffix.lower()
    
    if file_ext in ['.glb', '.gltf']:
        bpy.ops.import_scene.gltf(filepath=input_path, merge_vertices=True)
    elif file_ext == '.obj':
        bpy.ops.import_mesh.obj(filepath=input_path)
    elif file_ext == '.fbx':
        bpy.ops.import_scene.fbx(filepath=input_path)
    else:
        raise ValueError(f"不支持的文件格式：{file_ext}")
    
    # 获取所有网格对象
    objects = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
    log(f"找到 {len(objects)} 个网格对象")
    
    if not objects:
        raise ValueError("模型中没有网格对象")
    
    # 2. 网格优化
    if options.get("smooth_mesh", True):
        log("正在平滑网格...")
        for obj in objects:
            smooth_mesh(
                obj,
                iterations=options.get("smooth_iterations", 2),
                strength=options.get("smooth_strength", 0.5)
            )
    
    # 3. 材质增强
    if options.get("enhance_materials", True):
        log("正在增强材质...")
        material_type = options.get("material_type", "auto")
        for obj in objects:
            enhance_materials(obj, material_type)
    
    # 4. 清理
    if options.get("cleanup", True):
        log("正在清理数据...")
        delete_unused_data()
    
    # 5. 应用修改器（导出前）
    if options.get("apply_modifiers", True):
        log("正在应用修改器...")
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.modifier_apply(apply_as='DATA', modifier="Subdivision")
        # 应用其他修改器...
    
    # 6. 导出优化后模型
    log(f"正在导出：{output_path}")
    file_ext_out = Path(output_path).suffix.lower()
    
    if file_ext_out in ['.glb', '.gltf']:
        bpy.ops.export_scene.gltf(
            filepath=output_path,
            export_apply=True,
            export_format='GLB',
            export_quality=100,
            export_cameras=True,
            export_lights=True
        )
    elif file_ext_out == '.obj':
        bpy.ops.export_mesh.obj(filepath=output_path)
    elif file_ext_out == '.fbx':
        bpy.ops.export_scene.fbx(filepath=output_path)
    else:
        raise ValueError(f"不支持的导出格式：{file_ext_out}")
    
    log("优化完成!")
    
    return {
        "status": "success",
        "input": input_path,
        "output": output_path,
        "objects_count": len(objects)
    }


def render_beauty(input_path: str, output_path: str, options: dict):
    """
    高质量渲染输出
    
    Args:
        input_path: 模型路径
        output_path: 输出图片路径
        options: 渲染选项
    """
    log(f"开始渲染：{input_path}")
    
    # 导入模型
    bpy.ops.import_scene.gltf(filepath=input_path)
    
    # 设置光照
    setup_lighting()
    
    # 设置相机（自动定位）
    setup_camera()
    
    # 设置渲染参数
    setup_render_settings(
        samples=options.get("samples", 128),
        resolution=options.get("resolution", 1024)
    )
    
    # 渲染
    scene = bpy.context.scene
    scene.render.filepath = output_path
    
    log("正在渲染...")
    bpy.ops.render.render(write_still=True)
    
    log(f"渲染完成：{output_path}")
    
    return {
        "status": "success",
        "output": output_path
    }


def main():
    """主函数"""
    argv = sys.argv
    argv = argv[argv.index("--") + 1:] if "--" in argv else []
    
    if len(argv) < 2:
        log("错误：缺少参数")
        log("用法：blender --background --python optimize_model.py -- input.glb output.glb [options.json]")
        sys.exit(1)
    
    input_path = argv[0]
    output_path = argv[1]
    options = json.loads(argv[2]) if len(argv) > 2 else {}
    
    # 默认选项
    default_options = {
        "smooth_mesh": True,
        "smooth_iterations": 2,
        "smooth_strength": 0.5,
        "enhance_materials": True,
        "material_type": "auto",
        "cleanup": True,
        "apply_modifiers": True,
        "render": False,
        "render_samples": 128,
        "render_resolution": 1024
    }
    
    options = {**default_options, **options}
    
    try:
        if options.get("render", False):
            result = render_beauty(input_path, output_path, options)
        else:
            result = optimize_model(input_path, output_path, options)
        
        # 输出结果 JSON
        print(json.dumps(result))
        sys.exit(0)
    
    except Exception as e:
        log(f"错误：{str(e)}")
        print(json.dumps({"status": "error", "error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
