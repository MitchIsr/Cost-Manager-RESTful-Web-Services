/*
 * Costs route — POST /api/add (cost item)
 * ---------------------------------------
 * Add a new cost item for a given user.
 */

const express = require('express');
const router = express.Router();

const { validateCostInput, validateCostDate } = require('../utils/costs_utils');
const { addCost } = require('../controllers/costs_controller');

// POST route to handle creating a new cost.
// Handles validation internally by relying on decoupled validators.
router.post('/', async (req, res) => {
        try {
                // fetch inputs from request payload
                const { description, category, userid, sum, date, createdAt } = req.body;

                const inputValidation = validateCostInput(description, category, userid, sum);
                if (!inputValidation.isValid) {
                        return res.status(400).json({
                                id: inputValidation.errorId,
                                message: inputValidation.errorMessage
                        });
                }

                // accept both date and createdAt for flexibility
                const rawDate = date || createdAt;
                const dateValidation = validateCostDate(rawDate);
                if (!dateValidation.isValid) {
                        // handle issues parsing the requested date string
                        return res.status(400).json({
                                id: dateValidation.errorId,
                                message: dateValidation.errorMessage
                        });
                }

                const userIdNumber = inputValidation.userIdNumber;
                const newCostDate = dateValidation.parsedCostDate;
                
                // delegate business logic to controller
                const savedCostRecord = await addCost(description, category, userIdNumber, sum, newCostDate);

                // returning the newly instantiated document back to user
                return res.status(201).json(savedCostRecord);

        } catch (error) {
                if (error.name === 'USER_NOT_FOUND') {
                        return res.status(404).json({
                                id: 'USER_NOT_FOUND',
                                message: error.message
                        });
                }
                
                // safely catch runtime or external network db errors
                return res.status(400).json({
                        id: 'ADD_COST_ERROR',
                        message: error.message
                });
        }
});

module.exports = router;
