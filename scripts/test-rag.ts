/**
 * RAG Verification Test
 * Tests the complete RAG pipeline with DashScope V1 and Qdrant Cloud
 */

// IMPORTANT: dotenv must be the FIRST import to ensure env vars are loaded before other modules
import 'dotenv/config';
import { config } from 'dotenv';
config({ path: '.env.local' });

// Now import other modules - they will have access to env vars
import { searchKnowledge, askKnowledge, suggestDisplay } from '../lib/rag/search';
import { embedding, getEmbeddingModel, getEmbeddingDimension } from '../lib/rag/embedding';
import { getStats, getCollectionInfo } from '../lib/rag/qdrant';

async function testRAG() {
  console.log('=== RAG Verification Test ===\n');

  // 1. Check environment variables
  console.log('1. Environment Variables:');
  console.log('   DASHSCOPE_API_KEY_V1:', process.env.DASHSCOPE_API_KEY_V1?.substring(0, 15) + '...');
  console.log('   DASHSCOPE_BASE_URL_V1:', process.env.DASHSCOPE_BASE_URL_V1);
  console.log('   QDRANT_URL:', process.env.QDRANT_URL);
  console.log('');

  // 2. Check embedding provider
  console.log('2. Embedding Provider:');
  console.log('   Model:', getEmbeddingModel());
  console.log('   Dimension:', getEmbeddingDimension());
  console.log('');

  // 3. Test embedding
  console.log('3. Testing Embedding...');
  const testText = '这是一个测试文本';
  const vector = await embedding(testText);
  console.log('   Input:', testText);
  console.log('   Vector length:', vector.length);
  console.log('   First 5 values:', vector.slice(0, 5));
  console.log('');

  // 4. Check Qdrant status
  console.log('4. Qdrant Collection Status:');
  const info = await getCollectionInfo();
  if (info) {
    console.log('   Points count:', info.points_count);
    console.log('   Status:', info.status);
  }
  const stats = await getStats();
  console.log('   Total entries:', stats.total);
  console.log('   By category:', stats.byCategory);
  console.log('');

  // 5. Test vector search
  console.log('5. Testing Vector Search...');
  const searchResults = await searchKnowledge('化妆品展示', { limit: 3, enableRerank: false });
  console.log('   Query: "化妆品展示"');
  console.log('   Results:', searchResults.length);
  searchResults.forEach((r, i) => {
    console.log(`   [${i + 1}] Score: ${r.score.toFixed(3)}, Category: ${r.entry.category}`);
    console.log(`       Text: ${r.entry.text.substring(0, 80)}...`);
  });
  console.log('');

  // 6. Test search with rerank
  console.log('6. Testing Search with Rerank...');
  const rerankResults = await searchKnowledge('女包展示技巧', { limit: 3, enableRerank: true });
  console.log('   Query: "女包展示技巧"');
  console.log('   Results:', rerankResults.length);
  rerankResults.forEach((r, i) => {
    console.log(`   [${i + 1}] Score: ${r.score.toFixed(3)}, Rerank: ${r.rerankScore?.toFixed(3) || 'N/A'}`);
    console.log(`       Text: ${r.entry.text.substring(0, 80)}...`);
  });
  console.log('');

  // 7. Test knowledge Q&A
  console.log('7. Testing Knowledge Q&A...');
  const qaResult = await askKnowledge('如何设置珠宝展示的灯光？');
  console.log('   Question: "如何设置珠宝展示的灯光？"');
  console.log('   Answer:', qaResult.answer.substring(0, 200) + '...');
  console.log('   References:', qaResult.references.length);
  console.log('');

  // 8. Test suggestion generation
  console.log('8. Testing Suggestion Generation...');
  const suggestion = await suggestDisplay('一款红色皮质女包', '高端奢华');
  console.log('   Product: "一款红色皮质女包"');
  console.log('   Style: "高端奢华"');
  console.log('   Suggestion:', suggestion.suggestion.substring(0, 200) + '...');
  console.log('   References:', suggestion.references.length);
  console.log('');

  console.log('=== All Tests Completed Successfully! ===');
}

testRAG().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});