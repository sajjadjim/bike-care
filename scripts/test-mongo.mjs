import mongoose from 'mongoose';

const uri = 'mongodb+srv://moto_Care:tzDECWargdTDvuXz@sajjadjim15.ac97xgz.mongodb.net/Moto_care?retryWrites=true&w=majority';

async function test() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);
  console.log('SUCCESS: Connected to database:', mongoose.connection.name);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Existing collections:', collections.map((c) => c.name));
  await mongoose.disconnect();
  console.log('Disconnected cleanly.');
}

test().catch((e) => {
  console.error('Connection failed:', e.message);
  process.exit(1);
});
