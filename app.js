const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Session
app.use(session({
    secret: 'anime_secret',
    resave: false,
    saveUninitialized: true
}));

// Multer
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.post("/upload", upload.single("video"), (req, res) => {
  res.redirect("/");
});

// Middleware
function checkAuth(req, res, next) { if (req.session.user) next(); else res.redirect('/login'); }
function checkAdmin(req, res, next) { if (req.session.user && req.session.user.role === 'admin') next(); else res.redirect('/login'); }

// Register
app.get('/register', (req, res) => res.render('register', { error: null }));
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    db.run("INSERT INTO users (username,password) VALUES (?,?)", [username, hash], (err) => {
        if (err) res.render('register', { error: 'Username mavjud' });
        else res.redirect('/login');
    });
});

// Login
app.get('/login', (req, res) => res.render('login', { error: null }));
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username=?", [username], (err, user) => {
        if (!user) return res.render('login', { error: 'Username yoki parol xato' });
        if (bcrypt.compareSync(password, user.password)) {
            req.session.user = user;
            res.redirect('/');
        } else res.render('login', { error: 'Username yoki parol xato' });
    });
});

// Logout
app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/login'); });

// Foydalanuvchi sahifa
app.get('/', checkAuth, (req, res) => {
    const search = req.query.search || '';
    db.all("SELECT * FROM animes WHERE title LIKE ? ORDER BY created_at DESC", ['%' + search + '%'], (err, rows) => {
        res.render('index', { animes: rows, user: req.session.user, search });
    });
});

// Admin routes
app.get('/admin', checkAdmin, (req, res) => {
    db.all("SELECT * FROM animes ORDER BY created_at DESC", [], (err, rows) => res.render('admin', { animes: rows }));
});

app.get('/admin/add', checkAdmin, (req, res) => res.render('add_anime'));
app.post('/admin/add', checkAdmin, upload.single('video'), (req, res) => {
    const title = req.body.title;
    const video = req.body.youtube || (req.file ? req.file.filename : '');
    db.run("INSERT INTO animes (title,video) VALUES (?,?)", [title, video], () => res.redirect('/admin'));
});

app.get('/admin/edit/:id', checkAdmin, (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM animes WHERE id=?", [id], (err, row) => res.render('edit_anime', { anime: row }));
});
app.post('/admin/edit/:id', checkAdmin, upload.single('video'), (req, res) => {
    const id = req.params.id;
    const title = req.body.title;
    let sql = "UPDATE animes SET title=?";
    const params = [title];
    if (req.file) { sql += ", video=?"; params.push(req.file.filename); }
    if (req.body.youtube) { sql += ", video=?"; params.push(req.body.youtube); }
    sql += " WHERE id=?"; params.push(id);
    db.run(sql, params, () => res.redirect('/admin'));
});

app.get('/admin/delete/:id', checkAdmin, (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM animes WHERE id=?", [id], () => res.redirect('/admin'));
});
app.get("/", (req, res) => {
    res.render("index"); // yoki res.send("OK")
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
