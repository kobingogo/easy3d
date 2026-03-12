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
   */
  shouldUseReAct(userInput: string): boolean {
    const complexIndicators = [
      '定制', '自定义', '特殊', '复杂',
      '多', '同时', '然后', '再', '另外',
      '不仅', '还要', '并且', '以及'
    ]
    return complexIndicators.some(indicator => userInput.includes(indicator))
  }

  /**
   * 使用 ReAct 模式规划任务
   */
  async plan(userInput: string): Promise<ExecutionPlan> {
    const toolDefinitions = getToolDefinitions()

    const result = await generate({
      model: 'qwen3.5-plus',  // 使用新模型
      messages: [{
        role: 'user',
        content: `你是一个任务规划专家。用户想要完成一个任务，请分析并制定执行计划。

用户输入：${userInput}

可用工具：
${toolDefinitions.map((t: any) => `- ${t.function.name}: ${t.function.description}`).join('\n')}

请按照 ReAct (Reason-Act-Observe) 模式规划：

1. **分析任务**：理解用户意图，确定需要哪些工具
2. **制定计划**：列出执行步骤，包括输入参数和依赖关系
3. **预估时间**：估计总执行时间（秒）

请返回 JSON 格式：
{
  "reasoning": "任务分析过程",
  "steps": [
    {
      "id": "step_1",
      "tool": "工具名称",
      "description": "步骤描述",
      "input": { "imageUrl": "用户提供的图片URL" },
      "dependencies": []
    }
  ],
  "estimatedTime": 60
}

注意：
- 步骤 ID 使用 step_1, step_2 等格式
- 如果用户提供图片 URL，在相应步骤的 input 中使用
- 依赖关系使用步骤 ID 数组表示`
      }],
      responseFormat: { type: 'json_object' }
    })

    try {
      return JSON.parse(result.content)
    } catch (e) {
      // 解析失败，返回默认计划
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
          description: '分析商品图片',
          input: { imageUrl: '' },
          dependencies: []
        },
        {
          id: 'step_2',
          tool: 'optimize_prompt',
          description: '优化展示提示词',
          input: { analysis: { type: 'reference', stepId: 'step_1', path: 'data' } },
          dependencies: ['step_1']
        },
        {
          id: 'step_3',
          tool: 'generate_3d',
          description: '生成3D模型',
          input: { imageUrl: '', prompt: { type: 'reference', stepId: 'step_2', path: 'data.prompt' } },
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