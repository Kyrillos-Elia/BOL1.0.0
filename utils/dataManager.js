/**
 * ============================================================================
 * Data Manager - MongoDB Version
 * ============================================================================
 * 
 * PURPOSE:
 * Provides unified API for data operations using MongoDB
 * Replaces JSON file operations with MongoDB CRUD operations
 * Maintains backward compatibility with existing code
 * 
 * MIGRATION NOTE:
 * - All functions keep the same signatures as the JSON version
 * - Collections: users, families, medicines, distributions, pharmacies
 * - All data operations are now async (wrapped for compatibility)
 */

import { getMongoDb, migrateFromJson } from './mongoConnection.js';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(path.dirname(__dirname), 'data');

/**
 * Initialize data files and migrate from JSON if needed
 * This function:
 * 1. Reads old JSON files if they exist
 * 2. Migrates data to MongoDB (one-time operation)
 * 3. Sets up the system for MongoDB operations
 */
export async function initializeDataFiles() {
  try {
    const db = getMongoDb();
    
    // Define collections to migrate from
    const collectionsToMigrate = {
      users: {
        path: path.join(DATA_DIR, 'users.json'),
        default: [
          {
            id: 'admin-001',
            full_name: 'مدير النظام',
            username: 'admin',
            password_hash: 'admin123',
            role: 'Admin',
            email: 'admin@brothersofthelord.com',
            phone: '01001234567',
            created_at: new Date().toISOString(),
            last_login: null,
            is_active: true
          }
        ]
      },
      families: {
        path: path.join(DATA_DIR, 'families.json'),
        default: []
      },
      medicines: {
        path: path.join(DATA_DIR, 'medicines.json'),
        default: []
      },
      distributions: {
        path: path.join(DATA_DIR, 'distributions.json'),
        default: []
      },
      pharmacies: {
        path: path.join(DATA_DIR, 'pharmacies.json'),
        default: []
      }
    };

    // Migrate data from JSON files
    for (const [collectionName, config] of Object.entries(collectionsToMigrate)) {
      try {
        let dataToMigrate = config.default;

        // Try to read old JSON file
        if (fs.existsSync(config.path)) {
          try {
            const content = fs.readFileSync(config.path, 'utf8');
            if (content.trim()) {
              dataToMigrate = JSON.parse(content);
              console.log(`📄 Read ${dataToMigrate.length} ${collectionName} from JSON file`);
            }
          } catch (parseErr) {
            console.warn(`⚠️  Could not parse ${collectionName}.json, using defaults`);
          }
        }

        // Migrate to MongoDB
        await migrateFromJson(dataToMigrate, collectionName);
      } catch (error) {
        console.error(`❌ Error initializing ${collectionName}:`, error.message);
      }
    }

    console.log('✅ Data initialization complete');
  } catch (error) {
    console.error('❌ Error in initializeDataFiles:', error.message);
    throw error;
  }
}

/**
 * Read all data from a collection
 * 
 * @param {string} collectionName - Name of collection
 * @returns {Promise<Array>} Array of documents
 */
export async function readData(collectionName) {
  try {
    const db = getMongoDb();
    const collection = db.collection(collectionName);
    const data = await collection.find({}).toArray();
    return data;
  } catch (error) {
    console.error(`❌ Error reading ${collectionName}:`, error.message);
    throw error;
  }
}

/**
 * Write all data to a collection (replace all)
 * 
 * @param {string} collectionName - Name of collection
 * @param {Array} data - Array of documents to write
 * @returns {Promise<boolean>} Success status
 */
export async function writeData(collectionName, data) {
  try {
    if (!Array.isArray(data)) {
      throw new Error(`Data must be an array, got ${typeof data}`);
    }

    const db = getMongoDb();
    const collection = db.collection(collectionName);

    // Delete all existing documents and insert new ones
    await collection.deleteMany({});
    
    if (data.length > 0) {
      await collection.insertMany(data);
      console.log(`✅ Saved ${data.length} ${collectionName} records`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Error writing ${collectionName}:`, error.message);
    throw error;
  }
}

/**
 * Find a single document by ID
 * 
 * @param {string} collectionName - Collection name
 * @param {string} id - Document ID
 * @returns {Promise<Object|null>} Document or null
 */
export async function findById(collectionName, id) {
  try {
    const db = getMongoDb();
    const collection = db.collection(collectionName);
    
    // Try by id field first
    let doc = await collection.findOne({ id: id });
    if (doc) {
      return doc;
    }
    
    // Fallback: try by _id if id looks like ObjectId or mongo id string
    if (ObjectId.isValid(id)) {
      try {
        const oid = new ObjectId(id);
        doc = await collection.findOne({ _id: oid });
        if (doc) {
          console.log(`✅ findById() found by _id fallback for id='${id}'`);
          return doc;
        }
      } catch (err) {
        // Silent, will return null
      }
    }
    
    console.warn(`⚠️  findById() - no document found in ${collectionName} for id='${id}'`);
    return null;
  } catch (error) {
    console.error(`❌ Error finding by ID in ${collectionName}:`, error.message);
    throw error;
  }
}

/**
 * Find multiple documents matching a condition
 * 
 * @param {string} collectionName - Collection name
 * @param {Object} condition - Query condition
 * @returns {Promise<Array>} Array of matching documents
 */
export async function findMany(collectionName, condition = {}) {
  try {
    const db = getMongoDb();
    const collection = db.collection(collectionName);
    const data = await collection.find(condition).toArray();
    return data;
  } catch (error) {
    console.error(`❌ Error finding in ${collectionName}:`, error.message);
    throw error;
  }
}

/**
 * Create a new document
 * 
 * @param {string} collectionName - Collection name
 * @param {Object} record - Document to create (must have 'id' field)
 * @returns {Promise<Object>} Created document
 */
export async function create(collectionName, record) {
  try {
    if (!record.id) {
      throw new Error('Record must have an id field');
    }

    const db = getMongoDb();
    const collection = db.collection(collectionName);

    // Check if document already exists
    const existing = await collection.findOne({ id: record.id });
    if (existing) {
      throw new Error(`Record with id ${record.id} already exists`);
    }

    // Ensure timestamps
    if (!record.created_at) {
      record.created_at = new Date().toISOString();
    }

    const result = await collection.insertOne(record);
    console.log(`✅ Created ${collectionName} record`);
    return record;
  } catch (error) {
    console.error(`❌ Error creating in ${collectionName}:`, error.message);
    throw error;
  }
}

/**
 * Update an existing document
 * 
 * @param {string} collectionName - Collection name
 * @param {string} id - Document ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated document
 */
export async function update(collectionName, id, updates) {
  try {
    const db = getMongoDb();
    const collection = db.collection(collectionName);

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    // Try update by `id` field first (ensure it's a string)
    const result = await collection.findOneAndUpdate(
      { id: String(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (result) {
      return result;
    }
    
    // Fallback: if not found, try by _id when id looks like ObjectId
    if (ObjectId.isValid(id)) {
      try {
        const oid = new ObjectId(id);
        const result2 = await collection.findOneAndUpdate(
          { _id: oid },
          { $set: updates },
          { returnDocument: 'after' }
        );
        if (result2) {
          return result2;
        }
      } catch (err) {
        // Silent fallback failure
      }
    }

    throw new Error(`Record with id ${id} not found in ${collectionName}`);
  } catch (error) {
    console.error(`❌ Error updating in ${collectionName}:`, error.message);
    throw error;
  }
}

/**
 * Delete a document
 * 
 * @param {string} collectionName - Collection name
 * @param {string} id - Document ID
 * @returns {Promise<Object>} Deleted document
 */
export async function deleteRecord(collectionName, id) {
  try {
    const db = getMongoDb();
    const collection = db.collection(collectionName);

    const result = await collection.findOneAndDelete({ id: id });

    if (!result.value) {
      throw new Error(`Record with id ${id} not found`);
    }

    console.log(`✅ Deleted ${collectionName} record: ${id}`);
    return result.value;
  } catch (error) {
    console.error(`❌ Error deleting from ${collectionName}:`, error.message);
    throw error;
  }
}

/**
 * Get count of documents in collection
 * 
 * @param {string} collectionName - Collection name
 * @param {Object} condition - Optional filter condition
 * @returns {Promise<number>} Number of documents
 */
export async function count(collectionName, condition = {}) {
  try {
    const db = getMongoDb();
    const collection = db.collection(collectionName);
    const totalCount = await collection.countDocuments(condition);
    return totalCount;
  } catch (error) {
    console.error(`❌ Error counting in ${collectionName}:`, error.message);
    throw error;
  }
}

/**
 * Clear all documents in collection (for testing)
 * 
 * @param {string} collectionName - Collection name
 * @returns {Promise<void>}
 */
export async function clearAll(collectionName) {
  try {
    const db = getMongoDb();
    const collection = db.collection(collectionName);
    const result = await collection.deleteMany({});
    console.warn(`⚠️  Cleared ${result.deletedCount} ${collectionName} documents`);
  } catch (error) {
    console.error(`❌ Error clearing ${collectionName}:`, error.message);
    throw error;
  }
}

// ============================================================================
// PHARMACY-SPECIFIC FUNCTIONS
// ============================================================================

/**
 * Get all pharmacies
 */
export async function getPharmacies() {
  return readData('pharmacies');
}

/**
 * Get pharmacy by ID
 */
export async function getPharmacyById(id) {
  return findById('pharmacies', id);
}

/**
 * Create new pharmacy
 */
export async function createPharmacy(pharmacyData) {
  const id = 'pharmacy-' + Date.now();
  const pharmacy = {
    id,
    ...pharmacyData,
    created_at: new Date().toISOString(),
    is_active: pharmacyData.is_active !== false
  };

  return create('pharmacies', pharmacy);
}

/**
 * Update pharmacy
 */
export async function updatePharmacy(id, updates) {
  return update('pharmacies', id, updates);
}

/**
 * Delete pharmacy
 */
export async function deletePharmacy(id) {
  return deleteRecord('pharmacies', id);
}

export default {
  initializeDataFiles,
  readData,
  writeData,
  findById,
  findMany,
  create,
  update,
  deleteRecord,
  count,
  clearAll,
  getPharmacies,
  getPharmacyById,
  createPharmacy,
  updatePharmacy,
  deletePharmacy
};
