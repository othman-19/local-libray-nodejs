const mongoose = require('mongoose');

const { Schema } = mongoose;

const GenreSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
  },
});

// Virtual for bookinstance's URL
GenreSchema.virtual('url').get(function () {
  // eslint-disable-next-line no-underscore-dangle
  return `/catalog/genre/${this._id}`;
});

// Export model
module.exports = mongoose.model('Genre', GenreSchema);
