/*
 * Unit tests for the logs router
 * -------------------------------
 *   GET /api/logs
 */

const request = require('supertest');
const { startMongo, stopMongo, clearCollections, buildApp } = require('./helpers/test-app');

const logsRouter = require('../routes/logs');
const Log = require('../models/log.model');

let app;

beforeAll(async () => {
	await startMongo();
	app = buildApp('/api/logs', logsRouter);
});

afterAll(async () => {
	await stopMongo();
});

beforeEach(async () => {
	await clearCollections();
});

describe('GET /api/logs', () => {
	test('returns an empty array when nothing logged', async () => {
		const res = await request(app).get('/api/logs');
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
		expect(res.body.length).toBe(0);
	});

	test('returns every log document, newest first', async () => {
		const older = new Date('2024-01-01T00:00:00Z');
		const newer = new Date('2025-01-01T00:00:00Z');

		await Log.create({ method: 'GET', path: '/a', status: 200, message: 'a', timestamp: older });
		await Log.create({ method: 'GET', path: '/b', status: 200, message: 'b', timestamp: newer });

		const res = await request(app).get('/api/logs');
		expect(res.status).toBe(200);
		expect(res.body.length).toBe(2);
		// Sorted by timestamp DESC — newest first
		expect(res.body[0].path).toBe('/b');
		expect(res.body[1].path).toBe('/a');
	});

	test('each log has the schema fields', async () => {
		await Log.create({ method: 'GET', path: '/x', status: 200, message: 'x', timestamp: new Date() });
		const res = await request(app).get('/api/logs');
		expect(res.body[0]).toHaveProperty('method');
		expect(res.body[0]).toHaveProperty('path');
		expect(res.body[0]).toHaveProperty('status');
		expect(res.body[0]).toHaveProperty('message');
		expect(res.body[0]).toHaveProperty('timestamp');
	});
});
