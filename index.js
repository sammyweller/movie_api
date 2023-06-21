const express = require('express'); //imports the express module locally so it can be used within the file
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



let users = [
  {
    id: 1,
    name: "sammyweller",
    password: "goodpassword1",
    email: "email",
    dateOfBirth: "may",
    favoriteMovie: ["Contact"]
  },

  {
    id: 2,
    name: "johnsmith",
    password: "goodpassword2",
    email: "email",
    dateOfBirth: "may",
    favoriteMovie: ["Interstellar"]
  },

  {
    id: 3,
    name: "janedoe",
    password: "goodpassword3",
    email: "email",
    dateOfBirth: "may",
    favoriteMovie: ["Arrival"]
  }

]

let movies = [
  {
    title: "Contact",

    description: "description about contact",

    genre: {
      name: "sci-fi",
      description: "description about sci-fi genre"
    },

    director: {
      name: "Sagan",
      birthYear: "1950",
      deathYear: "2000"
    },

    imgUrl: "#"
  },
  {
    title: 'Interstellar',

    description: "description about interstellar",

    genre: {
      name: "sci-fi",
      description: "description about sci-fi genre"
    },

    director: {
      name: "director of interstellar",
      birthYear: "1960",
      deathYear: "2001"
    },

    imgUrl: "#"
  },
  {
    title: 'Arrival',

    description: "description of arrival",

    genre: {
      name: "sci-fi",
      description: "description of sci-fi genre"
    },

    director: {
      name: "director of arrival",
      birthYear: "1970",
      deathYear: "2002"
    },

    imgUrl: "#"
  }
];



// GET requests
/*app.get requests define the different URLs that requests can be sent to 
(also called endpoints or routes), as well as the different responses that 
should be returned for each URL: app.METHOD(PATH, HANDLER)
Handler = unction to be executed when the route is matched. */



//READ: return all movies to user: 
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});


//READ: Return data about a single movie by title to the user
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find(movie => movie.title === title);
  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('Movie not found');
  }
});

//READ: Return data about a genre by name
app.get('/movies/genre/:genreName', (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find(movie => movie.genre.name === genreName).genre;
  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('Genre not found');
  }
});

//READ: Return data about a director by name
app.get('/movies/director/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(movie => movie.director.name === directorName).director;
  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('Director not found');
  }
});

//CREATE: Allow new users to register 
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send('Please enter a name')
  }
});

//UPDATE: Allow users to update their user info
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find(user => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('User not found.')
  }
});


//CREATE: Allow users to add a movie to their list of favorites
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovie.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to the user ${id}'s array`);
  } else {
    res.status(400).send('User not found.')
  }
});


//DELETE: Allow users to remove a movie from their list of favorites

app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovie = user.favoriteMovie.filter(title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed from the user's favorites`);
  } else {
    res.status(404).send('User not found.');
  }
});


// DELETE: Allow existing users to deregister
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    users = users.filter(user => user.id != id);
    res.status(200).send(`user ${id} has been deleted.`);
  } else {
    res.status(404).send('User not found.');
  }
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