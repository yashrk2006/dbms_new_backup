import { AI_ENGINE } from './src/lib/ai-engine.ts';

const studentSkills = ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'];
const requiredSkills = ['React', 'Next.js', 'Tailwind CSS'];

console.log('📡 Testing AI Match Logic...');
const score = AI_ENGINE.calculateMatchScore(studentSkills, requiredSkills);
const diagnosis = AI_ENGINE.getMatchDiagnosis(studentSkills, requiredSkills);

console.log(`✅ Match Score: ${score}%`);
console.log(`✅ Matched: ${diagnosis.matched.join(', ')}`);
console.log(`⚠️ Missing: ${diagnosis.missing.join(', ')}`);

if (score === 67) {
  console.log('✨ AI Engine match logic verified (2/3 matches).');
} else {
  console.error('❌ AI Engine match logic failure.');
  process.exit(1);
}
