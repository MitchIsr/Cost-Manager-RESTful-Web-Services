/*
 * Unit tests for the users router
 * --------------------------------
 *   POST /api/add        — add user
 *   POST /api/users      — add user (alias)
 *   GET  /api/users      — list users
 *   GET  /api/users/:id  — user details + total
 */

const request = require('supertest');
const { startMongo, stopMongo, clearCollections, buildApp } = require('./helpers/test-app');

const usersRouter = require('../routes/users_route');
const User = require('../models/user.model');
const Cost = require('../models/cost.model');

// Mount the router at both /api/add and /api/users so the test
// app mirrors the real users-service.
function makeApp() {
	const express = require('express');
	const app = express();
	app.use(express.json());
	app.use('/api/add',   usersRouter);
	app.use('/api/users', usersRouter);
	return app;
}

let app;

beforeAll(async () => {
	await startMongo();
	app = makeApp();
});

afterAll(async () => {
	await stopMongo();
});

beforeEach(async () => {
	await clearCollections();
});

// --- POST /api/add (and /api/users) ----------------------------------

describe('POST /api/add (add user)', () => {
	const validUser = {
		id: 123123,
		first_name: 'mosh',
		last_name: 'israeli',
		birthday: '1990-01-01'
	};

	test('creates a user and echoes the document', async () => {
		const res = await request(app).post('/api/add').send(validUser);
		expect(res.status).toBe(201);
		expect(res.body.id).toBe(validUser.id);
		expect(res.body.first_name).toBe(validUser.first_name);
		expect(res.body.last_name).toBe(validUser.last_name);
	});

	test('also reachable via /api/users (alias)', async () => {
		const res = await request(app).post('/api/users').send(validUser);
		expect(res.status).toBe(201);
		expect(res.body.id).toBe(123123);
	});

	test('rejects missing fields with id and message', async () => {
		const res = await request(app).post('/api/add').send({ id: 1 });
		expect(res.status).toBe(400);
		expect(res.body.id).toBe('VALIDATION_ERROR');
		expect(typeof res.body.message).toBe('string');
	});

	test('rejects non-positive integer id', async () => {
		const res = await request(app).post('/api/add').send({ ...validUser, id: -5 });
		expect(res.status).toBe(400);
		expect(res.body.id).toBe('VALIDATION_ERROR');
	});

	test('rejects unparseable birthday', async () => {
		const res = await request(app).post('/api/add').send({ ...validUser, birthday: 'not a date' });
		expect(res.status).toBe(400);
		expect(res.body.id).toBe('VALIDATION_ERROR');
	});

	test('rejects duplicate id with 409', async () => {
		await request(app).post('/api/add').send(validUser).expect(201);
		const res = await request(app).post('/api/add').send(validUser);
		expect(res.status).toBe(409);
		expect(res.body.id).toBe('USER_ALREADY_EXISTS');
	});
});

// --- GET /api/users --------------------------------------------------

describe('GET /api/users', () => {
	test('returns an empty array when no users exist', async () => {
		const res = await request(app).get('/api/users');
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
		expect(res.body.length).toBe(0);
	});

	test('returns every user with the same property names as the collection', async () => {
		await User.create({ id: 1, first_name: 'a', last_name: 'b', birthday: new Date('2000-01-01') });
		await User.create({ id: 2, first_name: 'c', last_name: 'd', birthday: new Date('2001-01-01') });

		const res = await request(app).get('/api/users');
		expect(res.status).toBe(200);
		expect(res.body.length).toBe(2);
		expect(res.body[0]).toHaveProperty('first_name');
		expect(res.body[0]).toHaveProperty('last_name');
		expect(res.body[0]).toHaveProperty('birthday');
		expect(res.body[0]).toHaveProperty('id');
	});
});

// --- GET /api/users/:id ----------------------------------------------

describe('GET /api/users/:id', () => {
	test('returns 404 when user not found', async () => {
		const res = await request(app).get('/api/users/999999');
		expect(res.status).toBe(404);
		expect(res.body.id).toBe('USER_NOT_FOUND');
	});

	test('returns 400 on non-numeric id', async () => {
		const res = await request(app).get('/api/users/abc');
		expect(res.status).toBe(400);
		expect(res.body.id).toBe('VALIDATION_ERROR');
	});

	test('returns id, first_name, last_name, total with total=0 when no costs', async () => {
		await User.create({ id: 123123, first_name: 'mosh', last_name: 'israeli', birthday: new Date('1990-01-01') });
		const res = await request(app).get('/api/users/123123');
		expect(res.status).toBe(200);
		expect(res.body).toEqual({
			id: 123123,
			first_name: 'mosh',
			last_name: 'israeli',
			total: 0
		});
	});

	test('total sums all of the user\'s costs', async () => {
		await User.create({ id: 1, first_name: 'a', last_name: 'b', birthday: new Date('1990-01-01') });
		await Cost.create({ description: 'milk', category: 'food',      userid: 1, sum: 10, createdAt: new Date() });
		await Cost.create({ description: 'book', category: 'education', userid: 1, sum: 20, createdAt: new Date() });
		// Other user's cost shouldn't be counted
		await User.create({ id: 2, first_name: 'c', last_name: 'd', birthday: new Date('1990-01-01') });
		await Cost.create({ description: 'gym',  category: 'sports',    userid: 2, sum: 99, createdAt: new Date() });

		const res = await request(app).get('/api/users/1');
		expect(res.status).toBe(200);
		expect(res.body.total).toBe(30);
	});
});
