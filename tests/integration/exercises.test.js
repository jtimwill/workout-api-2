const { Muscle, User, Exercise, sequelize } = require('../../sequelize');
const createJWT = require('../../utilities/tokenUtility');
const server = require('../../index');
const request = require('supertest')(server);

describe('/api/exercises', () => {
  afterEach(async () => {
    await Muscle.destroy({ where: {} });
    await Exercise.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /', () => {
    let muscle, exercises, token, user;

    const response = async (jwt) => {
      return await request
        .get('/api/exercises')
        .set('x-auth-token', jwt);
    };

    beforeEach(async() => {
      user = User.build({ admin: false });
      muscle = await Muscle.create({ name: 'chest' });
      token = createJWT(user);
      exercises = [
          { name: 'chest fly' , muscleId: muscle.id },
          { name: 'bench press', muscleId: muscle.id }
        ];
      await Exercise.bulkCreate(exercises);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(token);

      expect(res.status).toBe(401);
    });

    it('should return all exercises (stat code 200)', async () => {
      const res = await response(token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(e => e.name === 'chest fly')).toBeTruthy();
      expect(res.body.some(e => e.name === 'bench press')).toBeTruthy();
      expect(res.body.some(e => e.muscleId === muscle.id)).toBeTruthy();
    });
  });

  describe('POST /', () => {
    let token, muscle, exercise_object;

    const response = async (object, jwt) => {
      return await request
        .post('/api/exercises')
        .send(object)
        .set('x-auth-token', jwt);
    };

    beforeEach(async() => {
      const user = User.build({ admin: true });
      token = createJWT(user);
      muscle = await Muscle.create({ name: 'chest' });
      exercise_object = { name: 'bench press', muscleId: muscle.id };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(exercise_object, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(exercise_object, token);

      expect(res.status).toBe(403);
    });

    it('should return 400 if exercise is invalid', async () => {
      exercise_object = { muscleId: 'id'};
      const res = await response(exercise_object, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if invalid muscleID', async () => {
      exercise_object = { name: 'bench press', muscleId: 'id' };
      const res = await response(exercise_object, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if muscleID valid but muscleID not in DB', async () => {
      const muscle_id = '10000'
      exercise_object = { name: 'bench press', muscleId: muscle_id };
      const res = await response(exercise_object, token);

      expect(res.status).toBe(400);
    });

    it('should save exercise if exercise is valid', async () => {
      const res = await response(exercise_object, token);
      const exercise = await Exercise.findOne({ where: {
        name: 'bench press',
        muscleId: muscle.id }
      });

      expect(exercise).toHaveProperty('id');
      expect(exercise).toHaveProperty('name', 'bench press');
      expect(exercise).toHaveProperty('muscleId', muscle.id);
    });

    it('should return exercise if exercise is valid', async () => {
      const res = await response(exercise_object, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', 'bench press');
      expect(res.body).toHaveProperty('muscleId', muscle.id);
    });
  });

  describe('GET /ID', () => {
    let token, muscle, exercise;
    const response = async (id, jwt) => {
      return await request
        .get('/api/exercises/' + id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async() => {
      user = User.build({ admin: true });
      token = createJWT(user);
      muscle = await Muscle.create({ name: 'chest' });
      exercise = await Exercise.create({
        name: 'bench press',
        muscleId: muscle.id
      });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(exercise.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(exercise.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid exercise ID', async () => {
      const exercise_id = 'id';
      const res = await response(exercise_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if exerciseID valid but exerciseID not in DB', async () => {
      const exercise_id = '1000';
      const res = await response(exercise_id, token);

      expect(res.status).toBe(404);
    });

    it('should return specific exercise if valid exerciseID', async () => {
      const res = await response(exercise.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', 'bench press');
      expect(res.body).toHaveProperty('muscleId', muscle.id);
    });
  });
  //
  describe('PUT /ID', () => {
    let token, muscle, new_muscle, exercise, updated_exercise, user;

    const response = async (object, jwt, id) => {
      return await request
        .put('/api/exercises/' + id)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async() => {
      user = User.build({ admin: true });
      token = createJWT(user);
      muscle = await Muscle.create({ name: 'chest' });
      new_muscle = await Muscle.create({ name: 'abs' });
      exercise = await Exercise.create({ name: 'bench press', muscleId: muscle.id });
      updated_exercise = { name: 'crunches', muscleId: new_muscle.id };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(updated_exercise, token, exercise.id);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(updated_exercise, token, exercise.id);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid exerciseID', async () => {
      const exercise_id = '1';
      const res = await response(updated_exercise, token, exercise_id);

      expect(res.status).toBe(404);
    });

    it('should return 404 if exerciseID valid but exerciseID not in DB', async () => {
      const exercise_id = '1000';
      const res = await response(updated_exercise, token, exercise_id);

      expect(res.status).toBe(404);
    });

    it('should return 400 if invalid muscleID ', async () => {
      updated_exercise = { name: 'crunches', muscleId: '1' };
      const res = await response(updated_exercise, token, exercise.id);

      expect(res.status).toBe(400);
    });

    it('should return 400 if muscleID valid but muscleID not in DB', async () => {
      const muscle_id = '1000';
      updated_exercise = { name: 'crunches', muscleId: muscle_id };
      const res = await response(updated_exercise, token, exercise.id);

      expect(res.status).toBe(400);
    });

    // it('should return 400 if exercise is invalid', async () => {
    //   updated_exercise = { muscleId: new_muscle.id };
    //   const res = await response(updated_exercise, token, exercise.id);
    //   expect(res.status).toBe(400);
    // });

    it('should update exercise if input is valid', async () => {
      const res = await response(updated_exercise, token, exercise.id);
      const saved_exercise = await Exercise.findOne({ where: {
        name: 'crunches',
        muscleId: new_muscle.id
      }});

      expect(saved_exercise).toHaveProperty('id');
      expect(saved_exercise).toHaveProperty('name', 'crunches');
      expect(saved_exercise).toHaveProperty('muscleId', new_muscle.id);
    });

    it('should return updated exercise if it is valid', async () => {
      const res = await response(updated_exercise, token, exercise.id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', exercise.id);
      expect(res.body).toHaveProperty('name', 'crunches');
      expect(res.body).toHaveProperty('muscleId', new_muscle.id);
    });
  });
  //
  describe('DELETE /ID', () => {
    let token, muscle, exercise, user;
    const response = async (id, jwt) => {
      return await request
        .delete('/api/exercises/' + id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async() => {
      user = User.build({ admin: true });
      token = createJWT(user);
      muscle = await Muscle.create({ name: 'chest' });
      exercise = await Exercise.create({
        name: 'bench press',
        muscleId: muscle.id
      });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(exercise.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(exercise.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid exerciseID', async () => {
      const exercise_id = 'id';
      const res = await response(exercise_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if exerciseID valid but exerciseID not in DB', async () => {
      const exercise_id = '10000'
      const res = await response(exercise_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete exercise if input is valid', async () => {
      const res = await response(exercise.id, token);
      const result = await Exercise.findOne({ where: {
        muscleId: muscle.id
      }});

      expect(result).toBeNull();
    });

    it('should return deleted exercise', async () => {
      const res = await response(exercise.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', 'bench press');
      expect(res.body).toHaveProperty('muscleId', muscle.id);
    });
  });
});
