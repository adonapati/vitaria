const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    weight: { type: Number },
    height: { type: Number },
    age: { type: Number },
    gender: { type: String }, 
    allergies: [{ type: String }],
    dietPreferences: [{ type: String }],
    prepTime: { type: String },  // Added prepTime
    activityLevel: { type: String }, // Added activityLevel
    cuisinePreferences: [{ type: String }], // Added cuisinePreferences
    healthConditions: [{ type: String }] // Added healthConditions
});

const User = mongoose.model('User', UserSchema);
module.exports = User;