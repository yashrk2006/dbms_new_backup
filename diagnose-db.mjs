import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function diagnose() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI missing in .env.local');
    return;
  }

  console.log('📡 Connecting to:', MONGODB_URI.split('@')[1] || 'URL');
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully.');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📦 Collections found:', collections.map(c => c.name).join(', ') || 'NONE');

    for (const coll of collections) {
        const count = await mongoose.connection.db.collection(coll.name).countDocuments();
        console.log(` - ${coll.name}: ${count} documents`);
        
        if (count > 0) {
            const samples = await mongoose.connection.db.collection(coll.name).find().limit(2).toArray();
            console.log(`   Sample IDs:`, samples.map(s => s.id || s.student_id || s._id));
        }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

diagnose();
