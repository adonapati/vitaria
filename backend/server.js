const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 5008;
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// User Model
const User = require('./models/user');

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const mongoURI =  process.env.MONGO_URI;

// MongoDB Connection
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('MongoDB connected successfully');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

// Example signup route
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({ email, password });
        await newUser.save();

        // Return the new user with _id
        res.status(201).json({ message: 'User created successfully!', user: newUser });
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).json({ message: 'Error creating user', error });
    }
});

// Example login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, password }); // Add proper password hashing and comparison in production!
        if (user) {
            res.status(200).json({ message: 'Login successful!', user });
        } else {
            res.status(401).json({ message: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ message: 'Error during login', error });
    }
});

// Profile route for updating user data
app.post('/profile', async (req, res) => {
    const { 
        userId, 
        weight, 
        height, 
        age, 
        gender, 
        allergies, 
        dietPreferences,
        prepTime,
        activityLevel,
        cuisinePreferences,
        healthConditions
    } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                weight,
                height,
                age,
                gender,
                allergies,
                dietPreferences,
                prepTime,
                activityLevel,
                cuisinePreferences,
                healthConditions
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully!',
            user: updatedUser
        });

    } catch (error) {
        console.error('Error updating profile:', error.message);
        res.status(500).json({ message: 'Error updating profile', error });
    }
});

// Controller for User Profile
// Get User Profile
app.get('/user/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user); // Return user data if found
    } catch (error) {
        console.error(error); // Log the error to server console
        res.status(500).json({ message: "Error retrieving user profile" });
    }
});

// Update User Profile
app.put('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    const updateData = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'Profile updated successfully!', user: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error.message);
        res.status(500).json({ message: 'Error updating profile', error });
    }
});

// Delete User Profile
app.delete('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully!' });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ message: 'Error deleting user', error });
    }
});

// Utility function to parse recipe suggestions into a structured format
function parseRecipeSuggestions(recipeText) {
    const recipeLines = recipeText.split('\n');
    const recipes = recipeLines.map(line => {
        const [name, description, category] = line.split('-');
        return {
            name: name.trim(),
            description: description?.trim() || 'No description available',
            category: category?.trim() || 'Unknown',
        };
    });
    return recipes;
}

// Gemini API URL
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

async function getRecipeFromGemini(userId) {
    // Fetch user details from MongoDB
    const user = await User.findById(userId);
    if (!user) {
        console.error('User not found');
        return null;
    }

    // Construct the prompt with user-specific details
    const prompt = buildPrompt(user);

    const headers = {
        'Content-Type': 'application/json',
    };

    const data = {
        contents: [
            {
                parts: [
                    {
                        text: prompt,
                    },
                ],
            },
        ],
    };

    try {
        const response = await axios.post(url, data, { headers });
        if (response.status === 200) {
            const recipes = response.data.candidates.map(candidate => ({
                instructions: candidate.content.parts.map(part => part.text).join('\n').trim(),
            }));
            return { instructions: recipes };
        } else {
            console.error(`Error: Unable to fetch data from Gemini (Status Code: ${response.status})`);
            return null;
        }
    } catch (error) {
        console.error('Error fetching recipe:', error);
        return null;
    }
}

function buildPrompt(user) {
    const { age, allergies, activityLevel, gender, height, prepTime, weight, healthConditions, cuisinePreferences, dietPreferences } = user;

    return `
You are a chef creating recipes. Generate 5 detailed recipes, each with the following structured information:
1. Recipe Name
2. Description (A brief overview of the dish)
3. Prep Time (in minutes)
4. Category (e.g., Appetizer, Main Course, Dessert)
5. Ingredients (list each ingredient on a new line with a '-')
6. Instructions (list each step on a new line with a '-')

Consider these user preferences:
- Diet preferences: ${dietPreferences.join(', ') || 'None'}
- Cuisine preferences: ${cuisinePreferences.join(', ') || 'Any'}
- Allergies: ${allergies.join(', ') || 'None'}
- Health conditions: ${healthConditions.join(', ') || 'None'}
- Preferred prep time: ${prepTime || 'Any'}
- Activity level: ${activityLevel || 'Moderate'}
and also their height being ${height}, weight being ${weight} and them being of age ${age} and gender ${gender}

Please follow this format for each recipe:
Recipe Name: [Name]
Description: [Brief description]
Prep Time: [Time]
Calories:[calories]
Category: [Category]
Ingredients:
- [Ingredient 1]
- [Ingredient 2]
Instructions:
- [Step 1]
- [Step 2]
End of Recipe

Start generating the recipes now.
`;
}

// Route to get detailed recipes for a specific user
app.get('/api/recipe/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const { instructions } = await getRecipeFromGemini(userId);
        res.json({ instructions });
    } catch (error) {
        console.error('Error fetching recipe details:', error.message);
        res.status(500).json({ message: 'Error fetching recipe details', error });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});