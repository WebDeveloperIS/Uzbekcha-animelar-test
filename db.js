const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./anime.db');

// Users table
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
)`);

// Animes table
db.run(`CREATE TABLE IF NOT EXISTS animes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    video TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

module.exports = db;
