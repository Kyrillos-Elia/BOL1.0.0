import { connectToMongo } from './utils/mongoConnection.js';

const db = await connectToMongo();
const coll = db.collection('families');

console.log('1️⃣ Query with {id: "family-001"}:');
const doc1 = await coll.findOne({id: 'family-001'});
console.log(doc1 ? 'FOUND' : 'NOT FOUND');

console.log('\n2️⃣ findOneAndUpdate with {id: "family-001"}:');
const result = await coll.findOneAndUpdate(
  {id: 'family-001'}, 
  {$set: {test: 'value'}}, 
  {returnDocument: 'after'}
);
console.log(result.value ? 'FOUND' : 'NOT FOUND');
if (!result.value) console.log('Full result:', result);

console.log('\n3️⃣ Reverting test change:');
await coll.findOneAndUpdate(
  {id: 'family-001'}, 
  {$unset: {test: ''}}, 
  {returnDocument: 'after'}
);
console.log('Done');
