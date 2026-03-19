/**
 * 测试查询改写 + RAG 搜索集成
 */

const { searchKnowledge } = require('../lib/rag/search.ts');

async function main() {
  console.log('=== RAG 搜索集成测试 ===\n');

  const testQueries = [
    '高端女包展示',
    '化妆品灯光设置'
  ];

  for (const query of testQueries) {
    console.log(`\n查询: "${query}"`);
    console.log('---');

    // 测试启用查询改写（默认 quick 模式）
    const startTime = Date.now();
    const results = await searchKnowledge(query, {
      limit: 3,
      enableRewrite: true,
      rewriteMode: 'quick',
      enableRerank: false  // 跳过 rerank 加快测试
    });
    const latency = Date.now() - startTime;

    console.log(`找到 ${results.length} 条结果 (${latency}ms)`);
    results.forEach((r, i) => {
      console.log(`  [${i+1}] ${(r.score * 100).toFixed(1)}% - ${r.entry.category} - ${r.entry.text.slice(0, 80)}...`);
    });
  }

  console.log('\n测试完成！');
}

main().catch(console.error);