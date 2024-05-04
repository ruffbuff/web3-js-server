/**
 * Web3.js Express.js server
 *
 * This script sets up an Express.js server that listens for Web3.js events
 * on an Ethereum contract. The server is configured using environment
 * variables:
 *   - RPC_URL: URL of the Ethereum JSON-RPC API
 *   - CONTRACT_ADDRESS: Address of the Ethereum contract to listen to
 *   - CONTRACT_ABI: ABI of the Ethereum contract
 *   - EVENT_NAMES: Names of events to listen to (as a JSON array)
 *
 * The server logs a message to the console every time it receives
 * an event from the contract. If there is an error listening to the
 * events, the server logs the error.
 *
 * The server also logs messages to the console when the WebSocket
 * provider connects or disconnects. If there is an error from the
 * provider, the server logs the error.
 */
const express = require('express');
const Web3 = require('web3');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Check if RPC_URL is defined in .env file. If not, exit the script.
if (!process.env.RPC_URL) {
    console.error('No RPC_URL found in .env file');
    process.exit(1);
}

// Create a new Web3.js instance using the WebSocket provider.
// The .replace() method is used to change the protocol from "https"
// to "wss" to use the WebSocket protocol.
const web3 = new Web3(process.env.RPC_URL.replace('https', 'wss'));

// Use the JSON middleware to parse incoming HTTP requests
// with a JSON payload.
app.use(express.json());

/**
 * Listen to Web3.js events
 */
async function listenToEvents() {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const contractABI = JSON.parse(process.env.CONTRACT_ABI);
    const eventNames = JSON.parse(process.env.EVENT_NAMES);

    // Create a new Web3.js contract instance
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    // Loop over event names
    eventNames.forEach(eventName => {
        // Listen to events with given name
        // The first argument is options, which we set to an empty object
        // The second argument is a callback function that is called whenever
        // an event is received
        contract.events[eventName]({}, (error, event) => {
            if (error) {
                console.error('Error listening to events:', error);
            } else {
                console.log('Received event:', event);
            }
        });
    });
}

// Call the listenToEvents() function and log any errors that occur.
listenToEvents().catch(error => {
    console.error('Error listening to events:', error);
});

/**
 * Log a message to the console when the provider connects
 */
web3.currentProvider.on('connect', () => {
    console.log('Connected to provider');
});

/**
 * Log a message to the console when the provider disconnects
 */
web3.currentProvider.on('disconnect', () => {
    console.log('Disconnected from provider');
});

/**
 * Log an error to the console when there is an error from the provider
 */
web3.currentProvider.on('error', error => {
    console.error('Provider error:', error);
});

/**
 * Handle HTTP GET request to '/' by sending a message back to the client.
 */
app.get('/', (req, res) => {
    res.send('Whats up!');
});

/**
 * Start the server on the port defined in the PORT environment variable
 * or 3000 by default.
 */
app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});

