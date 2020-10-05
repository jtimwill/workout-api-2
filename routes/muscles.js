const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Muscle } = require('../sequelize');

router.get('/', auth, async (req, res) => {
  const muscles = await Muscle.findAll();
  res.send(muscles);
});

router.get('/:id', [auth, admin], async (req, res) => {
  const muscle = await Muscle.findOne({ where: { id: req.params.id }});
  if (!muscle) {
    res.status(404).send('Muscle with submitted ID not found');
  } else {
    res.send(muscle);
  }
});

router.post('/', [auth, admin], async (req, res) => {
  try {
    const muscle = await Muscle.create({ name: req.body.name });
    res.send(muscle);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.put('/:id', [auth, admin], async (req, res) => {
  const muscle = await Muscle.findOne({ where: { id: req.params.id }});
  if (!muscle) {
    return res.status(404).send('Muscle with submitted ID not found');
  }
  try {
    const updated_muscle = await muscle.update({ name: req.body.name });
    res.send(updated_muscle);
  } catch(err) {
    res.status(400).send(err);
  }
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const muscle = await Muscle.findOne({ where: { id: req.params.id }});
  if (!muscle) {
    res.status(404).send('Muscle with submitted ID not found');
  } else {
    await muscle.destroy();
    res.send(muscle);
  }
});

module.exports = router;
