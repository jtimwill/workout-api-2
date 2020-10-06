const config = require('config');
const db = config.get('db');
let sequelize;
const Sequelize = require('sequelize');

// Import model definitions
const UserModel = require('./models/user');
const CompletedExerciseModel = require('./models/completed_exercise');
const CompletedWorkoutModel = require('./models/completed_workout');
const ExerciseModel = require('./models/exercise');
const MuscleModel = require('./models/muscle');
const TargetExerciseModel = require('./models/target_exercise');
const WorkoutModel = require('./models/workout');

// Create sequelize instance
if (process.env.NODE_ENV === 'production') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres'
  });
} else {
  sequelize = new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: db
  });
}

// Use sequelize instance and Sequelize constructor to create model classes
const User = UserModel(sequelize, Sequelize);
const CompletedExercise = CompletedExerciseModel(sequelize, Sequelize);
const CompletedWorkout = CompletedWorkoutModel(sequelize, Sequelize);
const Exercise = ExerciseModel(sequelize, Sequelize);
const Muscle = MuscleModel(sequelize, Sequelize);
const TargetExercise = TargetExerciseModel(sequelize, Sequelize);
const Workout = WorkoutModel(sequelize, Sequelize);

// Create associations between models
User.hasMany(Workout, { foreignKey: {allowNull: false }});
User.hasMany(CompletedWorkout, { foreignKey: {allowNull: false }});
Workout.hasMany(CompletedWorkout, { foreignKey: {allowNull: false }}); // No cascade on delete
Workout.hasMany(TargetExercise, {
  foreignKey: {allowNull: false },
  onDelete: 'cascade'
});
Workout.hasMany(WorkoutExercise, {
  foreignKey: {allowNull: false },
  onDelete: 'cascade'
});
CompletedWorkout.hasMany(CompletedExercise, {
  foreignKey: {allowNull: false },
  onDelete: 'cascade'
});
Muscle.hasMany(Exercise, { foreignKey: {allowNull: false }});
Exercise.hasMany(CompletedExercise, { foreignKey: {allowNull: false }});
Exercise.hasMany(TargetExercise, { foreignKey: {allowNull: false }});
Exercise.hasMany(OrderProduct, {foreignKey: {allowNull: false }});

// Create database tables
sequelize.sync().then(() => {
  console.log("Database and tables created");
});

module.exports = {
  User,
  CompletedExercise,
  CompletedWorkout,
  Exercise,
  Muscle,
  TargetExercise,
  Workout,
  sequelize
};
