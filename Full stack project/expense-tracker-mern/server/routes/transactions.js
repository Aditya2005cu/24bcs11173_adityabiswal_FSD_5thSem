const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// @route   GET /api/transactions
// @desc    Get all transactions (sorted newest first)
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1, createdAt: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching transactions' });
  }
});

// @route   POST /api/transactions
// @desc    Add a new transaction
router.post('/', async (req, res) => {
  try {
    const { title, amount, type, category, date } = req.body;

    if (!title || !amount || !type || !date) {
      return res.status(400).json({ error: 'Please fill in all required fields' });
    }

    const newTransaction = await Transaction.create({
      title,
      amount: Number(amount),
      type,
      category: category || 'General',
      date,
    });

    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(200).json({ message: 'Transaction deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Invalid transaction ID' });
  }
});

module.exports = router;