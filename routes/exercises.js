const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { findMuscle } = require('../middleware/find');
const { Muscle, Exercise } = require('../sequelize');

router.get('/', auth, async (req, res) => {
  const exercises = await Exercise.findAll();
  res.send(exercises);
});

router.get('/:id', [auth, admin], async (req, res) => {
  const exercise = await Exercise.findOne({ where: { id: req.params.id }});
  if (!exercise) {
    res.status(404).send('Exercise with submitted ID not found');
  } else {
    res.send(exercise);
  }
});

router.post('/', [auth, admin, findMuscle], async (req, res) => {
  try {
    const exercise = await Exercise.create({
      name: req.body.name,
      muscleId: req.body.muscle.id
    });
    res.send(exercise);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put('/:id', [auth, admin, findMuscle], async (req, res) => {
  const exercise = await Exercise.findOne({ where: { id: req.params.id }});
  if (!exercise) {
    return res.status(404).send('Exercise with submitted ID not found');
  }
  try {
    const updated_exercise = await exercise.update({
      name: req.body.name,
      muscleId: req.body.muscle.id
    });
    res.send(updated_exercise);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const exercise = await Exercise.findOne({ where: { id: req.params.id }});
  if (!exercise) {
    res.status(404).send('Exercise with submitted ID not found');
  } else {
    await muscle.destroy();
    res.send(exercise);
  }
});

module.exports = router;
