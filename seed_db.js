const {   User,
          CompletedExercise,
          CompletedWorkout,
          Exercise,
          Muscle,
          TargetExercise,
          Workout,
          WorkoutExercise,
          sequelize } = require('./sequelize');
const bcrypt = require('bcrypt');
const config = require('config');

(async () => {
  try {
    await sequelize.sync({force: true}); // Reset database
    const salt_value = Number(config.get("bcrypt_salt"));
    const salt = await bcrypt.genSalt(salt_value);
    const password_digest = await bcrypt.hash("123456", salt);

    // Create Admin User
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password_digest: password_digest,
      admin: true
    });
    // Create User1
    const user_1 = await User.create({
      username: 'adam',
      email: 'adam@example.com',
      password_digest: password_digest,
      admin: false
    });
    // Create User2
    const user_2 = await User.create({
      username: 'bob',
      email: 'bob@example.com',
      password_digest: password_digest,
      admin: false
    });
    // Create User3
    const user_3 = await User.create({
      username: 'mary',
      email: 'mary@example.com',
      password_digest: password_digest,
      admin: false
    });

    const collection = [];
    function exercise_items(array, muscle) {
      for (let item of array) {
        collection.push({ name: item, muscleId: muscle.id });
      }
      return collection
    }

    const front_neck = await Muscle.create({ name: "front-neck" });
    const deltoids = await Muscle.create({ name: "deltoids" });
    const biceps = await Muscle.create({ name: "biceps" });
    const pectorals = await Muscle.create({ name: "pectorals" });
    const obliques = await Muscle.create({ name: "obliques" });
    const abdominals = await Muscle.create({ name: "abdominals" });
    const quadriceps = await Muscle.create({ name: "quadriceps" });
    const hip_adductors = await Muscle.create({ name: "hip adductors" });
    const tibialis_anterior = await Muscle.create({ name: "tibialis anterior" });
    const upper_trapezius = await Muscle.create({ name: "upper trapezius" });
    const lower_trapezius = await Muscle.create({ name: "lower trapezius" });
    const posterior_deltoids = await Muscle.create({ name: "posterior deltoids" });
    const infraspinatus = await Muscle.create({ name: "infraspinatus" });
    const triceps = await Muscle.create({ name: "triceps" });
    const latissimus_dorsi = await Muscle.create({ name: "latissimus dorsi" });
    const lower_back = await Muscle.create({ name: "lower back" });
    const glutes = await Muscle.create({ name: "glutes" });
    const hamstrings = await Muscle.create({ name: "hamstrings" });
    const calves = await Muscle.create({ name: "calves" });
    const front_forearms = await Muscle.create({ name: "front-forearms" });
    const back_forearms = await Muscle.create({ name: "back-forearms" });

    const quad_exercises = [
      "paused back squat",
      "back squat",
      "front squat",
      "jump squat",
      "pistol squat",
      "depth jumps",
      "box jumps",
      "running vertical jumps",
      "standing vertical jumps"
    ];
    const hamstring_exercises = [
      "romanian deadlift",
      "sumo deadlift",
      "deadlift",
      "leg curl",
      "glute-ham raise",
      "nordic ham curl"
    ];
    const calf_exercises = [ "standing calf raise", "steated calve raise" ];
    const pectoral_exercises = [
      "incline bench press",
      "flat bench press",
      "chest fly"
    ];
    const lat_exercises = [
      "wide-grip front lat pulldown",
      "close-grip front lat pulldown",
      "chin up",
      "pull up",
      "bent-over row",
      "seated row"
    ];
    const lower_back_exercises = [ "back extension" ];
    const deltoid_exercises = [
      "seated overhead press",
      "standing overhead press",
      "lateral raise",
      "front raise"
    ];
    const posterior_deltoid_exercises = [ "reverse fly" ];
    const tricep_exercises = [
      "push down",
      "triceps extension",
      "close-grip bench press",
      "dip"
    ];
    const bicep_exercises = [
      "hammer curl",
      "bicep curl",
      "incline curl",
      "preacher curl"
    ];
    const ab_exercises = [ "crunch" ];
    const front_neck_exercises = [ "neck curl" ];
    const upper_trap_exercises = [ "neck extension", "shrug" ];
    const glute_exercises = [ "bench hip thrust", "hip thrust" ];

    exercise_items(quad_exercises, quadriceps);
    exercise_items(hamstring_exercises, hamstrings);
    exercise_items(calf_exercises, calves);
    exercise_items(pectoral_exercises, pectorals);
    exercise_items(lat_exercises, latissimus_dorsi);
    exercise_items(lower_back_exercises, lower_back);
    exercise_items(deltoid_exercises, deltoids);
    exercise_items(posterior_deltoid_exercises, posterior_deltoids);
    exercise_items(tricep_exercises, triceps);
    exercise_items(bicep_exercises, biceps);
    exercise_items(ab_exercises, abdominals);
    exercise_items(front_neck_exercises, front_neck);
    exercise_items(upper_trap_exercises, upper_trapezius);
    exercise_items(glute_exercises, glutes);

    await Exercise.bulkCreate(collection);

    const incline_bench_press = await Exercise.findOne({ where: { name: 'incline bench press' }});
    const standing_overhead_press = await Exercise.findOne({ where: { name: 'standing overhead press' }});
    const triceps_extension = await Exercise.findOne({ where: { name: 'triceps extension' }});
    const lateral_raise = await Exercise.findOne({ where: { name: 'lateral raise' }});
    const chest_fly = await Exercise.findOne({ where: { name: 'chest fly' }});
    const back_squat = await Exercise.findOne({ where: { name: 'back squat' }});

    const bent_over_row = await Exercise.findOne({ where: { name: 'bent-over row' }});
    const reverse_fly = await Exercise.findOne({ where: { name: 'reverse fly' }});
    const bicep_curl = await Exercise.findOne({ where: { name: 'bicep curl' }});
    const leg_curl = await Exercise.findOne({ where: { name: 'leg curl' }});
    const pull_up = await Exercise.findOne({ where: { name: 'pull up' }});
    const shrug = await Exercise.findOne({ where: { name: 'shrug' }});

    let push_workout = await Workout.create({ name: "Push", userId: user_1.id });
    let pull_workout = await Workout.create({ name: "Pull", userId: user_1.id });

    await TargetExercise.create({
      exerciseId: incline_bench_press.id,
      workoutId: push_workout.id,
      exercise_type: 'free weight',
      unilateral: false,
      sets: 4,
      reps: 12,
      load: 135,
    });
    await TargetExercise.create({
      exerciseId: standing_overhead_press.id,
      workoutId: push_workout.id,
      exercise_type: 'free weight',
      unilateral: false,
      sets: 4,
      reps: 12,
      load: 95,
    });
    await TargetExercise.create({
      exerciseId: triceps_extension.id,
      workoutId: push_workout.id,
      exercise_type: 'cable',
      unilateral: false,
      sets: 4,
      reps: 15,
      load: 57.5,
    });
    await TargetExercise.create({
      exerciseId: lateral_raise.id,
      workoutId: push_workout.id,
      exercise_type: 'cable',
      unilateral: true,
      sets: 4,
      reps: 15,
      load: 12.5,
    });
    await TargetExercise.create({
      exerciseId: lateral_raise.id,
      workoutId: push_workout.id,
      exercise_type: 'machine',
      unilateral: false,
      sets: 4,
      reps: 15,
      load: 50,
    });
    await TargetExercise.create({
      exerciseId: back_squat.id,
      workoutId: push_workout.id,
      exercise_type: 'free weight',
      unilateral: false,
      sets: 5,
      reps: 5,
      load: 225,
    });
    await TargetExercise.create({
      exerciseId: chest_fly.id,
      workoutId: push_workout.id,
      exercise_type: 'machine',
      unilateral: false,
      sets: 4,
      reps: 12,
      load: 165,
    });

    await TargetExercise.create({
      exerciseId: bent_over_row.id,
      workoutId: pull_workout.id,
      exercise_type: 'machine',
      unilateral: false,
      sets: 4,
      reps: 12,
      load: 90,
    });
    await TargetExercise.create({
      exerciseId: reverse_fly.id,
      workoutId: pull_workout.id,
      exercise_type: 'machine',
      unilateral: false,
      sets: 4,
      reps: 12,
      load: 115,
    });
    await TargetExercise.create({
      exerciseId: bicep_curl.id,
      workoutId: pull_workout.id,
      exercise_type: 'cable',
      unilateral: false,
      sets: 4,
      reps: 15,
      load: 47.5,
    });
    await TargetExercise.create({
      exerciseId: bicep_curl.id,
      workoutId: pull_workout.id,
      exercise_type: 'free weight',
      unilateral: false,
      sets: 4,
      reps: 15,
      load: 50,
    });
    await TargetExercise.create({
      exerciseId: leg_curl.id,
      workoutId: pull_workout.id,
      exercise_type: 'machine',
      unilateral: false,
      sets: 4,
      reps: 10,
      load: 115,
    });
    await TargetExercise.create({
      exerciseId: pull_up.id,
      workoutId: pull_workout.id,
      exercise_type: 'bodyweight',
      unilateral: false,
      sets: 4,
      reps: 12,
      load: 0,
    });
    await TargetExercise.create({
      exerciseId: shrug.id,
      workoutId: pull_workout.id,
      exercise_type: 'free weight',
      unilateral: false,
      sets: 4,
      reps: 15,
      load: 185,
    });

    for (let i = 1; i < 32; i++) {
      if (i % 2 == 0) {
        let completed_workout1 = await CompletedWorkout.create({
          date: new Date(`November ${i}, 2020`),
          userId: user_1.id,
          workoutId: push_workout.id
        });

        await CompletedExercise.create({
          exerciseId: incline_bench_press.id,
          completedWorkoutId: completed_workout1.id,
          exercise_type: 'free weight',
          unilateral: false,
          sets: 4,
          reps: 12,
          load: 135,
        });
        await CompletedExercise.create({
          exerciseId: standing_overhead_press.id,
          completedWorkoutId: completed_workout1.id,
          exercise_type: 'free weight',
          unilateral: false,
          sets: 4,
          reps: 12,
          load: 95,
        });
        await CompletedExercise.create({
          exerciseId: triceps_extension.id,
          completedWorkoutId: completed_workout1.id,
          exercise_type: 'cable',
          unilateral: false,
          sets: 4,
          reps: 15,
          load: 57.5,
        });
        await CompletedExercise.create({
          exerciseId: lateral_raise.id,
          completedWorkoutId: completed_workout1.id,
          exercise_type: 'cable',
          unilateral: true,
          sets: 4,
          reps: 15,
          load: 12.5,
        });
        await CompletedExercise.create({
          exerciseId: lateral_raise.id,
          completedWorkoutId: completed_workout1.id,
          exercise_type: 'machine',
          unilateral: false,
          sets: 4,
          reps: 15,
          load: 50,
        });
        await CompletedExercise.create({
          exerciseId: back_squat.id,
          completedWorkoutId: completed_workout1.id,
          exercise_type: 'free weight',
          unilateral: false,
          sets: 5,
          reps: 5,
          load: 225,
        });
        await CompletedExercise.create({
          exerciseId: chest_fly.id,
          completedWorkoutId: completed_workout1.id,
          exercise_type: 'machine',
          unilateral: false,
          sets: 4,
          reps: 12,
          load: 165,
        });

      } else {
        let completed_workout2 = await CompletedWorkout.create({
          date: new Date(`November ${i}, 2020`),
          userId: user_1.id,
          workoutId: pull_workout.id
        });

        await CompletedExercise.create({
          exerciseId: bent_over_row.id,
          completedWorkoutId: completed_workout2.id,
          exercise_type: 'machine',
          unilateral: false,
          sets: 4,
          reps: 12,
          load: 90,
        });
        await CompletedExercise.create({
          exerciseId: reverse_fly.id,
          completedWorkoutId: completed_workout2.id,
          exercise_type: 'machine',
          unilateral: false,
          sets: 4,
          reps: 12,
          load: 115,
        });
        await CompletedExercise.create({
          exerciseId: bicep_curl.id,
          completedWorkoutId: completed_workout2.id,
          exercise_type: 'cable',
          unilateral: false,
          sets: 4,
          reps: 15,
          load: 47.5,
        });
        await CompletedExercise.create({
          exerciseId: bicep_curl.id,
          completedWorkoutId: completed_workout2.id,
          exercise_type: 'free weight',
          unilateral: false,
          sets: 4,
          reps: 15,
          load: 50,
        });
        await CompletedExercise.create({
          exerciseId: leg_curl.id,
          completedWorkoutId: completed_workout2.id,
          exercise_type: 'machine',
          unilateral: false,
          sets: 4,
          reps: 10,
          load: 115,
        });
        await CompletedExercise.create({
          exerciseId: pull_up.id,
          completedWorkoutId: completed_workout2.id,
          exercise_type: 'bodyweight',
          unilateral: false,
          sets: 4,
          reps: 12,
          load: 0,
        });
        await CompletedExercise.create({
          exerciseId: shrug.id,
          completedWorkoutId: completed_workout2.id,
          exercise_type: 'free weight',
          unilateral: false,
          sets: 4,
          reps: 15,
          load: 185,
        });
      }
    }

    console.log("Success!");
  } catch(err) {
    console.log("ERROR! Try Again!");
    console.log("Error info: " + err);
  }

  await sequelize.close();
})();
