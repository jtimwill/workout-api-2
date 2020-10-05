const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { findCompletedWorkout, findExercise } = require('../middleware/find');
const { CompletedWorkout, TargetExercise, CompletedExercise, Exercise, Muscle , Workout, User, sequelize } = require('../sequelize');
const prefix = "/:completedWorkoutId/completed_exercises";

router.get('/:id', [auth, findCompletedWorkout], async (req, res) => {
  const completed_exercise = await CompletedExercise.findOne({ where: { id: req.params.id }});

  if (!completed_exercise) {
    res.status(404).send('Completed exercise with submitted ID not found');
  } else {
    res.send(completed_exercise);
  }
});

router.post('/:id/completed_exercises/', [auth, findCompletedWorkout, findExercise], async (req, res) => {
  try {
    completed_exercise = await CompletedExercise.create({
      exercise_id: req.exercise.exercise_id,
      completed_workout_id: req.completed_workout.workout_id,
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

router.put('/:id', [auth, findCompletedWorkout, findExercise], async (req, res) => {
  let completed_exercise = await CompletedExercise.findOne({ where: { id: req.params.id }});

  if (!completed_exercise) {
    return res.status(404).send('Completed exercise with submitted ID not found');
  }

  try {
      updated_completed_exercise = await completed_exercise.update({
        exercise_id: req.exercise.exercise_id,
        completed_workout_id: req.completed_workout.workout_id,
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

router.delete('/:id', [auth, findCompletedWorkout], async (req, res) => {
  const completed_exercise = await CompletedExercise.findOne({ where: { id: req.params.id }});

  if (!completed_exercise) {
    res.status(404).send('Completed exercise with submitted ID not found');
  } else {
    await completed_exercise.destroy();
    res.send(completed_exercise);
  }
});

module.exports = router;
