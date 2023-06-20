const express = require('express'); //imports the express module locally so it can be used within the file
    morgan = require('morgan');
    fs = require('fs'), // import built in node modules fs and path 
    path = require('path');

const app = express(); //declares a variable that encapsulates Express’s functionality to configure your web server

// create a write stream (in append mode - a ‘log.txt’ file is created in root directory:
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})


app.use(morgan('combined', {stream: accessLogStream})); // setup the logger


let users = [
  {
    username: "sammyweller",
    password: "goodpassword1",
    email: "",
    dateOfBirth: "",
    favoriteMovie: "Contact"
  },

  {
    username: "johnsmith",
    password: "goodpassword2",
    email: "",
    dateOfBirth: "",
    favoriteMovie: "Interstellar"
  },

  {
    username: "janedoe",
    password: "goodpassword3",
    email: "",
    dateOfBirth: "",
    favoriteMovie: "Arrival"
  }

]

let topMovies = [
    {
      title: "Contact",
    
      description: "",
      
      genre: {
        name: "",
        description: ""
      },
      
      director: {
        name: "",
        birthYear: "",
        deathYear: ""
      },

      imgUrl: ""
    },
    {
      title: 'Interstellar',

      description: "",
      
      genre: {
        name: "",
        description: ""
      },
      
      director: {
        name: "",
        birthYear: "",
        deathYear: ""
      },

      imgUrl: ""
    },
    {
      title: 'Arrival',
      
      description: "",
      
      genre: {
        name: "",
        description: ""
      },
      
      director: {
        name: "",
        birthYear: "",
        deathYear: ""
      },

      imgUrl: ""
    }
  ];

  /* automatically routes all requests for static files to their 
  corresponding files within a certain folder on the server: */
  app.use(express.static('public')); 


  // GET requests
  /*app.get requests define the different URLs that requests can be sent to 
  (also called endpoints or routes), as well as the different responses that 
  should be returned for each URL: app.METHOD(PATH, HANDLER)
  Handler = unction to be executed when the route is matched. */

  app.get('/', (req, res) => {
    res.send('Welcome to my top movies!'); //send = sends a response of various types
  });
  
  app.get('/documentation', (req, res) => {                  
    res.sendFile('public/documentation.html', { root: __dirname }); //sendFile = sends an HTML file to the browser
  });
  
  app.get('/movies', (req, res) => {
    res.json(topMovies); //json = sends a JSON response
  });

  app.get('/secreturl', (req, res) => {
    res.send('This is a secret url with super top-secret content.');
  });


  app.use((err, req, res, next) => { //error-handling
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

  
  // listen for requests
  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });