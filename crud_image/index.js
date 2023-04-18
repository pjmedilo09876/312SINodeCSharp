const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const app = express();

// Configure MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'studentdb'
});

// connect to MySQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  const PORT = process.env.PORT || 4050;
  app.listen(PORT, () => {
  console.log('Server started on port ' + PORT);
  });

  console.log('Connected to MySQL');
});

// configure multer file upload settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// configure EJS view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// configure body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from public directory
app.use(express.static(__dirname + '/public'));

// define routes
app.get('/', (req, res) => {
  const sql = 'SELECT * FROM students';
  db.query(sql, (err, results) => {
    if (err) {
      throw err;
    }
    res.render('index', { students: results });
  });
});

app.get('/info', (req, res) => {
  const sql = 'SELECT * FROM students';
  db.query(sql, (err, results) => {
    if (err) {
      throw err;
    }
    // Map the results to a new array with only the necessary fields
    const data = results.map((record) => ({
      id: record.id,
      name: record.name,
      year: record.year,
      course: record.course,
      profile_pic: record.profile_pic // Use the filename instead of the full path
    }));
    res.json(data);
  });
});


// display students
app.get('/add', (req, res) => {
  res.render('add');
});

// add student
app.post('/add', upload.single('profile_pic'), (req, res) => {
  const { name, year, course } = req.body;
  const profile_pic = req.file.filename;

  const sql = 'INSERT INTO students (name, year, course, profile_pic) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, year, course, profile_pic], (err, result) => {
    if (err) {
      throw err;
    }
    res.redirect('/');
  });
});

//update student through id params
app.get('/update/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM students WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      throw err;
    }
    res.render('update', { student: result[0] });
  });
});

//update student through id params
app.post('/update/:id', upload.single('profile_pic'), (req, res) => {
  const { id } = req.params;
  const { name, year, course } = req.body;
  const profile_pic = req.file ? req.file.filename : null;

  let sql = 'UPDATE students SET name = ?, year = ?, course = ?';
  const values = [name, year, course];
  if (profile_pic) {
    sql += ', profile_pic = ?';
    values.push(profile_pic);
  }
  sql += ' WHERE id = ?';
  values.push(id);

  db.query(sql, values, (err=> {
    if (err) {
      throw err;
    }
    res.redirect('/');
  }));
});

// delete student
app.get('/delete/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM students WHERE id = ?';
  db.query(sql, [id], (err, result) => {
  if (err) {
  throw err;
  }
    res.redirect('/');
  });
});
