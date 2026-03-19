/**
 * 测试查询改写功能
 */

const { quickRewrite } = require('../lib/rag/query-rewriter.ts');

// 测试用例
const testCases = [
  '高端女包怎么展示',
  '化妆品拍摄灯光设置',
  '手机3D展示背景选择',
  '珠宝首饰特写效果'
];

console.log('=== Query Rewriter 测试 ===\n');

testCases.forEach(query => {
  const result = quickRewrite(query);
  console.log(`原查询: "${result.original}"`);
  console.log(`改写结果:`);
  result.rewrites.forEach((r, i) => {
    console.log(`  [${i+1}] ${r.type}: "${r.rewritten}" (置信度: ${r.confidence})`);
  });
  console.log(`扩展查询: "${result.expandedQuery}"`);
  console.log('---');
});

console.log('\n测试完成！');