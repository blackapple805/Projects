// routes/task.js
const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// Create Task
router.post('/', auth, async (req, res) => {
  const { title, description, dueDate, priority } = req.body;
  try {
    const newTask = await Task.create({
      userId: req.user.id,
      title,
      description,
      dueDate,
      priority
    });
    res.json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.findAll({ where: { userId: req.user.id } });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Task
router.put('/:id', auth, async (req, res) => {
  const { title, description, dueDate, priority } = req.body;
  try {
    await Task.update({ title, description, dueDate, priority }, { where: { id: req.params.id, userId: req.user.id } });
    const updatedTask = await Task.findByPk(req.params.id);
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Task
router.delete('/:id', auth, async (req, res) => {
  try {
    await Task.destroy({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ msg: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
