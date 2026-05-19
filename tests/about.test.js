/*
 * Unit tests for the about router
 * --------------------------------
 *   GET /api/about
 *
 * The spec is strict: only first_name + last_name; no extra fields.
 */

const request = require('supertest');
const express = require('express');

const aboutRouter = require('../routes/about');

function makeApp() {
	const app = express();
	app.use('/api/about', aboutRouter);
	return app;
}

describe('GET /api/about', () => {
	const app = makeApp();

	test('returns 200 and an array', async () => {
		const res = await request(app).get('/api/about');
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
	});

	test('each entry has only first_name and last_name (no extras)', async () => {
		const res = await request(app).get('/api/about');
		expect(res.body.length).toBeGreaterThan(0);
		res.body.forEach((member) => {
			expect(Object.keys(member).sort()).toEqual(['first_name', 'last_name']);
			expect(typeof member.first_name).toBe('string');
			expect(typeof member.last_name).toBe('string');
		});
	});
});
