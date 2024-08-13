
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost/datingapp', { useNewUrlParser: true, useUnifiedTopology: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

const Profile = mongoose.model('Profile', {
  name: String,
  age: Number,
  interests: [String],
  bio: String,
  image: String
});

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
  Profile.find({}).then(profiles => res.render('home', { title: 'Dating App', profiles: profiles.map(profile => profile.toJSON())}));
});

app.get('/profile/new', (req, res) => {
  res.render('new-profile', { title: 'Create New Profile' });
});

app.post('/profile/new', upload.single('image'), async (req, res) => {
  const { name, age, interests, bio } = req.body;
  const image = req.file ? '/uploads/' + req.file.filename : null;
  const profile = new Profile({ name, age, interests: interests.split(','), bio, image });
  await profile.save();
  res.redirect('/');
});

app.get('/search', async (req, res) => {
  const interest = req.query.interest || '';
  const profiles = await Profile.find({ interests: interest });
  
  res.render('search-results', { title: 'Search Results', profiles:  profiles.map(profile => profile.toJSON()), interest });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});