/*
 * About route — GET /api/about
 * ----------------------------
 * Returns the team members (first_name + last_name only).
 * Per spec, the team-member data is NOT stored in the database — that
 * way the submission database can stay empty except for the single
 * imaginary user. The data is read from models/TeamMembers.json, which
 * is bundled with the source code.
 */

const express = require('express');
const router = express.Router();

const aboutController = require('../controllers/about');

// GET route for about
router.get('/', async (req, res) => {
        let httpStatusCode = 200;
        let teamMembersResponse;

        try {
                // The spec requires only first_name + last_name and nothing else.
                teamMembersResponse = await aboutController.getAbout();
        } catch (error) {
                // Return server validation fault on errors
                httpStatusCode = 500;
                teamMembersResponse = {
                        id: 'ABOUT_ERROR',
                        message: error.message
                };
        }

        return res.status(httpStatusCode).json(teamMembersResponse);
});

module.exports = router;
