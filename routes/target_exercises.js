const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { findWorkout, findExercise } = require('../middleware/find');
const { CompletedWorkout, TargetExercise, CompletedExercise, Exercise, Muscle , Workout, User, sequelize } = require('../sequelize');
const prefix = "/:workoutId/target_exercises";

router.get(prefix + '/:id', [auth, findWorkout], async (req, res) => {
  const target_exercise = await TargetExercise.findOne({ where: { id: req.params.id }});

  if (!target_exercise) {
    res.status(404).send('Target exercise with submitted ID not found');
  } else {
    const workout = await Workout.findOne({ where: { id: target_exercise.workoutId }});
    if (req.user.id !== workout.userId) {
      res.status(403).send('Forbidden');
    } else {
      res.send(target_exercise);
    }
  }
});

router.post(prefix, [auth, findWorkout, findExercise], async (req, res) => {
  if (req.user.id !== req.workout.userId) {
    res.status(403).send('Forbidden');
  }

  try {
    const target_exercise = await TargetExercise.create({
      exerciseId: req.exercise.id,
      workoutId: req.workout.id,
      exercise_type: req.body.exercise_type,
      unilateral: req.body.unilateral === undefined ? false : req.body.unilateral, // because defaults not triggered by findByIdAndUpdate
      sets: req.body.sets,
      reps: req.body.reps,
      load: req.body.load || 0, // because defaults not triggered by findByIdAndUpdate
    });
    res.send(target_exercise);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put(prefix + '/:id', [auth, findWorkout, findExercise], async (req, res) => {
  if (req.user.id !== req.workout.userId) {
    res.status(403).send('Forbidden');
  }

  let target_exercise = await TargetExercise.findOne({ where: { id: req.params.id }});

  if (!target_exercise) {
    return res.status(404).send('Target exercise with submitted ID not found');
  }

  try {
      const updated_target_exercise = await target_exercise.update({
        exerciseId: req.exercise.id,
        workoutId: req.workout.id,
        exercise_type: req.body.exercise_type,
        unilateral: req.body.unilateral === undefined ? false : req.body.unilateral, // because defaults not triggered by findByIdAndUpdate
        sets: req.body.sets,
        reps: req.body.reps,
        load: req.body.load || target_exercise.load, // because defaults not triggered by findByIdAndUpdate
      });
      res.send(updated_target_exercise);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete(prefix + '/:id', [auth, findWorkout], async (req, res) => {
  const target_exercise = await TargetExercise.findOne({ where: { id: req.params.id }});

  if (!target_exercise) {
    res.status(404).send('Target exercise with submitted ID not found');
  } else {
    const workout = await Workout.findOne({ where: { id: target_exercise.workoutId }});
    if (req.user.id !== workout.userId) {
      res.status(403).send('Forbidden');
    } else {
      await target_exercise.destroy();
      res.send(target_exercise);
    }
  }
});

module.exports = router;
