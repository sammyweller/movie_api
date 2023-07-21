//import the models: 
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;


//allows Mongoose to connect to that database so it can perform CRUD operations: 
//mongoose.connect('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Imports the express module locally so it can be used within the file:
const express = require('express'); 
const morgan = require('morgan');
const bodyParser = require('body-parser')
const uuid = require('uuid');
const { check, validationResult } = require('express-validator');


const app = express(); //declares a variable that encapsulates Express’s functionality to configure your web server


//Allow requests from certain domains:
const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://localhost:1234', 'https://sw-movieapp.netlify.app', 'https://sw-myflix-app-baa5e3f40824.herokuapp.com'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));



//Middleware: 
app.use(morgan('common')); // logs info about incoming HTTP requests for debugging and analysis, common format
app.use(express.static('public')); //automatically routes all requests for static files to their corresponding files within a certain folder on the server. Tells app to make "public" folder accessible to anyone who visits.
app.use(bodyParser.json()); //data will be expected to be in JSON format (and read as such)

/* The bodyParser middleware helps the application understand the JSON data sent in the request. 
It takes care of decoding and processing the JSON payload, making it accessible and usable within the app. */



let auth = require('./auth')(app); // Import auth.js. Must be placed after bodyParser middleware function
const passport = require('passport');
require('./passport');




// CRUD: 

//READ: Welcome message
app.get('/', (req, res) => {
  res.send('Welcome to the best movie app in the world!');
});



// READ: Get all users
app.get('/users', passport.authenticate('jwt', { session: false }),   (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


// READ: get a user by username
app.get('/users/:username', passport.authenticate('jwt', { session: false }),  (req, res) => {
  Users.findOne({ username: req.params.username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


//READ: return all movies to user: 
app.get('/movies', passport.authenticate('jwt', { session: false }),  (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


//READ: Return data about a single movie by title to the user 
app.get('/movies/:title', passport.authenticate('jwt', { session: false }),  (req, res) => {
  Movies.findOne({ title: req.params.title })
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


// READ: Return data about a genre by name 
app.get("/genre/:name", passport.authenticate('jwt', { session: false }),  (req, res) => {
    Movies.findOne({ "genre.name": req.params.name })
      .then((movie) => {
        res.status(200).json(movie.genre.description);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);


//READ: Return data about a director by name 
app.get("/director/:name", passport.authenticate('jwt', { session: false }),   (req, res) => {
  Movies.findOne({ "director.name": req.params.name })
    .then((movie) => {
      res.status(200).json(movie.director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
}
);


// CREATE: Add a user 
app.post('/users', 
[
  check('username', 'Username is required').isLength({min: 5}),
  check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('password', 'Password is required').not().isEmpty(),
  check('email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
   // check the validation object for errors:
   let errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(422).json({ errors: errors.array() });
   }
  let hashedPassword = Users.hashPassword(req.body.password);
  Users.findOne({ username: req.body.username }) // Search to see if a user with the requested username already exists
    .then((user) => {
      if (user) {
      //If the user is found, send a response that it already exists
        return res.status(400).send(req.body.username + ' already exists');
      } else {
        Users
          .create({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            dateOfBirth: req.body.dateOfBirth
          })
          .then((user) => { res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});


// UPDATE: Allow users to update their user info by username 
app.put('/users/:username', passport.authenticate('jwt', { session: false }),
  [
    check('username', 'Username is required').isLength({ min: 5 }),
    check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {
    let errors = validationResult(req);
    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $set: {
          username: req.body.username,
          password: hashedPassword,
          email: req.body.email,
          dateOfBirth: req.body.dateOfBirth
        },
      },
      { new: true }
    )
      .then((user) => {
        if (!user) {
          return res.status(404).send('Error: No user was found');
        } else {
          res.json(user);
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });


// CREATE: Allow users to add a movie to their list of favorites 
app.post('/users/:username/movies/:MovieID', passport.authenticate('jwt', { session: false }),  (req, res) => {
  Users.findOneAndUpdate(
    { username: req.params.username },
    { $push: { favoriteMovies: req.params.MovieID } },
    { new: true }
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


// DELETE: Allow users to remove a movie from their list of favorites
app.delete('/users/:username/movies/:MovieID', passport.authenticate('jwt', { session: false }),  (req, res) => {
  Users.findOneAndUpdate(
    { username: req.params.username },
    { $pull: { favoriteMovies: req.params.MovieID } },
    { new: true }
    )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
    });
}
);


//  DELETE: Allow existing users to deregister 
app.delete('/users/:username', passport.authenticate('jwt', { session: false }),  (req, res) => {
  Users.findOneAndRemove({ username: req.params.username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.username + ' was not found');
      } else {
        res.status(200).send(req.params.username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});



//error-handling: 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});