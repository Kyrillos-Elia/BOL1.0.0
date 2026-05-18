/**
 * ============================================================================
 * Brothers of Lord - Comprehensive Medical Pharmacy & Family Management System
 * ============================================================================
 * Backend: Node.js + Express.js
 * Database: JSON Files (Local Storage)
 * Frontend: Arabic RTL - Vanilla JavaScript + HTML5
 * ============================================================================
 * 
 * PURPOSE:
 * This is the main server file that initializes the Express.js application,
 * sets up middleware, and mounts all API routes for managing pharmacy data,
 * families, medicines, and distributions.
 * 
 * STRUCTURE:
 * - Middleware setup (CORS, body parsing)
 * - Routes initialization (API endpoints)
 * - Static files serving (HTML, CSS, JS)
 * - Error handling
 * - Server startup
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import authRouter from './routes/auth.js';
import familiesRouter from './routes/families.js';
import medicinesRouter from './routes/medicines.js';
import distributionsRouter from './routes/distributions.js';
import pharmaciesRouter from './routes/pharmacies.js';
import usersRouter from './routes/users.js';
import statsRouter from './routes/stats.js';
import importExportRouter from './routes/import-export.js';
import { initializeDataFiles } from './utils/dataManager.js';

// Get directory name (ES modules don't have __dirname by default)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express application
const app = express();

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

/**
 * CORS Middleware:
 * - Allows requests from frontend (same server or different origins)
 * - Permits standard HTTP methods (GET, POST, PUT, DELETE)
 * - Allows JSON content type headers
 */
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/**
 * Body Parser Middleware:
 * - Parses incoming request bodies as JSON (max 50MB for large imports)
 * - Parses URL-encoded data
 */
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

/**
 * Static Files Middleware:
 * - Serves HTML, CSS, JS, images from 'public' directory
 * - This allows the frontend to access assets
 */
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

const JWT_SECRET = process.env.JWT_SECRET || 'pharmacy-secret-key-2024';

/**
 * Middleware to verify JWT token and extract user info
 * The token is sent in the Authorization header: Bearer <token>
 */
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    // Continue without user info (some endpoints don't need auth)
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Continue without user info if token is invalid
    console.error('Token verification error:', error.message);
    next();
  }
};

app.use(verifyToken);

// ============================================================================
// INITIALIZE DATA FILES
// ============================================================================

/**
 * Before starting the server, ensure all required JSON data files exist
 * If they don't exist, create them with default/sample data
 */
console.log('🔧 Initializing data files...');
initializeDataFiles();
console.log('✅ Data files initialized');

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * All API endpoints are mounted at /api/* paths
 * Each router handles a specific domain (families, medicines, etc.)
 */

// Authentication API - Login and signup
app.use('/api/auth', authRouter);

// Families API - CRUD operations for family records
app.use('/api/families', familiesRouter);

// Medicines API - Inventory management
app.use('/api/medicines', medicinesRouter);

// Distributions API - Record medicine issuance
app.use('/api/distributions', distributionsRouter);

// Pharmacies API - Pharmacy management
app.use('/api/pharmacies', pharmaciesRouter);

// Users API - Admin and staff management
app.use('/api/users', usersRouter);

// Statistics API - Dashboard and report data
app.use('/api/stats', statsRouter);

// Import/Export API - Data management
app.use('/api', importExportRouter);

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

/**
 * GET /api/health
 * Returns server status and basic information
 * Used by frontend to verify backend connectivity
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Brothers of Lord - Pharmacy System is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ============================================================================
// SERVE MAIN HTML FILE FOR ALL OTHER ROUTES
// ============================================================================

/**
 * Fallback route: Serves index.html for any path that doesn't match API routes
 * This enables client-side routing in the SPA (Single Page Application)
 */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

/**
 * Global error handler:
 * - Catches any unhandled errors
 * - Logs errors for debugging
 * - Returns standardized error response
 * 
 * ERROR TYPES:
 * - Validation errors (400) - Invalid input data
 * - Not Found errors (404) - Resource doesn't exist
 * - Server errors (500) - Unexpected server issues
 */
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error('   Stack:', err.stack);

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

/**
 * Start the Express server on specified port
 * Default port: 3000 (can be overridden with PORT environment variable)
 * 
 * WHY THIS PORT?
 * - Standard Node.js development port
 * - Doesn't require sudo/admin privileges (not port 80)
 * - Easily accessible at http://localhost:3000
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║   🏥 Brothers of Lord - Pharmacy Management System 🏥        ║');
  console.log('║                                                              ║');
  console.log('║   Backend is running successfully!                           ║');
  console.log(`║   🌐 Open: http://localhost:${PORT}                          ${''.padEnd(16 - String(PORT).length)}║`);
  console.log('║   📊 API Docs: http://localhost:' + PORT + '/api/health         ║');
  console.log('║                                                              ║');
  console.log('║   Supported Operations:                                      ║');
  console.log('║   ✅ Families Management (CRUD)                             ║');
  console.log('║   ✅ Medicines Inventory                                    ║');
  console.log('║   ✅ Medicine Distribution                                  ║');
  console.log('║   ✅ User Management & RBAC                                 ║');
  console.log('║   ✅ Reports & Statistics                                   ║');
  console.log('║   ✅ Import/Export Operations                               ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
});

export default app;
