const mongoose = require('mongoose');

//define the schemas:

let movieSchema = mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    genre: {
      name: String,
      description: String
    },
    director: {
      name: String,
      bio: String,
      birth: String
    },
    imagePath: String,
    featured: Boolean
  });
  
  let userSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String, required: true},
    dateOfBirth: Date,
    favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
  });
  

  //create the models that use the defined schemas: 

  let Movie = mongoose.model('Movie', movieSchema);
  let User = mongoose.model('User', userSchema);

  
  //exporting the models:
  
  module.exports.Movie = Movie;
  module.exports.User = User;