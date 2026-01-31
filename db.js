const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const db = new sqlite3.Database('./anime.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user'
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS animes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        video TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    const hash = bcrypt.hashSync('1234', 10);
    db.get("SELECT * FROM users WHERE username='admin'", (err,row)=>{
        if(!row){
            db.run("INSERT INTO users (username,password,role) VALUES ('admin',?, 'admin')",[hash]);
        }
    });
});

module.exports = db;
