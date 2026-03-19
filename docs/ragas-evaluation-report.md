# RAGAS 评估报告

## 测试概述

**测试日期:** 2026-03-17
**评估用例数:** 55
**评估框架:** RAGAS (Faithfulness + Answer Relevancy + Context Precision)

---

## 核心指标

| 指标 | 值 | 说明 |
|------|------|------|
| **Faithfulness** | 90.3% | 答案是否基于上下文 |
| **Answer Relevancy** | 80.3% | 答案是否回答了问题 |
| **Context Precision** | 66.8% | 检索的上下文是否相关 |
| **Avg Latency** | 4882ms | 评估延迟 |

---

## 分类分析

| 分类 | Faithfulness | Answer Relevancy | Context Precision | 用例数 |
|------|-------------|------------------|-------------------|--------|
| product_category | 90.8% | 80.1% | 71.8% | 22 |
| scene_design | 96.7% | 79.9% | 90.5% | 10 |
| lighting | 86.3% | 77.3% | 49.0% | 10 |
| style_template | 88.3% | 82.4% | 50.4% | 8 |
| platform_spec | 86.7% | 84.4% | 59.0% | 5 |

---

## 难度分析

| 难度 | Faithfulness | Answer Relevancy | Context Precision | 用例数 |
|------|-------------|------------------|-------------------|--------|
| easy | 90.8% | 80.4% | 68.5% | 32 |
| medium | 90.9% | 79.6% | 64.3% | 21 |
| hard | 76.9% | 85.4% | 65.0% | 2 |

---

## 指标说明

### Faithfulness (忠实度)
衡量生成的答案是否忠实于检索到的上下文。计算方式：
1. 从答案中提取所有事实性陈述 (claims)
2. 验证每个 claim 是否能从上下文推导
3. 得分 = 可验证的 claims / 总 claims

### Answer Relevancy (答案相关性)
衡量答案是否真正回答了用户问题。计算方式：
1. 基于答案生成潜在问题
2. 计算生成问题与原始问题的语义相似度
3. 得分 = 平均相似度

### Context Precision (上下文精确度)
衡量检索到的上下文是否与问题相关。计算方式：
1. LLM 评估每个上下文与问题的相关程度 (0-2)
2. 得分 = 平均相关度 / 2

---

## 改进建议

3. **Context Precision 偏低** - 检索的上下文相关性不足
   - 建议：优化检索阈值，过滤低相关性结果
   - 建议：扩展知识库，增加高质量内容
4. **部分分类表现较弱** - lighting
   - 建议：针对性地扩展这些分类的知识库内容

---

## 附录：测试命令

```bash
# 运行 RAGAS 评估
npm run test:ragas

# 详细输出
npm run test:ragas:verbose

# 采样测试（仅测试 10 个用例）
npm run test:ragas -- --sample 10
```
