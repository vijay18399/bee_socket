var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var MessageSchema = new Schema({
  to: String,
  from: String,
  message: String,
  score: Number,
  spamcheck: String,
  createdAt: Date,
  groupid:String,
  isBan: { type: Boolean, default: false },
  isfile: { type: Boolean, default: false },
  ext: String,
  file: String,
  isTagged: { type: Boolean, default: false },
  TagName :String,
  original: String,
  isdeleted: { type: Boolean, default: false }
});
module.exports = mongoose.model('Message', MessageSchema);