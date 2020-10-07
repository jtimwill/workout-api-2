const {   User,
          CompletedExercise,
          CompletedWorkout,
          Exercise,
          Muscle,
          TargetExercise,
          Workout,
          WorkoutExercise
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
      password_digest: '123456',
      admin: true
    });
    // Create User1
    const user_1 = await User.create({
      username: 'adam',
      email: 'adam@example.com',
      password_digest: '123456',
      admin: false
    });
    // Create User2
    const user_2 = await User.create({
      username: 'bob',
      email: 'bob@example.com',
      password_digest: '123456',
      admin: false
    });
    // Create User3
    const user_3 = await User.create({
      username: 'mary',
      email: 'mary@example.com',
      password_digest: '123456',
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
    const upper_trap_exercises = [ "neck extension" ];
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

    // YAH***
    await Exercise.collection.insertMany(collection);

    const salt = await bcrypt.genSalt(10);
    const password_digest = await bcrypt.hash("123456", salt);
    const user = await new User({ name: "Adam", email: "adam@example.com", password_digest }).save();
    const back_squat = await Exercise.findOne({name: 'back squat'});
    const flat_bench_press = await Exercise.findOne({name: 'flat bench press'});
    const chin_up = await Exercise.findOne({name: 'chin up'});
    const lateral_raise = await Exercise.findOne({name: 'lateral raise'});
    const leg_curl = await Exercise.findOne({name: 'leg curl'});

    for (let i = 1; i < 32; i++) {
      let workout = await new Workout({ date: new Date(`October ${i}, 2018`), user_id: user._id }).save();

      await new CompletedExercise({
        exercise_id: back_squat._id,
        workout_id: workout._id,
        exercise_type: 'free weight',
        unilateral: false,
        sets: 5,
        reps: 5,
        load: 225,
        mum: false
      }).save();

      await new CompletedExercise({
        exercise_id: flat_bench_press._id,
        workout_id: workout._id,
        exercise_type: 'free weight',
        unilateral: false,
        sets: 4,
        reps: 8,
        load: 185,
        mum: true
      }).save();

      await new CompletedExercise({
        exercise_id: chin_up._id,
        workout_id: workout._id,
        exercise_type: 'bodyweight',
        unilateral: false,
        sets: 4,
        reps: 8,
        load: 0,
        mum: false
      }).save();

      await new CompletedExercise({
        exercise_id: lateral_raise._id,
        workout_id: workout._id,
        exercise_type: 'cable',
        unilateral: false,
        sets: 4,
        reps: 10,
        load: 12,
        mum: false
      }).save();

      await new CompletedExercise({
        exercise_id: leg_curl._id,
        workout_id: workout._id,
        exercise_type: 'machine',
        unilateral: true,
        sets: 4,
        reps: 10,
        load: 75,
        mum: false
      }).save();
    }

    mongoose.connection.close();



    console.log("Success!");
  } catch(err) {
    console.log("ERROR! Try Again!");
    console.log("Error info: " + err);
  }

  await sequelize.close();
})();
