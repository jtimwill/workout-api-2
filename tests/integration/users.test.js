// const { User, Review, Product, Category, sequelize } = require('../../sequelize');
// const server = require('../../index');
// const request = require('supertest')(server);
// const createJWT = require('../../utilities/tokenUtility');
//
// describe('/api/users', () => {
//   afterEach(async () => {
//     await User.destroy({ where: {} });
//     await Product.destroy({ where: {} });
//     await Review.destroy({ where: {} });
//     await Category.destroy({ where: {} });
//   });
//
//   afterAll(async () => {
//     await sequelize.close();
//   });
//
//   describe('GET /', () => {
//     let token, user;
//
//     const response = async (jwt) => {
//       return await request
//         .get('/api/users')
//         .set('x-auth-token', jwt);
//     };
//
//     beforeEach(async () => {
//       user = User.build({ admin: true });
//       token = createJWT(user);
//
//       await User.bulkCreate([
//         { username: 'bob' , email: 'bob@example.com', password_digest: 123456 },
//         { username: 'tom' , email: 'tom@example.com', password_digest: 123456 }
//       ]);
//     });
//
//     it('should return 401 if client not logged in', async () => {
//       token = '';
//       const res = await response(token);
//
//       expect(res.status).toBe(401);
//     });
//
//     it('should return 403 if user is not admin', async () => {
//       user = User.build({ admin: false });
//       token = createJWT(user);
//       const res = await response(token);
//
//       expect(res.status).toBe(403);
//     });
//
//     it('should return all users (stat code 200)', async () => {
//       const res = await response(token);
//
//       expect(res.status).toBe(200);
//       expect(res.body.length).toBe(2);
//       expect(res.body.some(u => u.username === 'bob')).toBeTruthy();
//       expect(res.body.some(u => u.email === 'bob@example.com')).toBeTruthy();
//       expect(res.body.some(u => u.username === 'tom')).toBeTruthy();
//       expect(res.body.some(u => u.email === 'tom@example.com')).toBeTruthy();
//     });
//   });
//
//   describe('POST /', () => {
//     let user_object;
//
//     const response = async (object) => {
//       return await request
//         .post('/api/users')
//         .send(object);
//     };
//
//     beforeEach(async () => {
//       user_object = {
//         username: 'bob',
//         email: 'bob@example.com',
//         password: '123456'
//       };
//     });
//
//     it('should return 400 if user is invalid', async () => {
//       user_object = { email: 'bob@example.com', password: '123' };
//       const res = await response(user_object);
//
//       expect(res.status).toBe(400);
//     });
//
//     it('should return 400 if user exists already', async () => {
//       const first_user = await User.create({
//         username: 'bob',
//         email: 'bob@example.com',
//         password_digest: '123456'
//       });
//       const res = await response(user_object);
//
//       expect(res.status).toBe(400);
//     });
//
//     it('should save user if user is valid', async () => {
//       const res = await response(user_object);
//       const user = await User.findOne({ where: { username: 'bob' } });
//
//       expect(res.status).toBe(200);
//       expect(user).toHaveProperty('id');
//       expect(user).toHaveProperty('username', 'bob');
//       expect(user).toHaveProperty('email', 'bob@example.com');
//       expect(user).toHaveProperty('password_digest');
//     });
//
//     it('should return jwt if user is valid', async () => {
//       const res = await response(user_object);
//
//       expect(res.header).toHaveProperty('x-auth-token');
//     });
//   });
//
//   describe('GET /ME', () => {
//     let user, token;
//     const response = async (jwt) => {
//       return await request
//         .get('/api/users/me')
//         .set('x-auth-token', jwt);
//     };
//
//     beforeEach(async () => {
//       user = await User.create({
//         username: 'bob',
//         email: 'bob@example.com',
//         password_digest: '123456'
//       });
//       token = createJWT(user);
//
//       other_user = await User.create({
//         username: 'seth',
//         email: 'seth@example.com',
//         password_digest: '123456',
//       });
//
//       category = await Category.create({ name: 'Soda' });
//       product1 = await Product.create({
//         title: 'Pepsi',
//         description: 'Pepsi Soda',
//         price: 2.99,
//         small_image_path: "/",
//         large_image_path: "/",
//         categoryId: category.id,
//       });
//       product2 = await Product.create({
//         title: 'Sprite',
//         description: 'Sprite Soda',
//         price: 2.49,
//         small_image_path: "/",
//         large_image_path: "/",
//         categoryId: category.id,
//       });
//       await Review.bulkCreate([
//         { productId: product1.id, userId: user.id, title: 'Great', body: "b1", rating: 5 },
//         { productId: product1.id, userId: user.id, title: 'Bad', body: "b2", rating: 1 },
//         { productId: product2.id, userId: other_user.id, title: 'Meh', body: "b3", rating: 3 }
//       ]);
//     });
//
//
//     it('should return 401 if client not logged in', async () => {
//       const token = '';
//       const res = await response(token);
//
//       expect(res.status).toBe(401);
//     });
//
//     it('should return specific user and associated reviews and orders if valid ID', async () => {
//       const res = await response(token);
//
//       expect(res.status).toBe(200);
//       expect(res.body).toHaveProperty('username', user.username);
//       expect(res.body).toHaveProperty('email', user.email);
//
//       expect(res.body.reviews.length).toBe(2);
//       expect(res.body.reviews.some(e => e.userId === user.id)).toBeTruthy();
//       expect(res.body.reviews.some(e => e.userId === other_user.id)).toBeFalsy();
//       expect(res.body.reviews.some(e => e.title === 'Great')).toBeTruthy();
//       expect(res.body.reviews.some(e => e.title === 'Bad')).toBeTruthy();
//       expect(res.body.reviews.some(e => e.title === 'Meh')).toBeFalsy();
//       expect(res.body.reviews.some(e => e.body === 'b1')).toBeTruthy();
//       expect(res.body.reviews.some(e => e.body === 'b2')).toBeTruthy();
//       expect(res.body.reviews.some(e => e.body === 'b3')).toBeFalsy();
//       expect(res.body.reviews.some(e => e.rating === 5)).toBeTruthy();
//       expect(res.body.reviews.some(e => e.rating === 1)).toBeTruthy();
//       expect(res.body.reviews.some(e => e.rating === 3)).toBeFalsy();
//     });
//   });
//
//   describe('PUT /ME', () => {
//     let user, token, user_object;
//
//     const response = async (object, jwt) => {
//       return await request
//         .put('/api/users/me')
//         .set('x-auth-token', jwt)
//         .send(object);
//     };
//
//     beforeEach(async () => {
//       user = await User.create({
//         username: 'bob',
//         email: 'bob@example.com',
//         password_digest: '123456'});
//       token = createJWT(user);
//       user_object = { username: 'binky', email: 'binky@badbunny.com' }
//     });
//
//     it('should return 401 if client not logged in', async () => {
//       token = '';
//       const res = await response(user_object, token);
//
//       expect(res.status).toBe(401);
//     });
//
//     // it('should return 400 if user is invalid', async () => {
//     //   user_object = { username: '' };
//     //   const res = await response(user_object, token);
//     //
//     //   expect(res.status).toBe(400);
//     // });
//
//     it('should update user if input is valid', async () => {
//       const res = await response(user_object, token);
//       const result = await User.findOne({ where: { id: user.id }});
//
//       expect(result).toHaveProperty('username', 'binky');
//     });
//
//     it('should return updated user if it is valid', async () => {
//       const res = await response(user_object, token);
//
//       expect(res.status).toBe(200);
//       expect(res.body).toHaveProperty('username', 'binky');
//       expect(res.body).toHaveProperty('email', 'binky@badbunny.com');
//     });
//   });
//
//   describe('DELETE /ID', () => {
//     let user, token;
//
//     const response = async (id, jwt) => {
//       return await request
//         .delete('/api/users/' + id)
//         .set('x-auth-token', jwt);
//     };
//
//     beforeEach(async () => {
//       user = await User.create({
//         username: 'bob',
//         email: 'bob@example.com',
//         admin: true,
//         password_digest: '123456'
//       });
//       token = createJWT(user);
//     });
//
//     it('should return 401 if client not logged in', async () => {
//       token = '';
//       const res = await response(user.id, token);
//
//       expect(res.status).toBe(401);
//     });
//
//     it('should return 403 if user is not an admin', async () => {
//       user = User.build({ admin: false });
//       token = createJWT(user);
//       const res = await response(user.id, token);
//
//       expect(res.status).toBe(403);
//     });
//
//     it('should return 404 if invalid ID', async () => {
//       user = User.build({ admin: true });
//       token = createJWT(user);
//       const user_id = 'id';
//       const res = await response(user_id, token);
//
//       expect(res.status).toBe(404);
//     });
//
//     it('should return 404 if id valid but ID not in DB', async () => {
//       const user_id = 10000;
//       const res = await response(user_id, token);
//
//       expect(res.status).toBe(404);
//     });
//
//     it('should delete user if input is valid', async () => {
//       const res = await response(user.id, token);
//       const result = await User.findOne({ where: { id: user.id }});
//
//       expect(result).toBeNull();
//     });
//
//     it('should return deleted user', async () => {
//       const res = await response(user.id, token);
//
//       expect(res.status).toBe(200);
//       expect(res.body).toHaveProperty('id', user.id);
//       expect(res.body).toHaveProperty('username', user.username);
//       expect(res.body).toHaveProperty('email', user.email);
//     });
//   });
// });
