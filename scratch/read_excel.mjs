import XLSX from 'xlsx';
import path from 'path';

const filePath = path.resolve('4th Semester (1).xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const datasheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(datasheet);

    console.log(`Sheet Name: ${sheetName}`);
    console.log(`Total Records in Excel: ${data.length}`);
    if (data.length > 0) {
        console.log('Sample Data (First 3 rows):');
        console.log(JSON.stringify(data.slice(0, 3), null, 2));
    }
} catch (error) {
    console.error('Error reading Excel file:', error.message);
}
