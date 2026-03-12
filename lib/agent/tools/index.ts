/**
 * Agent 工具注册表
 */

import type { Tool } from '../types'
import { analyzeProductTool } from './analyze-product'
import { optimizePromptTool } from './optimize-prompt'
import { generate3DTool } from './generate-3d'
import { qualityCheckTool } from './quality-check'
import { exportModelTool } from './export-model'

/**
 * 工具注册表
 */
export const toolRegistry: Map<string, Tool<any, any>> = new Map([
  ['analyze_product', analyzeProductTool as Tool<any, any>],
  ['optimize_prompt', optimizePromptTool as Tool<any, any>],
  ['generate_3d', generate3DTool as Tool<any, any>],
  ['quality_check', qualityCheckTool as Tool<any, any>],
  ['export_model', exportModelTool as Tool<any, any>]
])

/**
 * 获取工具定义列表（给 LLM 使用）
 */
export function getToolDefinitions(): Array<{ type: 'function'; function: any }> {
  return Array.from(toolRegistry.values()).map(tool => ({
    type: 'function',
    function: tool.function
  }))
}

/**
 * 获取工具
 */
export function getTool(name: string): Tool | undefined {
  return toolRegistry.get(name)
}

/**
 * 获取所有工具名称
 */
export function getToolNames(): string[] {
  return Array.from(toolRegistry.keys())
}

// 导出所有工具
export {
  analyzeProductTool,
  optimizePromptTool,
  generate3DTool,
  qualityCheckTool,
  exportModelTool
}