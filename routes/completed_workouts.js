const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { CompletedWorkout, TargetExercise, CompletedExercise, Exercise, Muscle , Workout, User, sequelize } = require('../sequelize');

router.get('/', auth, async (req, res) => {
  const completed_workouts = await CompletedWorkout.findAll({
    where: { userId: req.user.id},
    include: [{
      model: CompletedExercise,
      required: false
    }]
  // target exercises
  // workout
  // exercise
  });
  res.send(completed_workouts);
});

router.post('/', auth, async (req, res) => {
  try {
    const completed_workout = await CompletedWorkout.create({
      userId: req.user.id,
    });
    res.send(completed_workout);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/:id', auth, async (req, res) => {
  const completed_workout = await CompletedWorkout.findOne({
    where: { id: req.params.id },
    include: {
      model: CompletedExercise,
      where: { completedWorkoutId: req.params.id },
      required: false
    }
  });

  if (!completed_workout) {
    res.status(404).send('Completed Workout with submitted ID not found');
  } else { // Check for current user
    if (req.user.id !== completed_workout.userId) {
      res.status(403).send('Forbidden');
    } else {
      res.send(completed_workout);
    }
  }
});

router.put('/:id', auth, async (req, res) => {
  let completed_workout = await CompletedWorkout.findOne({ where: { id: req.params.id } });
  if (!completed_workout) {
    return res.status(404).send('Completed Workout with submitted ID not found');
  }

  try {
    const updated_completed_workout = await completed_workout.update({
      userId: req.body.userId,
      date: req.body.date
    });
    res.send(updated_completed_workout);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', auth, async (req, res) => {
  const completed_workout = await CompletedWorkout.findOne({ where: { id: req.params.id } });
  if (!completed_workout) {
    res.status(404).send('Completed Workout ID not found');
  } else {
    await completed_workout.destroy(); // Auto-deletes completed_exercises
    res.send(completed_workout);
  }
});



module.exports = router;
