const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { findCompletedWorkout, findExercise } = require('../middleware/find');
const { CompletedWorkout, TargetExercise, CompletedExercise, Exercise, Muscle , Workout, User, sequelize } = require('../sequelize');
const prefix = "/:completedWorkoutId/completed_exercises";

router.get(prefix + '/:id', [auth, findCompletedWorkout], async (req, res) => {
  const completed_exercise = await CompletedExercise.findOne({ where: { id: req.params.id }});

  if (!completed_exercise) {
    res.status(404).send('Completed exercise with submitted ID not found');
  } else {
    const completed_workout = await CompletedWorkout.findOne({ where: { id: completed_exercise.completedWorkoutId }});
    if (req.user.id !== completed_workout.userId) {
      res.status(403).send('Forbidden');
    } else {
      res.send(completed_exercise);
    }
  }
});

router.post(prefix, [auth, findCompletedWorkout, findExercise], async (req, res) => {
  if (req.user.id !== req.completed_workout.userId) {
    res.status(403).send('Forbidden');
  }

  try {
    const completed_exercise = await CompletedExercise.create({
      exerciseId: req.exercise.id,
      completedWorkoutId: req.completed_workout.id,
      exercise_type: req.body.exercise_type,
      unilateral: req.body.unilateral === undefined ? false : req.body.unilateral, // because defaults not triggered by findByIdAndUpdate
      sets: req.body.sets,
      reps: req.body.reps,
      load: req.body.load || 0, // because defaults not triggered by findByIdAndUpdate
    });
    res.send(completed_exercise);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put(prefix + '/:id', [auth, findCompletedWorkout, findExercise], async (req, res) => {
  if (req.user.id !== req.completed_workout.userId) {
    res.status(403).send('Forbidden');
  }

  let completed_exercise = await CompletedExercise.findOne({ where: { id: req.params.id }});

  if (!completed_exercise) {
    return res.status(404).send('Completed exercise with submitted ID not found');
  }

  try {
      const updated_completed_exercise = await completed_exercise.update({
        exerciseId: req.exercise.id,
        completedWorkoutId: req.completed_workout.id,
        exercise_type: req.body.exercise_type,
        unilateral: req.body.unilateral === undefined ? false : req.body.unilateral, // because defaults not triggered by findByIdAndUpdate
        sets: req.body.sets,
        reps: req.body.reps,
        load: req.body.load || completed_exercise.load, // because defaults not triggered by findByIdAndUpdate
      });
      res.send(updated_completed_exercise);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete(prefix + '/:id', auth, async (req, res) => {
  const completed_exercise = await CompletedExercise.findOne({ where: { id: req.params.id }});

  if (!completed_exercise) {
    res.status(404).send('Completed exercise with submitted ID not found');
  } else {
    const completed_workout = await CompletedWorkout.findOne({ where: { id: completed_exercise.completedWorkoutId }});
    if (req.user.id !== completed_workout.userId) {
      res.status(403).send('Forbidden');
    } else {
      await completed_exercise.destroy();
      res.send(completed_exercise);
    }
  }
});

module.exports = router;
