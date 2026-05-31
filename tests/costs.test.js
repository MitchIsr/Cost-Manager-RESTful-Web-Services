/*
 * Unit tests for the costs router
 * --------------------------------
 *   POST /api/add — add a cost item
 *
 * Covers validation, user-existence check, category enum,
 * client-supplied date handling, and past-month rejection.
 */

const request = require('supertest');
const { startMongo, stopMongo, clearCollections, buildApp } = require('./helpers/test-app');

const costsRouter = require('../routes/costs_route');
const User = require('../models/user.model');
const Cost = require('../models/cost.model');

let app;

beforeAll(async () => {
	await startMongo();
	app = buildApp('/api/add', costsRouter);
});

afterAll(async () => {
	await stopMongo();
});

beforeEach(async () => {
	await clearCollections();
	// Pre-seed user 123123 for the happy-path tests
	await User.create({
		id: 123123,
		first_name: 'mosh',
		last_name: 'israeli',
		birthday: new Date('1990-01-01')
	});
});

describe('POST /api/add (cost)', () => {
	const validCost = {
		description: 'milk 9',
		category: 'food',
		userid: 123123,
		sum: 8
	};

	test('creates a cost item and echoes the document', async () => {
		const res = await request(app).post('/api/add').send(validCost);
		expect(res.status).toBe(201);
		expect(res.body.description).toBe('milk 9');
		expect(res.body.category).toBe('food');
		expect(res.body.userid).toBe(123123);
		expect(res.body.sum).toBe(8);
		expect(res.body.createdAt).toBeDefined();
	});

	test('rejects missing fields', async () => {
		const res = await request(app).post('/api/add').send({ description: 'x' });
		expect(res.status).toBe(400);
		expect(res.body.id).toBe('VALIDATION_ERROR');
	});

	test('rejects non-positive sum', async () => {
		const res = await request(app).post('/api/add').send({ ...validCost, sum: 0 });
		expect(res.status).toBe(400);
		expect(res.body.id).toBe('INVALID_SUM');
	});

	test('rejects invalid category', async () => {
		const res = await request(app).post('/api/add').send({ ...validCost, category: 'gadgets' });
		expect(res.status).toBe(400);
		expect(res.body.id).toBe('INVALID_CATEGORY');
	});

	test('rejects when user does not exist', async () => {
		const res = await request(app).post('/api/add').send({ ...validCost, userid: 999999 });
		expect(res.status).toBe(404);
		expect(res.body.id).toBe('USER_NOT_FOUND');
	});

	test('honors client-supplied date when present', async () => {
		// Use a date in the current month so it isn't rejected.
		const now = new Date();
		const dateThisMonth = new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - 1));
		const iso = dateThisMonth.toISOString();
		const res = await request(app).post('/api/add').send({ ...validCost, date: iso });
		expect(res.status).toBe(201);
		expect(new Date(res.body.createdAt).getMonth()).toBe(dateThisMonth.getMonth());
	});

	test('rejects cost dated to a previous month', async () => {
		// 1st of the previous month
		const now = new Date();
		const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const res = await request(app).post('/api/add').send({ ...validCost, date: lastMonth.toISOString() });
		expect(res.status).toBe(400);
		expect(res.body.id).toBe('PAST_DATE_NOT_ALLOWED');
	});

	test('falls back to "now" when no date is provided', async () => {
		const before = Date.now();
		const res = await request(app).post('/api/add').send(validCost);
		const after = Date.now();
		expect(res.status).toBe(201);
		const ts = new Date(res.body.createdAt).getTime();
		expect(ts).toBeGreaterThanOrEqual(before);
		expect(ts).toBeLessThanOrEqual(after + 1000);
	});
});
