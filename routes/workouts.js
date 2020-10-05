const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { TargetExercise, Exercise, Muscle , Workout, User, sequelize } = require('../sequelize');

router.get('/', auth, async (req, res) => {
  const workouts = await Workout.findAll({
    where: { userId: req.user.id},
    include: [{
      model: TargetExercise,
      required: false
    }]
  // target exercises
  // workout
  // exercise
  });
  res.send(workouts);
});

router.post('/', auth, async (req, res) => {
  try {
    const workout = await Workout.create({
      userId: req.user.id,
      name: req.body.name,
    });
    res.send(workout);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/:id', auth, async (req, res) => {
  const workout = await Workout.findOne({
    where: { id: req.params.id },
    include: {
      model: TargetExercise,
      where: { workoutId: req.params.id },
      required: false
    }
  });

  if (!workout) {
    res.status(404).send('Workout with submitted ID not found');
  } else { // Check for current user
    if (req.user.id !== workout.userId) {
      res.status(403).send('Forbidden');
    } else {
      res.send(workout);
    }
  }
});

router.put('/:id', auth, async (req, res) => {
  let workout = await Workout.findOne({ where: { id: req.params.id } });
  if (!workout) {
    return res.status(404).send('Workout with submitted ID not found');
  }

  try {
    const updated_workout = await workout.update({
      userId: req.body.userId,
      name: req.body.name
    });
    res.send(updated_workout);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', auth, async (req, res) => {
  const workout = await Workout.findOne({ where: { id: req.params.id } });
  if (!workout) {
    res.status(404).send('Workout ID not found');
  } else {
    await workout.destroy(); // Auto-deletes target_exercises
    res.send(workout);
  }
});



module.exports = router;
