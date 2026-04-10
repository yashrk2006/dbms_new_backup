import XLSX from 'xlsx';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const filePath = path.resolve('4th Semester (1).xlsx');

async function importData() {
    try {
        console.log('Reading Excel file...');
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const datasheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(datasheet);

        console.log(`Total rows in Excel: ${rawData.length}`);

        // Deduplicate by "Exam Roll No"
        const uniqueStudentsMap = new Map();

        for (const row of rawData) {
            const examRollNo = String(row['Exam Roll No']);
            if (!uniqueStudentsMap.has(examRollNo)) {
                uniqueStudentsMap.set(examRollNo, {
                    roll_no: String(row['Roll No']),
                    enrollment_no: examRollNo,
                    name: String(row['Name']),
                    role: 'student',
                    course: String(row['Course']),
                    branch: null, // Branch not used as requested
                    batch_year: 2024, // Admission year 2024 for 2024-2027 batch
                });
            }
        }

        const uniqueStudents = Array.from(uniqueStudentsMap.values());
        console.log(`Unique students to import: ${uniqueStudents.length}`);

        // Chunking the insert (e.g., 500 at a time)
        const chunkSize = 500;
        let totalInserted = 0;

        for (let i = 0; i < uniqueStudents.length; i += chunkSize) {
            const chunk = uniqueStudents.slice(i, i + chunkSize);
            const { error } = await supabase
                .from('college_directory')
                .upsert(chunk, { onConflict: 'enrollment_no' });

            if (error) {
                console.error(`Error inserting chunk ${i / chunkSize + 1}:`, error.message);
            } else {
                totalInserted += chunk.length;
                console.log(`Progress: ${totalInserted}/${uniqueStudents.length} records processed.`);
            }
        }

        console.log('Import completed successfully!');

    } catch (error) {
        console.error('Import failed:', error.message);
    }
}

importData();
