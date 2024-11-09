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
    const user = await User.findById(userId);
    if (!user) {
        console.error('User not found');
        return null;
    }

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
            const recipeText = response.data.candidates[0].content.parts[0].text;
            
            // Remove all markdown code blocks and clean the text
            const cleanedText = recipeText
                .replace(/```json\s*/g, '') // Remove ```json and any following whitespace
                .replace(/```\s*/g, '')     // Remove ``` and any following whitespace
                .replace(/^\s*\[/, '[')     // Ensure the JSON starts with [
                .replace(/\]\s*$/, ']')     // Ensure the JSON ends with ]
                .trim();

            try {
                // Parse the cleaned JSON text
                const recipes = JSON.parse(cleanedText);
                
                // Validate that we have an array of recipes
                if (!Array.isArray(recipes)) {
                    throw new Error('Response is not an array');
                }

                // Validate and clean each recipe
                const validatedRecipes = recipes.map((recipe, index) => ({
                    _id: recipe._id || String(index + 1),
                    name: recipe.name || 'Unnamed Recipe',
                    imageUrl: recipe.imageUrl || 'https://via.placeholder.com/400x300',
                    prepTime: recipe.prepTime || '30 mins',
                    calories: Number(recipe.calories) || 0,
                    servings: Number(recipe.servings) || 2,
                    description: recipe.description || 'No description available',
                    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
                    instructions: Array.isArray(recipe.instructions) ? recipe.instructions : []
                }));

                return validatedRecipes;
            } catch (parseError) {
                console.error('Error parsing recipe JSON:', parseError, '\nReceived text:', cleanedText);
                return null;
            }
        }
        console.error(`Error: Unable to fetch data from Gemini (Status Code: ${response.status})`);
        return null;
    } catch (error) {
        console.error('Error fetching recipe:', error);
        return null;
    }
}

function buildPrompt(user) {
    const { age, allergies, activityLevel, gender, height, prepTime, weight, healthConditions, cuisinePreferences, dietPreferences } = user;
    return `
    You are a chef creating recipes. Generate 5 recipes in JSON format. Each recipe should strictly follow this exact structure:
    {
        "_id": "1", // increment for each recipe
        "name": "Recipe Name",
        "imageUrl": "https://via.placeholder.com/400x300",
        "prepTime": "X mins",
        "calories": number,
        "servings": number,
        "description": "Detailed description of the dish",
        "ingredients": [
            "ingredient 1 with quantity",
            "ingredient 2 with quantity"
        ],
        "instructions": [
            "Step 1 instruction",
            "Step 2 instruction"
        ]
    }

    Consider these user preferences:
    - Diet preferences: ${dietPreferences.join(', ') || 'None'}
    - Cuisine preferences: ${cuisinePreferences.join(', ') || 'Any'}
    - Allergies: ${allergies.join(', ') || 'None'}
    - Health conditions: ${healthConditions.join(', ') || 'None'}
    - Preferred prep time: ${prepTime || 'Any'}
    - Activity level: ${activityLevel || 'Moderate'}
    - Physical attributes: Height: ${height}, Weight: ${weight}, Age: ${age}, Gender: ${gender}

    Generate 5 recipes that match these preferences, ensuring each recipe:
    1. Has a unique _id (1 through 5)
    2. Includes precise measurements in ingredients
    3. Has clear, step-by-step instructions
    4. Specifies exact prepTime and calories
    5. Includes a servings count
    6. Has a detailed description
    7. Uses placeholder images (https://via.placeholder.com/400x300)

    Return the recipes as a JSON array.
    `;
    }

// Route to get detailed recipes for a specific user
app.get('/api/recipe/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const recipes = await getRecipeFromGemini(userId);
        if (!recipes) {
            return res.status(500).json({ 
                message: 'Error generating recipes',
                fallback: MOCK_RECIPES // Send mock recipes as fallback
            });
        }
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching recipe details:', error.message);
        res.status(500).json({ 
            message: 'Error fetching recipe details', 
            error: error.message,
            fallback: MOCK_RECIPES // Send mock recipes as fallback
        });
    }
});

function buildCalorieAndWaterPrompt(user) {
    const { age, activityLevel, gender, height, weight, healthConditions } = user;
    return `
    You are a nutrition expert. Based on the user's profile below, provide personalized daily recommendations including:

    1. **Calorie Intake**: The recommended minimum and maximum number of calories the user should consume daily in kcal.
    2. **Water Intake**: The recommended minimum and maximum amount of water the user should drink daily in liters.

    Please return the results in the following JSON format:
    {
        "calorieIntake": {
            "min": number, // e.g., 1800
            "max": number  // e.g., 2500
        },
        "waterIntake": {
            "min": "X liters", // e.g., "2.5 liters"
            "max": "Y liters"  // e.g., "3.5 liters"
        }
    }

    User's Profile:
    - Age: ${age} years
    - Gender: ${gender}
    - Height: ${height} cm
    - Weight: ${weight} kg
    - Activity Level: ${activityLevel || 'Moderate'} // Options: Sedentary, Light, Moderate, Active, Very Active
    - Health Conditions: ${healthConditions.join(', ') || 'None'}

    Ensure the recommendations are tailored to the user's physical attributes, activity level, and any health conditions. Provide ranges to accommodate variations in individual needs.
    `;
}async function getCalorieAndWaterIntake(userId) {
    const user = await User.findById(userId);
    if (!user) {
        console.error('User not found');
        return null;
    }

    const prompt = buildCalorieAndWaterPrompt(user);
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
            let intakeData = response.data.candidates[0].content.parts[0].text;

            // Clean up markdown formatting if present
            intakeData = intakeData
                .replace(/```json\s*/g, '') // Remove starting ```json
                .replace(/```\s*/g, '')     // Remove trailing ```
                .trim();

            // Use regex to extract JSON object if there are any extra characters
            const jsonMatch = intakeData.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON object found');
            }

            // Parse the extracted JSON
            const parsedData = JSON.parse(jsonMatch[0]);

            // Validate the parsed data
            const { calorieIntake, waterIntake } = parsedData;
            if (
                typeof calorieIntake !== 'object' ||
                typeof calorieIntake.min !== 'number' ||
                typeof calorieIntake.max !== 'number' ||
                typeof waterIntake !== 'object' ||
                typeof waterIntake.min !== 'string' ||
                typeof waterIntake.max !== 'string'
            ) {
                throw new Error('Invalid intake data format');
            }

            return { calorieIntake, waterIntake };
        }
        console.error(`Error: Unable to fetch data from Gemini (Status Code: ${response.status})`);
        return null;
    } catch (error) {
        console.error('Error fetching intake recommendations:', error.message);
        console.error('Full Response:', error);
        return null;
    }
}

app.get('/api/intake/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const intakeRecommendations = await getCalorieAndWaterIntake(userId);
        if (!intakeRecommendations) {
            return res.status(500).json({ message: 'Error generating intake recommendations' });
        }
        res.json(intakeRecommendations);
    } catch (error) {
        console.error('Error fetching intake details:', error.message);
        res.status(500).json({ message: 'Error fetching intake details', error: error.message });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});