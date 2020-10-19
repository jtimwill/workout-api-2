const { Muscle,
        Workout,
        User,
        Exercise,
        TargetExercise,
        sequelize
      } = require('../../sequelize');
const server = require('../../index');
const request = require('supertest')(server);
const createJWT = require('../../utilities/tokenUtility');

describe('/api/workouts', () => {
  afterEach(async () => {
    await Muscle.destroy({ where: {} });
    await Workout.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Exercise.destroy({ where: {} });
    await TargetExercise.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /', () => {
    let user, other_user, token, muscle, exercise_1, exercise_2, workout_1, workout_2,
    other_workout;

    const response = async (jwt) => {
      return await request
        .get('/api/workouts')
        .set('x-auth-token', jwt);
    };

    beforeEach(async() => {
      user = await User.create({ username: "bob", email: "bob@example.com", password_digest: "123456" });
      token = createJWT(user);
      other_user = await User.create({ username: "binky", email: "bad@bunny.com", password_digest: "123456" });
      muscle = await Muscle.create({ name: 'chest' });
      exercise_1 = await Exercise.create({ name: 'chest fly' , muscleId: muscle.id });
      exercise_2 = await Exercise.create({ name: 'bench press' , muscleId: muscle.id });
      workout_1 = await Workout.create({ userId: user.id, name: 'Strength' });
      workout_2 = await Workout.create({ userId: user.id, name: 'Isometric' });
      other_workout = await Workout.create({ userId: other_user.id, name: 'Plyometric' });

      await TargetExercise.bulkCreate([
        { exerciseId: exercise_1.id, exercise_type: 'bodyweight', sets: 4, reps: 8, workoutId: workout_1.id },
        { exerciseId: exercise_2.id, exercise_type: 'free weight', sets: 4, reps: 12, workoutId: workout_2.id },
        { exerciseId: exercise_2.id, exercise_type: 'cable', sets: 4, reps: 12, workoutId: workout_2.id },
        { exerciseId: exercise_2.id, exercise_type: 'machine', sets: 100, reps: 100, workoutId: other_workout.id }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(token);

      expect(res.status).toBe(401);
    });

    it('should return all completed workouts for current user only (stat code 200)', async () => {
      const res = await response(token);

      expect(res.status).toBe(200);

      expect(res.body.some(w => w.id === workout_1.id)).toBeTruthy();
      expect(res.body.some(w => w.id === workout_2.id)).toBeTruthy();
      expect(res.body.some(w => w.id === other_workout.id)).toBeFalsy();

      expect(res.body.some(w => w.name === workout_1.name)).toBeTruthy();
      expect(res.body.some(w => w.name === workout_2.name)).toBeTruthy();
      expect(res.body.some(w => w.name === other_workout.name)).toBeFalsy();

      expect(res.body.some(w => w.userId === workout_1.userId)).toBeTruthy();
      expect(res.body.some(w => w.userId === workout_2.userId)).toBeTruthy();
      expect(res.body.some(w => w.userId === other_workout.userId)).toBeFalsy();


      expect(res.body.length).toBe(2);
      const ex = res.body[0].target_exercises.concat(res.body[1].target_exercises);

      expect(ex.some(w => w.exercise_type === 'bodyweight')).toBeTruthy();
      expect(ex.some(w => w.exercise_type === 'free weight')).toBeTruthy();
      expect(ex.some(w => w.exercise_type === 'cable')).toBeTruthy();
      expect(ex.some(w => w.exercise_type === 'machine')).toBeFalsy();
      expect(ex.some(w => w.sets === 4)).toBeTruthy();
      expect(ex.some(w => w.reps === 8)).toBeTruthy();
      expect(ex.some(w => w.reps === 12)).toBeTruthy();
    });
  });

  describe('POST /', () => {
    let user, token, workout_object, custom_date;

    const response = async (object, jwt) => {
      return await request
        .post('/api/workouts')
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async() => {
      user = await User.create({ username: "bob", email: "bob@example.com", password_digest: "123456" });
      token = createJWT(user);
      workout_object = { userId: user.id, name: 'Isometric' };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(workout_object, token);

      expect(res.status).toBe(401);
    });

    it('should return 400 if workout is invalid', async () => {
      workout_object = { };
      const res = await response(workout_object, token);

      expect(res.status).toBe(400);
    });

    it('should save workout if workout is valid', async () => {
      const res = await response(workout_object, token);
      const workout = await Workout.findOne({ where: { userId: user.id }});

      expect(workout).toHaveProperty('id');
      expect(workout).toHaveProperty('name', workout_object.name);
      expect(workout).toHaveProperty('userId', user.id);
    });

    it('should return completed workout if workout is valid', async () => {
      const res = await response(workout_object, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', workout_object.name);
      expect(res.body).toHaveProperty('userId', user.id);
    });
  });

  describe('GET /ID', () => {
    let user, other_user, token, muscle, exercise_1, exercise_2,
    workout, diff_user_workout, other_workout;

    const response = async (w_id, jwt) => {
      return await request
        .get('/api/workouts/' + w_id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async() => {
      user = await User.create({ username: "bob", email: "bob@example.com", password_digest: "123456" });
      token = createJWT(user);
      other_user = await User.create({ username: "binky", email: "bad@bunny.com", password_digest: "123456" });
      muscle = await Muscle.create({ name: 'chest' });
      exercise_1 = await Exercise.create({ name: 'chest fly' , muscleId: muscle.id });
      exercise_2 = await Exercise.create({ name: 'bench press' , muscleId: muscle.id });
      workout = await Workout.create({ userId: user.id, name: 'Strength' });
      diff_user_workout = await Workout.create({ userId: other_user.id, name: 'Plyometric' });
      other_workout = await Workout.create({ userId: user.id, name: 'Isometric' });

      await TargetExercise.bulkCreate([
        { exerciseId: exercise_1.id, exercise_type: 'cable', sets: 4, reps: 8, workoutId: workout.id },
        { exerciseId: exercise_2.id, exercise_type: 'machine', sets: 4, reps: 12, workoutId: workout.id },
        { exerciseId: exercise_2.id, exercise_type: 'bodyweight', sets: 100, reps: 100, workoutId: other_workout.id }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(workout.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not current user', async () => {
      const res = await response(diff_user_workout.id, token);
      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid workoutID', async () => {
      const workout_id = 1;
      const res = await response(workout_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if workoutID valid but workoutID not in DB', async () => {
      const workout_id = 10000;
      const res = await response(workout_id, token);

      expect(res.status).toBe(404);
    });

    it('should return all target_exercises for current workout (stat code 200)', async () => {
      const res = await response(workout.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', workout.id);
      expect(res.body).toHaveProperty('name', workout.name);
      expect(res.body).toHaveProperty('userId', workout.userId);
      expect(res.body.target_exercises.length).toBe(2);
      expect(res.body.target_exercises.some(w => w.exercise_type === 'cable')).toBeTruthy();
      expect(res.body.target_exercises.some(w => w.exercise_type === 'machine')).toBeTruthy();
      expect(res.body.target_exercises.some(w => w.exercise_type === 'bodyweight')).toBeFalsy();
      expect(res.body.target_exercises.some(w => w.sets === 4)).toBeTruthy();
      expect(res.body.target_exercises.some(w => w.reps === 8)).toBeTruthy();
      expect(res.body.target_exercises.some(w => w.reps === 12)).toBeTruthy();
      expect(res.body.target_exercises.some(w => w.workoutId === workout.id)).toBeTruthy();
      expect(res.body.target_exercises.some(w => w.workoutId === other_workout.id)).toBeFalsy();
    });
  });

  describe('PUT /ID', () => {
    let user, other_user, token, workout,
    diff_user_workout, workout_object;

    const response = async (object, w_id, jwt) => {
      return await request
        .put('/api/workouts/' + w_id)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async() => {
      user = await User.create({ username: "bob", email: "bob@example.com", password_digest: "123456" });
      token = createJWT(user);
      other_user = await User.create({ username: "binky", email: "bad@bunny.com", password_digest: "123456" });

      workout = await Workout.create({ userId: user.id, name: 'Strength' });
      diff_user_workout = await Workout.create({ userId: other_user.id, name: 'Plyometrics' });

      workout_object = {
        name: "Speed",
      };

    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(workout_object, workout.id, token);

      expect(res.status).toBe(401);
    });

     it('should return 403 if user is not current user', async () => {
      const res = await response(workout_object, diff_user_workout.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid workoutID', async () => {
      const workout_id = 1;
      const res = await response(workout_object, workout_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if workoutID valid but workoutID not in DB', async () => {
      const workout_id = 1000;
      const res = await response(workout_object, workout_id, token);

      expect(res.status).toBe(404);
    });

    // it('should return 400 if workout is invalid', async () => {
    //   workout_object = {};
    //   const res = await response(workout_object, workout.id, token);
    //
    //   expect(res.status).toBe(400);
    // });

    it('should update workout if input is valid', async () => {
      const res = await response(workout_object, workout.id, token);
      const updated_workout = await Workout.findOne({ where: { id: workout.id }});

      expect(updated_workout).toHaveProperty('id', workout.id);
      expect(updated_workout).toHaveProperty('name', workout_object.name);
      expect(updated_workout).toHaveProperty('userId', workout.userId);
    });

    it('should return updated workout if it is valid', async () => {
      const res = await response(workout_object, workout.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', workout.id);
      expect(res.body).toHaveProperty('name', workout_object.name);
      expect(res.body).toHaveProperty('userId', workout.userId);
    });
  });

  describe('DELETE /ID', () => {
    let user, other_user, token, muscle, exercise_1, exercise_2,
    workout, other_workout, diff_user_workout, completed_exercises;

    const response = async (w_id, jwt) => {
      return await request
        .delete('/api/workouts/' + w_id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async() => {
      user = await User.create({ username: "bob", email: "bob@example.com", password_digest: "123456" });
      token = createJWT(user);
      other_user = await User.create({ username: "binky", email: "bad@bunny.com", password_digest: "123456" });
      muscle = await Muscle.create({ name: 'chest' });
      exercise_1 = await Exercise.create({ name: 'chest fly' , muscleId: muscle.id });
      exercise_2 = await Exercise.create({ name: 'bench press' , muscleId: muscle.id });
      workout = await Workout.create({ userId: user.id, name: 'Strength' });
      diff_user_workout = await Workout.create({ userId: other_user.id, name: 'Plyometric' });
      other_workout = await Workout.create({ userId: user.id, name: 'Isometric' });

      await TargetExercise.bulkCreate([
        { exerciseId: exercise_1.id, exercise_type: 'cable', sets: 4, reps: 8, workoutId: workout.id },
        { exerciseId: exercise_2.id, exercise_type: 'machine', sets: 4, reps: 12, workoutId: workout.id },
        { exerciseId: exercise_2.id, exercise_type: 'bodyweight', sets: 100, reps: 100, workoutId: other_workout.id }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(workout.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not current user', async () => {
      const res = await response(diff_user_workout.id, token);
      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid workoutID', async () => {
      const workout_id = 1;
      const res = await response(workout_id, token);

      expect(res.status).toBe(404);
    });


    it('should return 404 if workoutID valid but workoutID not in DB', async () => {
      const workout_id = 10000;
      const res = await response(workout_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete workout and associated target_exercises if input is valid', async () => {
      const res = await response(workout.id, token);
      const returned_workout = await Workout.findOne({ where: { id: workout.id }});
      const returned_exercises = await TargetExercise.findAll({ where: { workoutId: workout.id }});

      expect(returned_workout).toBeNull();
      expect(returned_exercises).toEqual([]);
    });

    it('should return deleted workout', async () => {
      const res = await response(workout.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', workout.id);
      expect(res.body).toHaveProperty('name', workout.name);
      expect(res.body).toHaveProperty('userId', user.id);
    });
  });

});
