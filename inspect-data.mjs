import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkData() {
  await mongoose.connect(MONGODB_URI);
  
  const student = await mongoose.connection.db.collection('students').findOne({});
  console.log('--- STUDENT ---');
  console.log(student);

  const company = await mongoose.connection.db.collection('companies').findOne({});
  console.log('\n--- COMPANY ---');
  console.log(company);

  const internship = await mongoose.connection.db.collection('internships').findOne({});
  console.log('\n--- INTERNSHIP ---');
  console.log(internship);

  await mongoose.disconnect();
}

checkData();
