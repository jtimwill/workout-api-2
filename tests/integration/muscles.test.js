const { Muscle, User, sequelize } = require('../../sequelize');
const createJWT = require('../../utilities/tokenUtility');
const server = require('../../index');
const request = require('supertest')(server);

describe('/api/muscles', () => {
  afterEach(async () => {
    await Muscle.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /', () => {
    let token;

    const response = async (jwt) => {
      return await request
        .get('/api/muscles')
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      const user = User.build({ admin: false });
      token = createJWT(user);
      const muscles = await Muscle.bulkCreate([{ name: 'abs' }, { name: 'quads' }]);
      const res = await response(token);
    });

    it('should return 401 if client not logged in', async () => {
      const token = '';
      const res = await response(token);

      expect(res.status).toBe(401);
    });

    it('should return all muscles (stat code 200)', async () => {
      const res = await response(token);
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(m => m.name === 'abs')).toBeTruthy();
      expect(res.body.some(m => m.name === 'quads')).toBeTruthy();
    });
  });

  describe('POST /', () => {
    let user, token, muscle_object;

    const response = async (object, jwt) => {
      return await request
        .post('/api/muscles')
        .send(object)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = createJWT(user);
      muscle_object = { name: 'abs' };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(muscle_object, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(muscle_object, token);

      expect(res.status).toBe(403);
    });

    it('should return 400 if muscle is invalid', async () => {
      muscle_object = {};
      const res = await response(muscle_object, token);

      expect(res.status).toBe(400);
    });

    it('should save muscle if muscle is valid', async () => {
      const res = await response(muscle_object, token);
      const muscle = await Muscle.findOne({ name: 'abs' });

      expect(muscle).toHaveProperty('id');
      expect(muscle).toHaveProperty('name', 'abs');
    });

    it('should return muscle if muscle is valid', async () => {
      const res = await response(muscle_object, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'abs');
    });
  });

  describe('GET /ID', () => {
    let user, token, muscle, muscle_id;

    const response = async (id, jwt) => {
      return await request
        .get('/api/muscles/' + id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = createJWT(user);
      muscle_id = '1';
      muscle = await Muscle.create({ name: 'abs' });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(muscle_id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(muscle_id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid muscle ID', async () => {
      muscle_id = 'id';
      const res = await response(muscle_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if muscleID valid but muscleID not in DB', async () => {
      muscle_id = '10000';
      const res = await response(muscle_id, token);

      expect(res.status).toBe(404);
    });

    it('should return specific muscle if valid muscleID', async () => {
      const res = await response(muscle.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', muscle.id);
      expect(res.body).toHaveProperty('name', muscle.name);
    });
  });

  describe('PUT /ID', () => {
    let muscle_object, muscle_id, token, user;
    const response = async (object, jwt, id) => {
      return await request
        .put('/api/muscles/' + id)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = createJWT(user);
      muscle_id = '1';
      muscle_object = { name: 'chest' };
      muscle = await Muscle.create({ name: 'abs' });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(muscle_object, token, muscle_id);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(muscle_object, token, muscle_id);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid muscleID ', async () => {
      muscle_id = 'id';
      const res = await response(muscle_object, token, muscle_id);

      expect(res.status).toBe(404);
    });

    it('should return 404 if muscleID valid but muscleID not in DB', async () => {
      const muscle_id = '10000';
      const res = await response(muscle_object, token, muscle_id);

      expect(res.status).toBe(404);
    });

    // it('should return 400 if muscle is invalid', async () => {
    //   muscle_object = {};
    //   const res = await response(muscle_object, token, muscle.id);
    //
    //   expect(res.status).toBe(400);
    // });

    it('should update muscle if input is valid', async () => {
      const res = await response(muscle_object, token, muscle.id);
      const result = await Muscle.findOne({ where: { id: muscle.id } });

      expect(result).toHaveProperty('name', 'chest');
    });

    it('should return updated muscle if it is valid', async () => {
      const res = await response(muscle_object, token, muscle.id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', muscle.id);
      expect(res.body).toHaveProperty('name', 'chest');
    });
  });

  describe('DELETE /ID', () => {
    let user, token, muscle, muscle_id;

    const response = async (id, jwt) => {
      return await request
        .delete('/api/muscles/' + id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = createJWT(user);
      muscle_id = '1';
      muscle = await Muscle.create({ name: 'abs' });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(muscle_id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(muscle_id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid muscleID', async () => {
      const res = await response(muscle_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if muscleID valid but muscleID not in DB', async () => {
      const muscle_id = '10000';
      const res = await response(muscle_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete muscle if input is valid', async () => {
      const res = await response(muscle.id, token);
      const result = await Muscle.findOne({ where: { id: muscle.id } });

      expect(result).toBeNull();
    });

    it('should return deleted muscle', async () => {
      const res = await response(muscle.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', muscle.id);
      expect(res.body).toHaveProperty('name', muscle.name);
    });
  });
});
