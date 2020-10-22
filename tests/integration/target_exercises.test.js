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

  describe('GET /ID', () => {
    let user, token, muscle, exercise,
    workout, other_workout, target_exercise,
    other_exercise;

    const response = async (w_id, c_id, jwt) => {
      return await request
        .get('/api/workouts/' + w_id + '/target_exercises/' + c_id )
        .set('x-auth-token', jwt);
    };

    beforeEach(async() => {
      user = await User.create({ username: "bob", email: "bob@example.com", password_digest: "123456" });
      token = createJWT(user);
      other_user = await User.create({ username: "binky", email: "bad@bunny.com", password_digest: "123456" });
      muscle = await Muscle.create({ name: 'chest' });
      exercise = await Exercise.create({ name: 'bench press' , muscleId: muscle.id });
      workout = await Workout.create({ userId: user.id, name: 'Strength' });
      other_workout = await Workout.create({ userId: other_user.id, name: 'Speed' });

      target_exercise = await TargetExercise.create({
        exerciseId: exercise.id,
        workoutId: workout.id,
        exercise_type: 'machine',
        sets: 4,
        reps: 8
      });

      other_exercise = await TargetExercise.create({
        exerciseId: exercise.id,
        workoutId: other_workout.id,
        exercise_type: 'free weight',
        sets: 4,
        reps: 8,
      });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(workout.id, target_exercise.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not current user (userID from JWT)', async () => {
      const res = await response(workout.id, other_exercise.id, token);
      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid target_exercise ID', async () => {
      const target_exercise_id = 'id';
      const res = await response(workout.id, target_exercise_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if target_exerciseID valid but target_exerciseID not in DB', async () => {
      const target_exercise_id = 10000;
      const res = await response(workout.id, target_exercise_id, token);

      expect(res.status).toBe(404);
    });

    it('should return specific target_exerciseID if valid target_exerciseID', async () => {
      const res = await response(workout.id, target_exercise.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', target_exercise.id);
      expect(res.body).toHaveProperty( 'exerciseId', exercise.id);
    });
  });

  describe('POST', () => {
    let user, other_user, token, muscle,
    exercise, workout, other_workout,
    new_exercise;

    const response = async (object, w_id, jwt) => {
      return await request
        .post('/api/workouts/' + w_id + '/target_exercises/')
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async() => {
      user = await User.create({ username: "bob", email: "bob@example.com", password_digest: "123456" });
      token = createJWT(user);
      other_user = await User.create({ username: "binky", email: "bad@bunny.com", password_digest: "123456" });
      muscle = await Muscle.create({ name: 'chest' });
      exercise = await Exercise.create({ name: 'bench press' , muscleId: muscle.id });
      workout = await Workout.create({ userId: user.id, name: 'Strength' });
      other_workout = await Workout.create({ userId: other_user.id, name: 'Speed' });

      new_exercise = {
        exerciseId: exercise.id,
        workoutId: workout.id,
        exercise_type: 'cable',
        sets: 3,
        reps: 12,
        load: 225
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(new_exercise, workout.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not current user (userID from JWT)', async () => {
      const res = await response(new_exercise, other_workout.id, token);
      expect(res.status).toBe(403);
    });

    it('should return 400 if invalid workoutID', async () => {
      const workout_id = "id";
      const res = await response(new_exercise, workout_id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if workoutID valid but workoutID not in DB', async () => {
      const workout_id = 10000;
      const res = await response(new_exercise, workout_id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if invalid exerciseID ', async () => {
      const new_exercise = { exerciseId: '1', sets: 3, reps: 12, workoutId: workout.id };
      const res = await response(new_exercise, workout.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if exerciseID valid but exerciseID not in DB', async () => {
      const exercise_id = 10000;
      const new_exercise = { exerciseId: exercise_id, exercise_type: 'cable', sets: 3, reps: 12, workoutId: workout.id };
      const res = await response(new_exercise, workout.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if target_exercise is invalid', async () => {
      const new_exercise = {
        exerciseId: exercise.id,
        workoutId: workout.id,
        load: 225
      };
      const res = await response(new_exercise, workout.id, token);

      expect(res.status).toBe(400);
    });

    it('should update target_exercise if input is valid', async () => {
      const res = await response(new_exercise, workout.id, token);
      const saved_exercise = await TargetExercise.findOne({ where: { load: 225 }});

      expect(saved_exercise).toHaveProperty('id');
      expect(saved_exercise).toHaveProperty('exerciseId', exercise.id);
      expect(saved_exercise).toHaveProperty('workoutId', workout.id);
      expect(saved_exercise).toHaveProperty('exercise_type', 'cable');
      expect(saved_exercise).toHaveProperty('unilateral', false);
      expect(saved_exercise).toHaveProperty('sets', 3);
      expect(saved_exercise).toHaveProperty('reps', 12);
      expect(saved_exercise).toHaveProperty('load', 225);
    });

    it('should return updated target_exercise if it is valid', async () => {
      const res = await response(new_exercise, workout.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('exerciseId', exercise.id);
      expect(res.body).toHaveProperty('workoutId', workout.id);
      expect(res.body).toHaveProperty('exercise_type', 'cable');
      expect(res.body).toHaveProperty('unilateral', false);
      expect(res.body).toHaveProperty('sets', 3);
      expect(res.body).toHaveProperty('reps', 12);
      expect(res.body).toHaveProperty('load', 225);
    });
  });

  describe('PUT /ID', () => {
    let user, other_user, token, muscle, exercise,
    workout, other_workout, target_exercise, object,
    other_exercise, updated_exercise;

    const response = async (object, w_id, c_id, jwt) => {
      return await request
        .put('/api/workouts/' + w_id + '/target_exercises/' + c_id)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async() => {
      user = await User.create({ username: "bob", email: "bob@example.com", password_digest: "123456" });
      token = createJWT(user);
      other_user = await User.create({ username: "binky", email: "bad@bunny.com", password_digest: "123456" });
      muscle = await Muscle.create({ name: 'chest' });
      exercise = await Exercise.create({ name: 'bench press' , muscleId: muscle.id });
      workout = await Workout.create({ userId: user.id, name: 'Strength' });
      other_workout = await Workout.create({ userId: other_user.id, name: 'Speed' });

      target_exercise = await TargetExercise.create({
        exerciseId: exercise.id,
        workoutId: workout.id,
        exercise_type: 'machine',
        sets: 4,
        reps: 8,
        load: 225
      });
      other_exercise = await TargetExercise.create({
        exerciseId: exercise.id,
        workoutId: other_workout.id,
        exercise_type: 'machine',
        sets: 4,
        reps: 8,
        load: 225
      });

      updated_exercise = {
        exerciseId: exercise.id,
        workoutId: workout.id,
        exercise_type: 'free weight',
        unilateral: true,
        sets: 3,
        reps: 12,
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(updated_exercise, workout.id, target_exercise.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not current user (userID from JWT)', async () => {
      const res = await response(updated_exercise, other_workout.id, target_exercise.id, token);
      expect(res.status).toBe(403);
    });

    it('should return 400 if invalid workoutID', async () => {
      const workout_id = "id";
      const res = await response(updated_exercise, workout_id, target_exercise.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if workoutID valid but workoutID not in DB', async () => {
      const workout_id = 10000;
      const res = await response(updated_exercise, workout_id, target_exercise.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 404 if invalid target_exerciseID', async () => {
      const target_exercise_id = 1;
      const res = await response(updated_exercise, workout.id, target_exercise_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if target_exerciseID valid but target_exerciseID not in DB', async () => {
      const target_exercise_id = 1000;
      const res = await response(updated_exercise, workout.id, target_exercise_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 400 if invalid exerciseID ', async () => {
      const updated_exercise = { exerciseId: '1', exercise_type: 'cable', sets: 3, reps: 12, workoutId: workout.id };
      const res = await response(updated_exercise, workout.id, target_exercise.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if exerciseID valid but exerciseID not in DB', async () => {
      const exercise_id = 1000;
      const updated_exercise = { exerciseId: exercise_id, exercise_type: 'cable', sets: 3, reps: 12, workoutId: workout.id };
      const res = await response(updated_exercise, workout.id, target_exercise.id, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if target_exercise is invalid', async () => {
      const updated_exercise = { exerciseId: 'id' };
      const res = await response(updated_exercise, workout.id, target_exercise.id, token);

      expect(res.status).toBe(400);
    });

    it('should update target_exercise if input is valid', async () => {
      const res = await response(updated_exercise, workout.id, target_exercise.id, token);
      const saved_exercise = await TargetExercise.findOne(updated_exercise);

      expect(saved_exercise).toHaveProperty('id', target_exercise.id);
      expect(saved_exercise).toHaveProperty('exerciseId', exercise.id);
      expect(saved_exercise).toHaveProperty('workoutId', workout.id);
      expect(saved_exercise).toHaveProperty('exercise_type', 'free weight');
      expect(saved_exercise).toHaveProperty('unilateral', true);
      expect(saved_exercise).toHaveProperty('sets', 3);
      expect(saved_exercise).toHaveProperty('reps', 12);
      expect(saved_exercise).toHaveProperty('load', 225);
    });

    it('should return updated completed_exercise if it is valid', async () => {
      const res = await response(updated_exercise, workout.id, target_exercise.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', target_exercise.id);
      expect(res.body).toHaveProperty('exerciseId', exercise.id);
      expect(res.body).toHaveProperty('workoutId', workout.id);
      expect(res.body).toHaveProperty('exercise_type', 'free weight');
      expect(res.body).toHaveProperty('unilateral', true);
      expect(res.body).toHaveProperty('sets', 3);
      expect(res.body).toHaveProperty('reps', 12);
      expect(res.body).toHaveProperty('load', 225);
    });
  });

  describe('DELETE /ID', () => {
    let user, token, muscle, exercise,
    workout, other_workout, target_exercise,
    other_exercise;

    const response = async (w_id, c_id, jwt) => {
      return await request
        .delete('/api/workouts/' + w_id + '/target_exercises/' + c_id )
        .set('x-auth-token', jwt);
    };

    beforeEach(async() => {
      user = await User.create({ username: "bob", email: "bob@example.com", password_digest: "123456" });
      token = createJWT(user);
      other_user = await User.create({ username: "binky", email: "bad@bunny.com", password_digest: "123456" });
      muscle = await Muscle.create({ name: 'chest' });
      exercise = await Exercise.create({ name: 'bench press' , muscleId: muscle.id });
      workout = await Workout.create({ userId: user.id, name: 'Strength' });
      other_workout = await Workout.create({ userId: other_user.id, name: 'Speed' });

      target_exercise = await TargetExercise.create({
        exerciseId: exercise.id,
        workoutId: workout.id,
        exercise_type: 'machine',
        sets: 4,
        reps: 8
      });

      other_exercise = await TargetExercise.create({
        exerciseId: exercise.id,
        workoutId: other_workout.id,
        exercise_type: 'free weight',
        sets: 4,
        reps: 8,
      });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(workout.id, target_exercise.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not current user (userID from JWT)', async () => {
      const res = await response(workout.id, other_exercise.id, token);
      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid target_exerciseID', async () => {
      const target_exercise_id = 1;
      const res = await response(workout.id, target_exercise_id, token);

      expect(res.status).toBe(404);
    });

    it('return 404 if target_exerciseID valid but target_exerciseID not in DB', async () => {
      const target_exercise_id = 1000;
      const res = await response(workout.id, target_exercise_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete target_exercise if input is valid', async () => {
      const res = await response(workout.id, target_exercise.id, token);
      const result = await TargetExercise.findOne({ where: { id: target_exercise.id }});

      expect(result).toBeNull();
    });

    it('should return deleted target_exercise', async () => {
      const res = await response(workout.id, target_exercise.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', target_exercise.id);
      expect(res.body).toHaveProperty( 'exerciseId', exercise.id);
    });
  });
});
