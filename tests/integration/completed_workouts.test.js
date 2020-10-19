const { Muscle,
        Workout,
        CompletedWorkout,
        User,
        Exercise,
        CompletedExercise,
        sequelize
      } = require('../../sequelize');
const server = require('../../index');
const request = require('supertest')(server);
const createJWT = require('../../utilities/tokenUtility');

describe('/api/completed_workouts', () => {
  afterEach(async () => {
    await Muscle.destroy({ where: {} });
    await Workout.destroy({ where: {} });
    await CompletedWorkout.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Exercise.destroy({ where: {} });
    await CompletedExercise.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /', () => {
    let user, other_user, token, muscle, exercise_1, exercise_2, workout_1, workout_2,
    completed_workout_1, completed_workout_2, other_completed_workout, completed_exercises;

    const response = async (jwt) => {
      return await request
        .get('/api/completed_workouts')
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
      completed_workout_1 = await CompletedWorkout.create({
        date: new Date('September 27, 2019 00:00:00'),
        userId: user.id,
        workoutId: workout_1.id
      });
      completed_workout_2 = await CompletedWorkout.create({
        date: new Date('September 27, 2020 00:00:00'),
        userId: user.id,
        workoutId: workout_1.id
      });
      other_completed_workout = await CompletedWorkout.create({
        date: new Date('September 27, 2018 00:00:00'),
        userId: other_user.id,
        workoutId: workout_2.id
      });

      await CompletedExercise.bulkCreate([
        { exerciseId: exercise_1.id, exercise_type: 'bodyweight', sets: 4, reps: 8, completedWorkoutId: completed_workout_1.id },
        { exerciseId: exercise_2.id, exercise_type: 'free weight', sets: 4, reps: 12, completedWorkoutId: completed_workout_2.id },
        { exerciseId: exercise_2.id, exercise_type: 'cable', sets: 4, reps: 12, completedWorkoutId: completed_workout_2.id },
        { exerciseId: exercise_2.id, exercise_type: 'machine', sets: 100, reps: 100, completedWorkoutId: other_completed_workout.id }
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

      expect(res.body.some(w => w.id === completed_workout_1.id)).toBeTruthy();
      expect(res.body.some(w => w.id === completed_workout_2.id)).toBeTruthy();
      expect(res.body.some(w => w.id === other_completed_workout.id)).toBeFalsy();

      expect(res.body.some(w => w.date === completed_workout_1.date.toJSON())).toBeTruthy();
      expect(res.body.some(w => w.date === completed_workout_2.date.toJSON())).toBeTruthy();
      expect(res.body.some(w => w.date === other_completed_workout.date.toJSON())).toBeFalsy();

      expect(res.body.some(w => w.userId === completed_workout_1.userId)).toBeTruthy();
      expect(res.body.some(w => w.userId === completed_workout_2.userId)).toBeTruthy();
      expect(res.body.some(w => w.userId === other_completed_workout.userId)).toBeFalsy();

      expect(res.body.some(w => w.workoutId === completed_workout_1.workoutId)).toBeTruthy();
      expect(res.body.some(w => w.workoutId === completed_workout_2.workoutId)).toBeTruthy();
      expect(res.body.some(w => w.workoutId === other_completed_workout.workoutId)).toBeFalsy();


      expect(res.body.length).toBe(2);
      const ex = res.body[0].completed_exercises.concat(res.body[1].completed_exercises);

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
    let user, token, completed_workout_object, custom_date, workout;

    const response = async (object, jwt) => {
      return await request
        .post('/api/completed_workouts')
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async() => {
      user = await User.create({ username: "bob", email: "bob@example.com", password_digest: "123456" });
      token = createJWT(user);
      custom_date = new Date(2019, 10);
      workout = await Workout.create({ userId: user.id, name: 'Isometric' });
      completed_workout_object = {
        date: new Date('September 27, 2019 00:00:00'),
        userId: user.id,
        workoutId: workout.id
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(completed_workout_object, token);

      expect(res.status).toBe(401);
    });

    it('should return 400 if completed workout is invalid', async () => {
      completed_workout_object = { date: "asdfa" };
      const res = await response(completed_workout_object, token);

      expect(res.status).toBe(400);
    });

    it('should save workout if completed workout is valid', async () => {
      const res = await response(completed_workout_object, token);
      const completed_workout = await CompletedWorkout.findOne({ where: { userId: user.id }});

      expect(completed_workout).toHaveProperty('id');
      expect(completed_workout).toHaveProperty('date', completed_workout_object.date);
      expect(completed_workout).toHaveProperty('userId', user.id);
    });

    it('should return completed workout if completed workout is valid', async () => {
      const res = await response(completed_workout_object, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('date', completed_workout_object.date.toJSON());
      expect(res.body).toHaveProperty('userId', user.id);
    });
  });

  describe('GET /ID', () => {
    let user, other_user, token, muscle, exercise_1, exercise_2, workout,
    completed_workout, other_completed_workout, diff_user_completed_workout, completed_exercises;

    const response = async (w_id, jwt) => {
      return await request
        .get('/api/completed_workouts/' + w_id)
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
      completed_workout = await CompletedWorkout.create({
        date: new Date('September 27, 2019 00:00:00'),
        userId: user.id,
        workoutId: workout.id
      });
      other_completed_workout = await CompletedWorkout.create({
        date: new Date('September 27, 2020 00:00:00'),
        userId: user.id,
        workoutId: workout.id
      });
      diff_user_completed_workout = await CompletedWorkout.create({
        date: new Date('September 27, 2018 00:00:00'),
        userId: other_user.id,
        workoutId: workout.id
      });

      await CompletedExercise.bulkCreate([
        { exerciseId: exercise_1.id, exercise_type: 'cable', sets: 4, reps: 8, completedWorkoutId: completed_workout.id },
        { exerciseId: exercise_2.id, exercise_type: 'machine',sets: 4, reps: 12, completedWorkoutId: completed_workout.id },
        { exerciseId: exercise_2.id, exercise_type: 'bodyweight',sets: 4, reps: 12, completedWorkoutId: other_completed_workout.id }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(completed_workout.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not current user', async () => {
      const res = await response(diff_user_completed_workout.id, token);
      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid completedWorkoutID', async () => {
      const completed_workout_id = 1;
      const res = await response(completed_workout_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if completedWorkoutID valid but workoutID not in DB', async () => {
      const completed_workout_id = 10000;
      const res = await response(completed_workout_id, token);

      expect(res.status).toBe(404);
    });

    it('should return all completed_exercises for current completed workout (stat code 200)', async () => {
      const res = await response(completed_workout.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', completed_workout.id);
      expect(res.body).toHaveProperty('date', completed_workout.date.toJSON());
      expect(res.body).toHaveProperty('userId', completed_workout.userId);
      expect(res.body.completed_exercises.length).toBe(2);
      expect(res.body.completed_exercises.some(w => w.exercise_type === 'cable')).toBeTruthy();
      expect(res.body.completed_exercises.some(w => w.exercise_type === 'machine')).toBeTruthy();
      expect(res.body.completed_exercises.some(w => w.exercise_type === 'bodyweight')).toBeFalsy();
      expect(res.body.completed_exercises.some(w => w.sets === 4)).toBeTruthy();
      expect(res.body.completed_exercises.some(w => w.reps === 8)).toBeTruthy();
      expect(res.body.completed_exercises.some(w => w.reps === 12)).toBeTruthy();
      expect(res.body.completed_exercises.some(w => w.completedWorkoutId === completed_workout.id)).toBeTruthy();
      expect(res.body.completed_exercises.some(w => w.completedWorkoutId === other_completed_workout.id)).toBeFalsy();
    });
  });
  //
  describe('PUT /ID', () => {
    let user, other_user, token, workout, completed_workout,
    diff_user_completed_workout, completed_workout_object,
    custom_date;

    const response = async (object, w_id, jwt) => {
      return await request
        .put('/api/completed_workouts/' + w_id)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async() => {
      user = await User.create({ username: "bob", email: "bob@example.com", password_digest: "123456" });
      token = createJWT(user);
      other_user = await User.create({ username: "binky", email: "bad@bunny.com", password_digest: "123456" });

      workout = await Workout.create({ userId: user.id, name: 'Strength' });
      workout2 = await Workout.create({ userId: user.id, name: 'Plyometrics' });

      completed_workout = await CompletedWorkout.create({
        date: new Date('September 27, 2019 00:00:00'),
        userId: user.id,
        workoutId: workout.id
      });
      diff_user_completed_workout = await CompletedWorkout.create({
        date: new Date('September 27, 2018 00:00:00'),
        userId: other_user.id,
        workoutId: workout.id
      });

      custom_date = new Date(2019, 10);
      completed_workout_object = {
        date: custom_date,
        userId: user.id,
        workoutId: workout2.id
      };

    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(completed_workout_object, completed_workout.id, token);

      expect(res.status).toBe(401);
    });

     it('should return 403 if user is not current user', async () => {
      const res = await response(completed_workout_object, diff_user_completed_workout.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid completedWorkoutID', async () => {
      const workout_id = 1;
      const res = await response(completed_workout_object, workout_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if completedWorkoutID valid but completedWorkoutID not in DB', async () => {
      const completed_workout_id = 1000;
      const res = await response(completed_workout_object, completed_workout_id, token);

      expect(res.status).toBe(404);
    });

    // it('should return 400 if completedWorkout is invalid', async () => {
    //   completed_workout_object = {};
    //   const res = await response(completed_workout_object, completed_workout.id, token);
    //
    //   expect(res.status).toBe(400);
    // });

    it('should update completedWorkout if input is valid', async () => {
      const res = await response(completed_workout_object, completed_workout.id, token);
      const updated_completed_workout = await CompletedWorkout.findOne({ where: { id: completed_workout.id }});

      expect(updated_completed_workout).toHaveProperty('id', completed_workout.id);
      expect(updated_completed_workout).toHaveProperty('date', completed_workout_object.date);
      expect(updated_completed_workout).toHaveProperty('workoutId', completed_workout_object.workoutId);
      expect(updated_completed_workout).toHaveProperty('userId', completed_workout.userId);
    });

    it('should return updated completedWorkout if it is valid', async () => {
      const res = await response(completed_workout_object, completed_workout.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', completed_workout.id);
      expect(res.body).toHaveProperty('date', completed_workout_object.date.toJSON());
      expect(res.body).toHaveProperty('workoutId', completed_workout_object.workoutId);
      expect(res.body).toHaveProperty('userId', completed_workout.userId);
    });
  });

  describe('DELETE /ID', () => {
    let user, other_user, token, muscle, exercise_1, exercise_2, workout,
    completed_workout, other_completed_workout, diff_user_completed_workout, completed_exercises;

    const response = async (w_id, jwt) => {
      return await request
        .delete('/api/completed_workouts/' + w_id)
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
      completed_workout = await CompletedWorkout.create({
        date: new Date('September 27, 2019 00:00:00'),
        userId: user.id,
        workoutId: workout.id
      });
      other_completed_workout = await CompletedWorkout.create({
        date: new Date('September 27, 2020 00:00:00'),
        userId: user.id,
        workoutId: workout.id
      });
      diff_user_completed_workout = await CompletedWorkout.create({
        date: new Date('September 27, 2018 00:00:00'),
        userId: other_user.id,
        workoutId: workout.id
      });

      await CompletedExercise.bulkCreate([
        { exerciseId: exercise_1.id, exercise_type: 'cable', sets: 4, reps: 8, completedWorkoutId: completed_workout.id },
        { exerciseId: exercise_2.id, exercise_type: 'machine',sets: 4, reps: 12, completedWorkoutId: completed_workout.id },
        { exerciseId: exercise_2.id, exercise_type: 'free weight',sets: 4, reps: 12, completedWorkoutId: other_completed_workout.id }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(completed_workout.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not current user', async () => {
      const res = await response(diff_user_completed_workout.id, token);
      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid completedWorkoutID', async () => {
      const completed_workout_id = 1;
      const res = await response(completed_workout_id, token);

      expect(res.status).toBe(404);
    });


    it('should return 404 if completedWorkoutID valid but completedWorkoutID not in DB', async () => {
      const completed_workout_id = 10000;
      const res = await response(completed_workout_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete completedWorkout and associated completed_exercises if input is valid', async () => {
      const res = await response(completed_workout.id, token);
      const returned_completed_workout = await CompletedWorkout.findOne({ where: { id: completed_workout.id }});
      const returned_completed_exercises = await CompletedExercise.findAll({ where: { completedWorkoutId: completed_workout.id }});

      expect(returned_completed_workout).toBeNull();
      expect(returned_completed_exercises).toEqual([]);
    });

    it('should return deleted completedWorkout', async () => {
      const res = await response(completed_workout.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', completed_workout.id);
      expect(res.body).toHaveProperty('date');
      expect(res.body).toHaveProperty('userId', user.id);
    });
  });

});
