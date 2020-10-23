# Workout API 2

## Project Description
This is an updated version of my original workout API. I based the folder structure, authentication and authorization on what I learned in the following course: https://codewithmosh.com/p/the-complete-node-js-course

The basic technology stack is:
* Sequelize + PostgreSQL/SQLite (database)
* Express (web server)
* Jest (testing framework)
* Node.js (run-time environment)

NPM Modules Used:
1. $ npm i sequelize
2. $ npm i sqlite3
3. $ npm i express # most popular framework for building web servers on Node
4. $ npm i -g nodemon # auto restart app, run like this: $ nodemon index.js
5. $ npm i config # manage configuration (manage secrets in env vars)
6. $ npm i bcrypt # install the bcrypt library
7. $ npm i jsonwebtoken # generate authentication token
8. $ npm i express-async-errors # handle async errors in express route handlers
9. $ npm i jest --save-dev # Install jest in your dev dependencies
10. $ npm i supertest --save-dev # send HTTP requests to your endpoints
11. $ npm i moment # lib for working with dates and times (maybe expire token)
12. $ npm i helmet # secure app by setting various HTTP headers (best practice)
13. $ npm i compression # compress the HTTP response we send to the client.
14. $ npm i cors # enable cross-origin resource sharing
15. $ npm i pg # postgres package for production db

## Project Setup
1. Install Node.js: https://nodejs.org/
2. Download project files
3. ``` $ cd workout-api-2 ``` # navigate to project's root directory
4. ``` $ npm i ``` # install the packages listed in package.json
5. From the command line, set the value of the following environment variables:
    * jwt_private_key: used to create the JSON Web tokens that allow users to securely log in to the application.
        * Example (Mac): ``` $ export workout_api_jwt_private_key=your_private_key ```
    * bcrypt_salt: specifiy the number of rounds used to create the salt used in the hashing algorithm.
        * Example (Mac): ``` $ export workout_api_bcrypt_salt=5 ```
6. ``` $ node sequelize.js ``` # Create development database
7. ``` $ node seed_db ``` # seed the database with quizzes
8. ``` $ NODE_ENV=test node sequelize.js ``` # Create test database
9. ``` $ npm test ``` # Run tests
10. ``` $ npm start ``` # start server
11. Done. You can now use a command line tool like ``` $ curl ```, or an application like Postman to test the API endpoints.
12. ``` $ npm outdated ``` # check for outdated packages
13. ``` $ npm update ``` # update packages

Additional resources that helped me:
* Express Static Files:
  * https://expressjs.com/en/starter/static-files.html
* Sequelize Setup:
  * http://docs.sequelizejs.com
  * https://www.codementor.io/mirko0/how-to-use-sequelize-with-node-and-express-i24l67cuz
  * https://arjunphp.com/restful-api-using-async-await-node-express-sequelize/
  * https://www.youtube.com/watch?v=6NKNfXtKk0c
  * https://stackoverflow.com/questions/23929098/is-multiple-delete-available-in-sequelize
* Sequelize Models:
  * https://sequelize.org/master/manual/model-basics.html
  * https://sequelize.org/master/manual/validations-and-constraints.html
* Sequelize Deployement to Heroku:
  * http://docs.sequelizejs.com/manual/installation/usage.html
  * https://sequelize.readthedocs.io/en/1.7.0/articles/heroku/
* Jest Options:
  * https://stackoverflow.com/questions/50171932/run-jest-test-suites-in-groups
* Node Environment Variables:
  * https://stackoverflow.com/questions/9198310/how-to-set-node-env-to-production-development-in-os-x

## App Structure
<p align="center">
  <img alt="Image of App Structure" src="https://raw.githubusercontent.com/jtimwill/workout-api-2/master/images/workout-api-diagram.png" />
</p>

## Entity Relationship Diagram
<p align="center">
  <img alt="Image of ERD" src="https://raw.githubusercontent.com/jtimwill/workout-api-2/master/images/workout-erd.png"/>
</p>

## Routes and Resources
### Users Resource
|URL|HTTP verb|Result|Include JWT?|Admin only?|
|---|---|---|---|---|
/api/users|POST|create a new user|No|No|
/api/users|GET|return all users|Yes|Yes|
/api/users/me|GET|return current|Yes|No|
/api/users/me|PUT|update current user|Yes|No|
/api/users/:id|DELETE|delete a user|Yes|Yes|

### Workouts Resource
|URL|HTTP verb|Result|Include JWT?|Admin only?|
|---|---|---|---|---|
/api/workouts|POST|create a new workout|Yes|No|
/api/workouts|GET|return all workouts and target exercises for current user|Yes|No|
/api/workouts/:id|GET|return a workout and its target exercises|Yes|No|
/api/workouts/:id|PUT|update a specific workout|Yes|No|
/api/workouts/:id|DELETE|delete a specific workout and its target exercises|Yes|No|

### TargetExercises Resource
|URL|HTTP verb|Result|Include JWT?|Admin only?|
|---|---|---|---|---|
/api/workouts/:workoutId/target_exercises|POST|create a new target exercise for workout|Yes|No|
/api/workouts/:workoutId/target_exercises|GET|return all target exercises for workout|Yes|No|
/api/workouts/:workoutId/target_exercises/:id|GET|return a specific target exercise|Yes|No|
/api/workouts/:workoutId/target_exercises/:id|PUT|update a specific target exercise|Yes|No|
/api/workouts/:workoutId/target_exercises/:id|DELETE|delete a specific target exercises|Yes|No|

### Exercises Resource
|URL|HTTP verb|Result|Include JWT?|Admin only?|
|---|---|---|---|---|
/api/exercises|POST|create a new exercise|Yes|Yes|
/api/exercises|GET|return all exercises|Yes|No|
/api/exercises/:id|GET|return a specific exercise|Yes|Yes|
/api/exercises/:id|PUT|update a specific exercises|Yes|Yes|
/api/exercises/:id|DELETE|delete a specific exercise|Yes|Yes|

### Muscles Resource
|URL|HTTP verb|Result|Include JWT?|Admin only?|
|---|---|---|---|---|
/api/muscles|POST|create a new muscle|Yes|Yes|
/api/muscles|GET|return all muscles|Yes|No|
/api/muscles/:id|GET|return a specific muscle|Yes|Yes|
/api/muscles/:id|PUT|update a specific muscle|Yes|Yes|
/api/muscles/:id|DELETE|delete a specific muscle|Yes|Yes|

### Completed Workouts Resource
|URL|HTTP verb|Result|Include JWT?|Admin only?|
|---|---|---|---|---|
/api/completed_workouts|POST|create a new completed workout|Yes|No|
/api/completed_workouts|GET|return all completed workouts and completed exercises for current user|Yes|No|
/api/completed_workouts/:id|GET|return a completed workout and its completed exercises|Yes|No|
/api/completed_workouts/:id|PUT|update a specific completed workout|Yes|No|
/api/completed_workouts/:id|DELETE|delete a specific completed workout and its completed exercises|Yes|No|

### Completed Exercises Resource
|URL|HTTP verb|Result|Include JWT?|Admin only?|
|---|---|---|---|---|
/api/completed_workouts/:completedWorkoutId/target_exercises|POST|create a new target exercise for workout|Yes|No|
/api/completed_workouts/:completedWorkoutId/target_exercises|GET|return all target exercises for workout|Yes|No|
/api/completed_workouts/:completedWorkoutId/target_exercises/:id|GET|return a specific target exercise|Yes|No|
/api/completed_workouts/:completedWorkoutId/target_exercises/:id|PUT|update a specific target exercise|Yes|No|
/api/completed_workouts/:completedWorkoutId/target_exercises/:id|DELETE|delete a specific target exercises|Yes|No|

### Login Resource
|URL|HTTP verb|Result|Include JWT?|Admin only?|
|---|---|---|---|---|
/api/login|POST|return a new JSON web token that can be used to identify the current user|No|No|
