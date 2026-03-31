import xlsx from 'xlsx';
import fs from 'fs';

/**
 * SkillSync Batch Migration Engine
 * Processes institutional Excel data and prepares it for the College Directory.
 */

const FILE_PATH = './tmp/dataset.xlsx';
const OUTPUT_PATH = './tmp/migration_payload.json';

async function extract() {
  console.log('🚀 Starting Institutional Data Extraction...');

  if (!fs.existsSync(FILE_PATH)) {
    console.error('❌ Dataset missing at:', FILE_PATH);
    return;
  }

  const workbook = xlsx.readFile(FILE_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = xlsx.utils.sheet_to_json(sheet);

  console.log(`📊 Processing ${rawData.length} total subject-rows...`);

  // Deduplicate by Roll No
  const studentMap = new Map();

  rawData.forEach((row) => {
    const rollNo = row['Roll No'];
    if (!rollNo || studentMap.has(rollNo)) return;

    studentMap.set(rollNo, {
      roll_no: rollNo?.toString(),
      enrollment_no: row['Exam Roll No']?.toString(),
      name: row['Name'],
      course: row['Course'],
      branch: row['Sec'], // Using Sec as branch/area if branch isn't explicit
      batch_year: 2024, // Assumed from Roll No prefix '24/'
      role: 'student'
    });
  });

  const students = Array.from(studentMap.values());
  console.log(`✅ Extraction Complete. Found ${students.length} unique students.`);

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(students, null, 2));
  console.log(`💾 Migration payload saved to: ${OUTPUT_PATH}`);
}

extract().catch(console.error);
