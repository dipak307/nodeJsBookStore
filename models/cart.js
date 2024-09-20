const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
      },
      quantity: {
        type: Number,
        default: 1
      },
      title:{
        type:String
      },
      price:{
        type:String
      },
      coverImage:{
        type:String
      }

    }
  ]
});

module.exports = mongoose.model('Cart', cartSchema);
