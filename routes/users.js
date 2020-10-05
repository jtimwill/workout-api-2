const express = require('express');
const router = express.Router();
const { User, Review } = require('../sequelize');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const createJWT = require('../utilities/tokenUtility');
const config = require('config');

router.get('/', [auth, admin], async (req, res) => {
  const users = await User.findAll();
  res.send(users);
});

router.post('/', async (req, res) => {
  const password = req.body.password;
  const salt_value = Number(config.get("bcrypt_salt"));
  const salt = await bcrypt.genSalt(salt_value);
  const password_digest = await bcrypt.hash(password, salt);

  try {
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password_digest: password_digest
    });

    res
      .header('x-auth-token', createJWT(user))
      .header('access-control-expose-headers', 'x-auth-token')
      .send(
        {
          id: user.id,
          username: req.body.username,
          email: req.body.email
        });
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findOne({
    where: { id: req.user.id},
    attributes: { exclude: ['password_digest', 'created_at', 'updated_at'] },
    include: [
      { model: Review, where: { userId: req.user.id }, required: false },
    ]
  });
  res.send(user);
});

router.put('/me', auth, async (req, res) => {
  // To do:
  // 1. add ability to update password. Don't forget to update token if password is updated.
  // 2. add ability to update a single property

  try {
      const user = await User.findOne({
        where: { id: req.user.id},
        attributes: { exclude: ['password_digest', 'created_at', 'updated_at'] }
      });
      const updated_user = await user.update({
        username: req.body.username,
        email: req.body.email
      });
      res.send(updated_user);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const user = await User.findOne({
    where: { id: req.params.id },
    attributes: { exclude: ['password_digest', 'created_at', 'updated_at'] }
  });
  if (!user) {
    res.status(404).send('User ID not found');
  } else {
    await user.destroy();
    res.send(user);
  }
});

module.exports = router;
