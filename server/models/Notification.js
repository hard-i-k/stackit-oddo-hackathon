const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  message: String,
  isRead: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Notification', notificationSchema); 