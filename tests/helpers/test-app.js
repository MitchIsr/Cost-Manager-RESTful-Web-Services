/*
 * test-app.js
 * -----------
 * Shared test harness for the Jest suites. Builds an in-memory
 * MongoDB instance via mongodb-memory-server, points Mongoose at it,
 * and exposes a factory that wraps each route in a minimal Express
 * app for Supertest to drive.
 *
 * No production code is touched by the tests — each suite builds
 * exactly the Express surface it needs.
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const express = require('express');

let mongod;

// Start in-memory Mongo and connect Mongoose to it.
async function startMongo() {
	mongod = await MongoMemoryServer.create();
	const uri = mongod.getUri();
	await mongoose.connect(uri);
}

// Disconnect Mongoose and stop the in-memory server.
async function stopMongo() {
	await mongoose.disconnect();
	if (mongod) await mongod.stop();
}

// Empty every collection between tests for isolation
async function clearCollections() {
	const collections = mongoose.connection.collections;
	for (const key of Object.keys(collections)) {
		await collections[key].deleteMany({});
	}
}

// Build a tiny Express app that mounts the given router at the given path.
function buildApp(mountPath, router) {
	const app = express();
	app.use(express.json());
	app.use(mountPath, router);
	return app;
}

module.exports = {
	startMongo,
	stopMongo,
	clearCollections,
	buildApp
};
