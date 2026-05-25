/*
 * User model
 * ----------
 * Mongoose schema for the `users` collection.
 *
 * Spec-mandated field types:
 *   id         : Number   (the user's "real" ID — distinct from _id)
 *   first_name : String
 *   last_name  : String
 *   birthday   : Date
 *
 * `id` is marked unique so the database itself prevents two users
 * from sharing the same identifier. `versionKey: false` removes the
 * automatic __v field from JSON responses.
 */

const mongoose = require('mongoose');

// Define Schema for users with required constraints
const usersSchema = new mongoose.Schema({
	id:         { type: Number, required: true, unique: true },
	first_name: { type: String, required: true, trim: true },
	last_name:  { type: String, required: true, trim: true },
	birthday:   { type: Date,   required: true }
}, { versionKey: false });

module.exports = mongoose.model('users', usersSchema);
