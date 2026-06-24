/**
 * ============================================================================
 * MongoDB Connection Manager
 * ============================================================================
 * 
 * PURPOSE:
 * Manages MongoDB connection and provides database instance
 * Handles connection pooling and error handling
 * 
 * CONFIGURATION:
 * Connection string from environment variable or default
 */

import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://KeroTech_2004:KeroTech%402004@kerotech.pankwb0.mongodb.net/?appName=KeroTech';
const DB_NAME = 'brotherhood_pharmacy';

let mongoClient = null;
let mongoDb = null;

/**
 * Connect to MongoDB
 * Initializes global database connection
 */
export async function connectToMongo() {
  try {
    if (mongoDb) {
      console.log('✅ Already connected to MongoDB');
      return mongoDb;
    }

    console.log('🔄 Connecting to MongoDB...');
    
    mongoClient = new MongoClient(MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority'
    });

    await mongoClient.connect();
    mongoDb = mongoClient.db(DB_NAME);

    // Verify connection
    await mongoDb.admin().ping();
    console.log('✅ Successfully connected to MongoDB');
    console.log(`📊 Database: ${DB_NAME}`);

    return mongoDb;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
}

/**
 * Get current MongoDB instance
 */
export function getMongoDb() {
  if (!mongoDb) {
    throw new Error('MongoDB not connected. Call connectToMongo() first');
  }
  return mongoDb;
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectMongo() {
  try {
    if (mongoClient) {
      await mongoClient.close();
      mongoClient = null;
      mongoDb = null;
      console.log('✅ Disconnected from MongoDB');
    }
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error.message);
    throw error;
  }
}

/**
 * Initialize collections with indexes
 */
export async function initializeCollections() {
  try {
    const db = getMongoDb();

    // Define collections to create
    const collectionsConfig = {
      users: {
        indexes: [
          { key: { username: 1 }, unique: true },
          { key: { email: 1 } }
        ]
      },
      families: {
        indexes: [
          { key: { family_code: 1 }, unique: true },
          { key: { zone: 1 } },
          { key: { national_id: 1 } }
        ]
      },
      medicines: {
        indexes: [
          { key: { med_name: 1 } },
          { key: { stock_quantity: 1 } },
          { key: { expiry_date: 1 } }
        ]
      },
      distributions: {
        indexes: [
          { key: { family_id: 1 } },
          { key: { month: 1 } },
          { key: { status: 1 } },
          { key: { date: 1 } }
        ]
      },
      pharmacies: {
        indexes: [
          { key: { name: 1 }, unique: true }
        ]
      }
    };

    // Create collections if they don't exist
    for (const [collectionName, config] of Object.entries(collectionsConfig)) {
      try {
        const collections = await db.listCollections().toArray();
        const collectionExists = collections.some(c => c.name === collectionName);

        if (!collectionExists) {
          await db.createCollection(collectionName);
          console.log(`✅ Created collection: ${collectionName}`);
        }

        // Create indexes
        if (config.indexes && config.indexes.length > 0) {
          const collection = db.collection(collectionName);
          for (const index of config.indexes) {
            try {
              await collection.createIndex(index.key, {
                unique: index.unique || false,
                background: true
              });
            } catch (indexError) {
              if (indexError.code === 85) {
                // Index already exists, that's fine
                continue;
              }
              console.warn(`⚠️  Warning creating index on ${collectionName}:`, indexError.message);
            }
          }
        }
      } catch (error) {
        if (error.code === 48) {
          // Collection already exists, that's fine
          continue;
        }
        console.warn(`⚠️  Warning with collection ${collectionName}:`, error.message);
      }
    }

    console.log('✅ Collections initialized');
  } catch (error) {
    console.error('❌ Error initializing collections:', error.message);
    throw error;
  }
}

/**
 * Migrate data from old system (if needed)
 */
export async function migrateFromJson(jsonData, collectionName) {
  try {
    const db = getMongoDb();
    const collection = db.collection(collectionName);

    if (Array.isArray(jsonData) && jsonData.length > 0) {
      // Check if collection is empty
      const count = await collection.countDocuments();
      
      if (count === 0) {
        await collection.insertMany(jsonData);
        console.log(`✅ Migrated ${jsonData.length} ${collectionName} records from JSON`);
        return true;
      } else {
        console.log(`⏭️  Collection '${collectionName}' already has data, skipping migration`);
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error(`❌ Error migrating ${collectionName}:`, error.message);
    throw error;
  }
}

export default {
  connectToMongo,
  getMongoDb,
  disconnectMongo,
  initializeCollections,
  migrateFromJson
};
