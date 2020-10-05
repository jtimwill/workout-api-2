const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { findWorkout, findExercise } = require('../middleware/find');
const { CompletedWorkout, TargetExercise, CompletedExercise, Exercise, Muscle , Workout, User, sequelize } = require('../sequelize');
const prefix = "/:workoutId/target_exercises";

router.get('/:id', [auth, findWorkout], async (req, res) => {
  const target_exercise = await TargetExercise.findOne({ where: { id: req.params.id }});

  if (!target_exercise) {
    res.status(404).send('Target exercise with submitted ID not found');
  } else {
    res.send(target_exercise);
  }
});

router.post('/:id/target_exercises/', [auth, findWorkout, findExercise], async (req, res) => {
  try {
    target_exercise = await TargetExercise.create({
      exercise_id: req.exercise.exercise_id,
      workout_id: req.workout.workout_id,
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

router.put('/:id', [auth, findWorkout, findExercise], async (req, res) => {
  let target_exercise = await TargetExercise.findOne({ where: { id: req.params.id }});

  if (!target_exercise) {
    return res.status(404).send('Target exercise with submitted ID not found');
  }

  try {
      updated_target_exercise = await target_exercise.update({
        exercise_id: req.exercise.exercise_id,
        workout_id: req.workout.workout_id,
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

router.delete('/:id', [auth, findWorkout], async (req, res) => {
  const target_exercise = await TargetExercise.findOne({ where: { id: req.params.id }});

  if (!target_exercise) {
    res.status(404).send('Target exercise with submitted ID not found');
  } else {
    await target_exercise.destroy();
    res.send(target_exercise);
  }
});

module.exports = router;
