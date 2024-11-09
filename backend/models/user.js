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
    healthConditions: [{ type: String }], // Added healthConditions

    dailyRecords: [{
        date: { 
            type: Date, 
            required: true, 
            default: () => new Date().setHours(0, 0, 0, 0) // Default to today's date (midnight)
        },
        calories: { type: Number, default: undefined }, // Allow undefined if not updated
        waterIntake: { type: Number, default: undefined }, // Allow undefined if not updated
        recommendedWaterIntake: { type: Number, default: undefined }, // Allow undefined if not updated
        recommendedCalories: { type: Number, default: undefined } // Allow undefined
    }],
});

const User = mongoose.model('User', UserSchema);
module.exports = User;