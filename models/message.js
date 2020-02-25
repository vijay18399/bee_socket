var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var MessageSchema = new Schema({
  to: String,
  from: String,
  message: String,
  score: Number,
  spamcheck: String,
  name :String,
  createdAt: Date,
  groupid:String,
  isBan: { type: Boolean, default: false },
  isfile: { type: Boolean, default: false },
  ext: String,
  file: String,
  mimetype:String,
  isTagged: { type: Boolean, default: false },
  TagName :String,
  original: String,
  type: String,
  isDeletedForAll: { type: Boolean, default: false },
  isDeletedByMe: { type: Boolean, default: false },
  isDeletedByYou: { type: Boolean, default: false },
  isDownloaded:{ type: Boolean, default: false },
  isSeen: { type: Boolean, default: false },
  myloc: String,
  urloc: String,
  isMessage:Boolean,
  question:String,
  options:Array,
  voters:Array
});
module.exports = mongoose.model('Message', MessageSchema);