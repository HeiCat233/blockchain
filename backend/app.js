/*
 * Filename: app.js
 * Function: DID System Backend Service
 * Author: Project Dev Team
 * Date: 2024-06-14
 * Description: RESTful API service for Decentralized Identity Management
 */

// ======================================================================
// Module Imports
// ======================================================================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const SimpleChainmakerClient = require('./chainmaker-client');

// ======================================================================
// Service Initialization
// ======================================================================

const app = express();
const PORT = process.env.PORT || 3000;

// ======================================================================
// Middleware Configuration
// ======================================================================

app.use(cors());
app.use(bodyParser.json());

// ======================================================================
// Blockchain Client Initialization
// ======================================================================

const chainClient = new SimpleChainmakerClient();

// ======================================================================
// API Routes
// ======================================================================

/*
 * Health Check Endpoint
 * Method: GET
 * Path: /health
 * Description: Check if service is running
 * Response: Service status
 */
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'DID System Service Running'
    });
});

/*
 * Register Identity Endpoint
 * Method: POST
 * Path: /api/identity/register
 * Description: Register a new digital identity
 * Request Body:
 *   {
 *     "controller": "did:chainmaker:admin123",   // Identity controller
 *     "did": "did:chainmaker:user001",            // DID identifier
 *     "publicKey": "-----BEGIN PUBLIC KEY----..."  // Public key
 *   }
 * Response: Registration result
 */
app.post('/api/identity/register', async (req, res) => {
    try {
        const { controller, did, publicKey } = req.body;
        const result = await chainClient.registerIdentity(controller, did, publicKey);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
 * Query Identity Endpoint
 * Method: GET
 * Path: /api/identity/:did
 * Description: Get complete identity information by DID
 * Parameters:
 *   - did: DID identifier from URL path
 * Response: Identity document
 */
app.get('/api/identity/:did', async (req, res) => {
    try {
        const did = req.params.did;
        const result = await chainClient.queryIdentity(did);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
 * Verify Identity Endpoint
 * Method: GET
 * Path: /api/identity/:did/verify
 * Description: Verify if identity is valid (exists and active)
 * Parameters:
 *   - did: DID identifier from URL path
 * Response: Verification result with valid flag
 */
app.get('/api/identity/:did/verify', async (req, res) => {
    try {
        const did = req.params.did;
        const result = await chainClient.verifyIdentity(did);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
 * Update Identity Endpoint
 * Method: PUT
 * Path: /api/identity/:did
 * Description: Update identity's public key, requires controller permission
 * Parameters:
 *   - did: DID identifier from URL path
 * Request Body:
 *   {
 *     "controller": "did:chainmaker:admin123",  // Permission check
 *     "publicKey": "NEW_PUBLIC_KEY"             // New public key
 *   }
 * Response: Update result
 */
app.put('/api/identity/:did', async (req, res) => {
    try {
        const did = req.params.did;
        const { controller, publicKey } = req.body;
        const result = await chainClient.updateIdentity(controller, did, publicKey);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/*
 * Revoke Identity Endpoint
 * Method: DELETE
 * Path: /api/identity/:did
 * Description: Mark identity as revoked, makes it invalid
 * Parameters:
 *   - did: DID identifier from URL path
 * Request Body:
 *   {
 *     "controller": "did:chainmaker:admin123"  // Permission check
 *   }
 * Response: Revocation result
 */
app.delete('/api/identity/:did', async (req, res) => {
    try {
        const did = req.params.did;
        const { controller } = req.body;
        const result = await chainClient.revokeIdentity(controller, did);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ======================================================================
// Start Server
// ======================================================================

/*
 * Start Express Server
 * Listen on specified port and print info on success
 */
app.listen(PORT, () => {
    console.log(`=== Decentralized DID System Started ===`);
    console.log(`Service URL: http://localhost:${PORT}`);
    console.log(`Health Check: http://localhost:${PORT}/health`);
});
