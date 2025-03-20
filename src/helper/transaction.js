// const { MongoClient } = require('mongodb');

// async function runTransaction() {
//     const uri = 'mongodb://localhost:27017'; // Remplacez par votre URI MongoDB
//     const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//     try {
//         await client.connect();

//         const db = client.db('mydatabase'); // Remplacez par le nom de votre base de données
//         const collection1 = db.collection('collection1');
//         const collection2 = db.collection('collection2');

//         const session = client.startSession();

//         session.startTransaction();
//         try {
//             await collection1.insertOne({ name: 'Alice' }, { session });
//             await collection2.insertOne({ name: 'Bob' }, { session });

//             await session.commitTransaction();
//             console.log('Transaction réussie');
//         } catch (error) {
//             await session.abortTransaction();
//             console.error('Transaction échouée : ', error);
//         } finally {
//             session.endSession();
//         }
//     } finally {
//         await client.close();
//     }
// }

// runTransaction().catch(console.error);