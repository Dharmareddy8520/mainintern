const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const ejs=require("ejs");
app.set("view engine","ejs");
app.use(express.static("public"));

const bcrypt = require('bcryptjs');

app.use(bodyParser.urlencoded({ extended: true }));
// Connect to MongoDB database
//borigok686@wwgoc.com
mongoose.connect('mongodb+srv://bunny:bunny087@cluster0.x3wmz1p.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB database');
});



// Define user schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));


app.get("/",function(req,res){
    res.render('index')
})
// Render the login page
app.get('/login', (req, res) => {
    res.render('login', { message: '' });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user with the same email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    // Create new user object
    const newUser = new User({ name, email, password });

    // Hash password before saving to database
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    // Save user to database
    await newUser.save();
    console.log('saved')
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


// Handle login form submission
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    // find user by email
    const user = await User.findOne({ email });
  
    // if user is not found
    if (!user) {
      return res.render('login', { errorMessage: 'Invalid email or password' });
    }
  
    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
  
    // if password does not match
    if (!isMatch) {
      return res.render('login', { errorMessage: 'Invalid email or password' });
    }
  
    // set user session
    req.session.userId = user._id;
  
    // redirect to blog post page
    res.redirect('/home');
  });


  
  

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "write a blog and i will publish in my website in the front page";
const contactContent = "I am a Full Stack Web Developer with a Bachelor's degree in Computer Science Engineering from NMREC College of Engineering, J.N.T.U. Hyderabad. I have a strong command of programming languages such as C, C++, Python, and Java, and I am proficient in working with databases such as MySQL and Mongo dB. I am also skilled in Full Stack Web Development and have worked on several projects utilizing technologies such as Nodejs, HTML, CSS, JavaScript, and BootStrap. In addition to my technical expertise, I possess excellent problem-solving, time management, critical thinking, and adaptability skills. I am an excellent communicator and possess strong analytical and technical abilities. I am a quick learner and a team player, and I have experience participating in extra and co-curricular activities such as NCC and football. I have completed several courses and received awards, including a Coursera Python course, an advanced Python course from Udemy, and an SIH award. I believe that I can leverage my skills and experience to secure a challenging and rewarding position in a dynamic organization where I can contribute to the growth and success of the company."



  const postSchema = {
    title: String,
    content: String
  };
  //mongoose model
  const Post = mongoose.model("Post", postSchema);
  
  //the home route
  app.get("/home", async (req, res) => {
    try {
      const posts = await Post.find({});
      res.render("home", {
        startingContent: homeStartingContent,
        posts: posts
      });
    } catch (err) {
      console.log(err);
      res.render("error/500");
    }
  });
  

// fetching "/compose" page
app.get("/compose", function(req, res){
  res.render("compose");
});

//posting title and content in /compose page
app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  // composed blog gets saved and the user is redirected to "/" route
  post.save()
    .then(() => {
      res.redirect("/home");
    })
    .catch((err) => {
      console.error(err);
    });
});


//clicking on readmore on the home screen bring up the post with the id on the url
app.get('/home', async (req, res) => {
  try {
    const posts = await Post.find({});
    res.render('home', { startingContent: homeStartingContent, posts });
  } catch (error) {
    console.error(error);
    res.render('error/500');
  }
});

app.get('/posts/:postId', async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findOne({ _id: postId });
    if (!post) {
      return res.render('error/404');
    }
    res.render('post', { title: post.title, content: post.content });
  } catch (error) {
    console.error(error);
    res.render('error/500');
  }
});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

  
  // Define a route for logging out
  app.get('/logout', function(req, res) {
    // Destroy the session and redirect to the login page
    req.session.destroy();
    res.redirect('/login');
  });
  

  //profiles
  app.get('/profiles/:userId', async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      res.render('profile', { user });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });
  

  
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
