/*
 * Unit tests for the report router
 * ---------------------------------
 *   GET /api/report?id=&year=&month=
 *
 * Verifies shape, empty-category behavior, and Computed Design Pattern
 * caching for past months.
 */

const request = require('supertest');
const { startMongo, stopMongo, clearCollections, buildApp } = require('./helpers/test-app');

const reportRouter = require('../routes/report');
const Cost = require('../models/cost.model');
const Report = require('../models/report.model');

let app;

beforeAll(async () => {
	await startMongo();
	app = buildApp('/api/report', reportRouter);
});

afterAll(async () => {
	await stopMongo();
});

beforeEach(async () => {
	await clearCollections();
});

describe('GET /api/report', () => {
	test('rejects missing query params', async () => {
		const res = await request(app).get('/api/report');
		expect(res.status).toBe(400);
		expect(res.body.id).toBe('VALIDATION_ERROR');
	});

	test('rejects month out of 1..12', async () => {
		const res = await request(app).get('/api/report?id=1&year=2026&month=13');
		expect(res.status).toBe(400);
		expect(res.body.id).toBe('INVALID_MONTH');
	});

	test('returns all 5 categories even when there are no costs', async () => {
		const now = new Date();
		const res = await request(app).get(`/api/report?id=1&year=${now.getFullYear()}&month=${now.getMonth() + 1}`);
		expect(res.status).toBe(200);
		expect(res.body.userid).toBe(1);
		expect(Array.isArray(res.body.costs)).toBe(true);
		const keys = res.body.costs.map((c) => Object.keys(c)[0]).sort();
		expect(keys).toEqual(['education', 'food', 'health', 'housing', 'sports']);
		res.body.costs.forEach((entry) => {
			expect(Array.isArray(entry[Object.keys(entry)[0]])).toBe(true);
		});
	});

	test('groups costs by category with sum, description, day', async () => {
		const now = new Date();
		await Cost.create({
			description: 'choco', category: 'food', userid: 7, sum: 12,
			createdAt: new Date(now.getFullYear(), now.getMonth(), 17, 10)
		});
		await Cost.create({
			description: 'math book', category: 'education', userid: 7, sum: 82,
			createdAt: new Date(now.getFullYear(), now.getMonth(), 10, 10)
		});

		const res = await request(app).get(
			`/api/report?id=7&year=${now.getFullYear()}&month=${now.getMonth() + 1}`
		);
		expect(res.status).toBe(200);
		const foodBucket = res.body.costs.find((c) => 'food' in c).food;
		expect(foodBucket).toEqual([{ sum: 12, description: 'choco', day: 17 }]);
		const eduBucket = res.body.costs.find((c) => 'education' in c).education;
		expect(eduBucket).toEqual([{ sum: 82, description: 'math book', day: 10 }]);
	});

	test('Computed Design Pattern: caches reports for past months', async () => {
		// Pick a month known to be in the past
		const now = new Date();
		const past = new Date(now.getFullYear(), now.getMonth() - 2, 15);
		const year = past.getFullYear();
		const month = past.getMonth() + 1;

		// Seed a cost inside the report's month so the cached value isn't empty
		await Cost.create({
			description: 'cached item', category: 'food', userid: 5, sum: 33,
			createdAt: past
		});

		// First call should compute AND cache
		await request(app).get(`/api/report?id=5&year=${year}&month=${month}`).expect(200);

		const cached = await Report.findOne({ userid: 5, year, month });
		expect(cached).not.toBeNull();
		expect(cached.report.userid).toBe(5);

		// Mutate the cache to prove the second call reads from cache, not from costs.
		// Use updateOne so Mongoose definitely persists changes to the Mixed field.
		await Report.updateOne(
			{ userid: 5, year, month },
			{ $set: { 'report.costs': [{ food: [{ sum: 999, description: 'from-cache', day: 1 }] }] } }
		);

		const second = await request(app).get(`/api/report?id=5&year=${year}&month=${month}`);
		expect(second.body.costs[0].food[0].description).toBe('from-cache');
	});

	test('does NOT cache reports for the current month', async () => {
		const now = new Date();
		await request(app).get(`/api/report?id=8&year=${now.getFullYear()}&month=${now.getMonth() + 1}`).expect(200);
		const cached = await Report.findOne({ userid: 8 });
		expect(cached).toBeNull();
	});
});
