const express = require('express');
const app = express();
const config = require('config');
require('express-async-errors');
const helmet = require('helmet');
const compression = require('compression')
const cors = require('cors');

const users = require('./routes/users');
const workouts = require('./routes/workouts');
const target_exercises = require('./routes/target_exercises');
const completed_workouts = require('./routes/completed_workouts');
const completed_exercises = require('./routes/completed_exercises');
const exercises = require('./routes/exercises');
const muscles = require('./routes/muscles');
const login = require('./routes/login');
const error = require('./middleware/error');

app.use(helmet());
app.use(compression());
app.use(cors());
app.get('/api', (req, res) => {
  const url = "https://github.com/jtimwill/workout-api-2";
  res.send(`See README for API use instructions: ${url}`);
});
app.use(express.json());
app.use('/api/users', users);
app.use('/api/workouts', workouts);
  app.use('/api/workouts', target_exercises);
app.use('/api/completed_workouts', completed_workouts);
  app.use('/api/completed_workouts', completed_exercises);
app.use('/api/exercises', exercises);
app.use('/api/muscles', muscles);
app.use('/api/login', login);
app.use(express.static('public'));
app.use(error);

if (!config.get('jwt_private_key'))
  throw new Error('FATAL ERROR: jwt_private_key is not defined.');

if (!config.get('bcrypt_salt'))
  throw new Error('FATAL ERROR: bcrypt_salt is not defined.');

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || config.get('port');
  const server = app.listen(port, () => console.log(`Listening on port ${port}...`));
}
module.exports = app;
