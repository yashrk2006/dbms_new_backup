// Standalone AI Engine test for verification
const AI_ENGINE = {
  calculateMatchScore: (studentSkills, requiredSkills) => {
    if (!requiredSkills.length) return 100;
    const studentSkillsLower = studentSkills.map(s => s.toLowerCase());
    const matches = requiredSkills.filter(req => 
      studentSkillsLower.includes(req.toLowerCase())
    );
    return Math.round((matches.length / requiredSkills.length) * 100);
  },
  getMatchDiagnosis: (studentSkills, requiredSkills) => {
    const studentSkillsLower = studentSkills.map(s => s.toLowerCase());
    return {
      matched: requiredSkills.filter(rs => studentSkillsLower.includes(rs.toLowerCase())),
      missing: requiredSkills.filter(rs => !studentSkillsLower.includes(rs.toLowerCase()))
    };
  }
};

const studentSkills = ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'];
const requiredSkills = ['React', 'Next.js', 'Tailwind CSS'];

console.log('📡 Testing SkillSync Intelligence (AI Match)...');
const score = AI_ENGINE.calculateMatchScore(studentSkills, requiredSkills);
const diagnosis = AI_ENGINE.getMatchDiagnosis(studentSkills, requiredSkills);

console.log(`✅ Match Score: ${score}%`);
console.log(`✅ Matched: ${diagnosis.matched.join(', ')}`);
console.log(`⚠️ Missing: ${diagnosis.missing.join(', ')}`);

if (score === 67) {
  console.log('✨ SkillSync Intelligence logic verified (2/3 matches).');
} else {
  console.error('❌ AI Engine mismatch detected.');
  process.exit(1);
}
