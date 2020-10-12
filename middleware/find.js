const { Muscle, Exercise, Workout, CompletedWorkout } = require('../sequelize');

async function findMuscle(req, res, next) {
  const muscle = await Muscle.findOne({ where: { id: req.body.muscleId }});
  if (!muscle) {
    return res.status(400).send('Invalid Muscle');
  }
  req.muscle = muscle;
  next();
}

async function findExercise(req, res, next) {
  const exercise = await Exercise.findOne({ where: { id: req.body.exerciseId }});
  if (!exercise) {
    return res.status(400).send('Invalid Exercise');
  }

  req.exercise = exercise;
  next();
}

async function findWorkout(req, res, next) {
  const workout = await Workout.findOne({ where: { id: req.body.workoutId }});
  if (!workout) {
    return res.status(400).send('Invalid Workout');
  } else if (req.user.id !== (workout.userId).toString()) {
    return res.status(403).send('Forbidden');
  }

  req.workout = workout;
  next();
}

async function findCompletedWorkout(req, res, next) {
  const completed_workout = await CompletedWorkout.findOne({ where: { id: req.body.completedWorkoutId }});
  if (!completed_workout) {
    return res.status(400).send('Invalid Completed Workout');
  } else if (req.user.id !== (completed_workout.userId).toString()) {
    return res.status(403).send('Forbidden');
  }

  req.completed_workout = completed_workout;
  next();
}

module.exports = {
  findMuscle,
  findExercise,
  findWorkout,
  findCompletedWorkout
};
