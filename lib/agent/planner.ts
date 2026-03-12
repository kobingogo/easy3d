/**
 * ReAct 规划器
 * 使用 LLM 进行任务规划
 */

import type { ExecutionPlan, PlannedStep } from './types'
import { generate } from './llm'
import { getToolDefinitions } from './tools'

export class ReActPlanner {
  /**
   * 判断是否使用 ReAct 动态规划
   * 简单请求直接使用默认计划，避免不必要的 LLM 调用
   */
  shouldUseReAct(userInput: string): boolean {
    const complexIndicators = [
      '定制', '自定义', '特殊', '复杂',
      '多', '同时', '然后', '再', '另外',
      '不仅', '还要', '并且', '以及', '多个'
    ]
    return complexIndicators.some(indicator => userInput.includes(indicator))
  }

  /**
   * 使用 ReAct 模式规划任务
   * 对于简单请求，直接返回默认计划
   */
  async plan(userInput: string): Promise<ExecutionPlan> {
    // 简单请求直接使用默认计划，跳过 LLM 调用
    if (!this.shouldUseReAct(userInput)) {
      console.log('[Planner] Using default plan for simple request')
      return this.getDefaultPlan(userInput)
    }

    console.log('[Planner] Using ReAct planning for complex request')
    const toolDefinitions = getToolDefinitions()

    const result = await generate({
      model: 'qwen3.5-plus',
      messages: [{
        role: 'user',
        content: `你是一个任务规划专家。用户想要完成一个任务，请分析并制定执行计划。

用户输入：${userInput}

可用工具：
${toolDefinitions.map((t: any) => `- ${t.function.name}: ${t.function.description}`).join('\n')}

请返回 JSON 格式的执行计划。

【重要】引用前序步骤输出的格式：
{ "参数名": { "type": "reference", "stepId": "前序步骤ID", "path": "." } }

工具参数说明：
- analyze_product: 需要 imageUrl 或 description
- optimize_prompt: 需要 analysis（商品分析结果）
- generate_3d: 需要 imageUrl 和 prompt

注意：步骤 ID 使用 step_1, step_2 等格式`
      }],
      responseFormat: { type: 'json_object' }
    })

    try {
      return JSON.parse(result.content)
    } catch (e) {
      return this.getDefaultPlan(userInput)
    }
  }

  /**
   * 获取默认计划（简单生成流程）
   */
  getDefaultPlan(userInput: string): ExecutionPlan {
    return {
      reasoning: '使用标准3D生成流程',
      steps: [
        {
          id: 'step_1',
          tool: 'analyze_product',
          description: '分析商品',
          input: { description: userInput },
          dependencies: []
        },
        {
          id: 'step_2',
          tool: 'optimize_prompt',
          description: '优化展示提示词',
          input: { analysis: { type: 'reference', stepId: 'step_1', path: '.' } },
          dependencies: ['step_1']
        },
        {
          id: 'step_3',
          tool: 'generate_3d',
          description: '生成3D模型',
          input: {
            prompt: { type: 'reference', stepId: 'step_2', path: '.' }
          },
          dependencies: ['step_2']
        }
      ],
      estimatedTime: 90
    }
  }

  /**
   * 根据用户输入生成完整工作流步骤
   */
  async generateWorkflowSteps(userInput: string, imageUrl?: string): Promise<PlannedStep[]> {
    const plan = await this.plan(userInput)

    // 填充图片 URL 和描述
    return plan.steps.map((step: any) => {
      const input = { ...step.input }

      // 如果有图片 URL，填充它
      if (input.imageUrl === '' && imageUrl) {
        input.imageUrl = imageUrl
      }

      // 如果没有图片但有用户输入，把用户输入作为描述
      if (!input.imageUrl && !input.description) {
        input.description = userInput
      }

      return {
        ...step,
        input
      }
    })
  }
}