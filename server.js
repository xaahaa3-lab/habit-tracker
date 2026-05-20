// =============================================
//  HABIT TRACKER - BACKEND (server.js)
//  This is the server. It saves and loads data.
//  Run with:  node server.js
// =============================================

const express = require("express");
const fs      = require("fs");
const cors    = require("cors");

const app  = express();
const PORT = 3000;
const DB   = "./habits.json"; // Our simple "database" file

// --- SETUP ---
app.use(cors());          // Allow the frontend to talk to this server
app.use(express.json());  // Let the server read JSON from requests


// --- HELPER FUNCTIONS ---

// Read all habits from the file
function readHabits() {
  if (!fs.existsSync(DB)) return []; // If file doesn't exist, return empty list
  return JSON.parse(fs.readFileSync(DB, "utf8"));
}

// Save all habits to the file
function saveHabits(habits) {
  fs.writeFileSync(DB, JSON.stringify(habits, null, 2));
}


// --- ROUTES (API Endpoints) ---

// GET /habits → Return all habits
app.get("/habits", (req, res) => {
  const habits = readHabits();
  res.json(habits);
});

// POST /habits → Add a new habit
app.post("/habits", (req, res) => {
  const habits = readHabits();

  const newHabit = {
    id:        Date.now(),        // Unique ID using timestamp
    name:      req.body.name,     // Name from the request
    createdAt: new Date().toISOString(),
    history:   {}                 // Empty history to start
  };

  habits.push(newHabit);
  saveHabits(habits);

  res.json(newHabit); // Send the new habit back
});

// PATCH /habits/:id/check → Mark a habit as done today (or undo it)
app.patch("/habits/:id/check", (req, res) => {
  const habits = readHabits();
  const habit  = habits.find(h => h.id === Number(req.params.id));

  if (!habit) {
    return res.status(404).json({ error: "Habit not found" });
  }

  const today = new Date().toISOString().slice(0, 10); // e.g. "2026-05-19"
  habit.history[today] = !habit.history[today];        // Toggle true/false

  saveHabits(habits);
  res.json(habit);
});

// DELETE /habits/:id → Remove a habit
app.delete("/habits/:id", (req, res) => {
  let habits = readHabits();
  habits = habits.filter(h => h.id !== Number(req.params.id));
  saveHabits(habits);
  res.json({ message: "Deleted" });
});


// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
