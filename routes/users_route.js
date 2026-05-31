/*
 * Users router
 * ------------
 * This single router handles three endpoints required by the spec:
 *   POST /api/add        — add a new user
 *   GET  /api/users      — list all users
 *   GET  /api/users/:id  — details of one user, including total costs
 */

const express = require('express');
const router = express.Router();

const { validateUserInput, validateUserIdParam } = require('../utils/users_utils');
const { addUser, getUsers, getUserDetails } = require('../controllers/users_controller');

// POST route to add a new user
// Requires id, first_name, last_name, and birthday in the body
router.post('/', async (req, res) => {
        let httpStatusCode = 201;
        let responseBody = null;

        try {
                // retrieve fields from request body
                const { id, first_name, last_name, birthday } = req.body;
                
                // delegate validation to a separate focused function
                const validationOutcome = validateUserInput(id, first_name, last_name, birthday);
                
                if (!validationOutcome.isValid) {
                        httpStatusCode = 400;
                        responseBody = {
                                id: validationOutcome.errorId,
                                message: validationOutcome.errorMessage
                        };
                } else {
                        // create user via controller
                        responseBody = await addUser(
                                validationOutcome.numericId, 
                                first_name, 
                                last_name, 
                                validationOutcome.parsedBirthday
                        );
                }
        } catch (error) {
                // handle mongodb duplicate key error
                const isDuplicateError = error && error.code === 11000;
                if (isDuplicateError) {
                        httpStatusCode = 409;
                        responseBody = {
                                id: 'USER_ALREADY_EXISTS',
                                message: 'A user with this id already exists'
                        };
                } else {
                        httpStatusCode = 400;
                        responseBody = {
                                id: 'ADD_USER_ERROR',
                                message: error.message
                        };
                }
        }

        return res.status(httpStatusCode).json(responseBody);
});

// GET route to return all users
// Queries the database to list all existing users
router.get('/', async (req, res) => {
        let httpStatusCode = 200;
        let usersList = null;

        try {
                // fetch all user documents via controller
                usersList = await getUsers();
        } catch (error) {
                // handle db errors
                httpStatusCode = 500;
                usersList = {
                        id: 'GET_USERS_ERROR',
                        message: error.message
                };
        }

        return res.status(httpStatusCode).json(usersList);
});

// GET route to fetch a single user by their id
// Also fetches their total computed costs
router.get('/:userId', async (req, res) => {
        let httpStatusCode = 200;
        let userDetailsResponse = null;

        try {
                // validate user id from the url params
                const validationOutcome = validateUserIdParam(req.params.userId);

                if (!validationOutcome.isValid) {
                        httpStatusCode = 400;
                        userDetailsResponse = {
                                id: 'VALIDATION_ERROR',
                                message: 'User id must be an integer number'
                        };
                } else {
                        const userIdNumber = validationOutcome.numericId;
                        
                        try {
                                userDetailsResponse = await getUserDetails(userIdNumber);
                        } catch (error) {
                                if (error.name === 'USER_NOT_FOUND') {
                                        httpStatusCode = 404;
                                        userDetailsResponse = {
                                                id: 'USER_NOT_FOUND',
                                                message: error.message
                                        };
                                } else {
                                        throw error; // rethrow to be caught by outer catch block
                                }
                        }
                }
        } catch (error) {
                // catch unexpected runtime errors
                httpStatusCode = 500;
                userDetailsResponse = {
                        id: 'GET_USER_ERROR',
                        message: error.message
                };
        }

        return res.status(httpStatusCode).json(userDetailsResponse);
});

module.exports = router;
