/*
 * Report route — GET /api/report
 * ------------------------------
 * Query params (all required): id, year, month
 *
 * Response shape (matches the sample in the spec):
 *   {
 *     userid, year, month,
 *     costs: [
 *       { food:      [{ sum, description, day }, ...] },
 *       { health:    [...] },
 *       { housing:   [...] },
 *       { sports:    [...] },
 *       { education: [...] }
 *     ]
 *   }
 *
 * Empty categories ARE included (per spec clarification dated April 30 2026).
 *
 * Computed Design Pattern
 * -----------------------
 * Building the report scans every cost item in the month. For a month
 * that has already fully passed, the data can never change (the costs
 * route refuses new cost items for past months), so we cache the
 * computed report in the `reports` collection. On subsequent requests
 * for the same {userid, year, month} we skip the aggregation and return
 * the cached document directly.
 *
 * For the current month or any future month we never cache, because new
 * costs may still be added and would invalidate the cache.
 */

const express = require('express');
const router = express.Router();

const { validateReportParams } = require('../utils/report');
const { getReport } = require('../controllers/report');

// GET route to build and retrieve a report
router.get('/', async (req, res) => {
        let httpStatusCode = 200;
        let reportResponse = null;

        try {
                // get details from express query object
                const { id, year, month } = req.query;

                const validationOutcome = validateReportParams(id, year, month);
                if (!validationOutcome.isValid) {
                        httpStatusCode = 400;
                        reportResponse = {
                                id: validationOutcome.errorId,
                                message: validationOutcome.errorMessage
                        };
                } else {
                        // let the controller handle the DB work and cache logic
                        reportResponse = await getReport(
                                validationOutcome.userId, 
                                validationOutcome.reportYear, 
                                validationOutcome.reportMonth
                        );
                }
        } catch (error) {
                httpStatusCode = 500;
                reportResponse = {
                        id: 'REPORT_ERROR',
                        message: error.message
                };
        }

        return res.status(httpStatusCode).json(reportResponse);
});

module.exports = router;
