const express = require('express');
const router = express.Router();
const Cost = require('../models/costs');

router.post('/', async (req, res) => {
    try {
        const cost = await Cost.create(req.body);
        res.status(201).json(cost);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
