//import the models: 
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;



//allows Mongoose to connect to that database so it can perform CRUD operations: 
mongoose.connect('mongodb://localhost:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });

//imports the express module locally so it can be used within the file:
const express = require('express'); 
morgan = require('morgan');
bodyParser = require('body-parser'),
  uuid = require('uuid');


const app = express(); //declares a variable that encapsulates Express’s functionality to configure your web server


app.use(morgan('common')); //logging - middleware for Express with common format
/* automatically routes all requests for static files to their 
corresponding files within a certain folder on the server: */
app.use(express.static('public'));
app.use(bodyParser.json()); //data will be expected to be in JSON format (and read as such).

//above: use the bodyParser middleware to parse incoming HTTP requests that have a JSON payload
//This allows the application to access and work with the data sent in the JSON format within the request.



// READ: Get all users
app.get('/users', (req, res) => {
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
app.get('/users/:username', (req, res) => {
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
app.get('/movies', (req, res) => {
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
app.get('/movies/:title', (req, res) => {
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
app.get("/genre/:name", (req, res) => {
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
app.get("/director/:name", (req, res) => {
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
app.post('/users', (req, res) => {
  Users.findOne({ username: req.body.username }) //check if they exist
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.username + 'already exists');
      } else {
        Users
          .create({ //if they don't already exist, create new user
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            dateOfBirth: req.body.dateOfBirth
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});



// UPDATE: Allow users to update their user info by username 
app.put("/users/:username", (req, res) => {
  Users.findOneAndUpdate(
    { username: req.params.username },
    {
      $set: {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        dateOfBirth: req.body.dateOfBirth,
      },
    },
    { new: true }
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    });
});



// CREATE: Allow users to add a movie to their list of favorites 
app.post('/users/:username/movies/:MovieID', (req, res) => {
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
app.delete('/users/:username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate(
    { username: req.params.username },
    { $pull: { favoriteMovies: req.params.MovieID } },
    { new: true }
  )
    .then((updatedUser) => {
      res.status(200).send(
        'The movie with ID ' +
          req.params.MovieID +
          ' was successfully deleted from the list of favorites. ' +
          'Favorites of ' +
          updatedUser.username +
          ': ' +
          updatedUser.favoriteMovies
      );
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});



//  DELETE: Allow existing users to deregister 
app.delete('/users/:username', (req, res) => {
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


// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});