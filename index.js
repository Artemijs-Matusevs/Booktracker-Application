import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import session from "express-session";
import bcrypt from "bcrypt";

//Config to connect to booktracker data base
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "booktracker",
    password: "10151015",
    port: 5432,
})
db. connect();

const app = express();
const port = 3000;
const secretKey = "asda13ddSDsdSDNlkdsJDSNlsdnSJLFNlksj"
const saltRounds = 10;

//Adding static files and middleware set-up
app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: true}));
app.use(session({ secret: secretKey, resave: false, saveUninitialized: true}));

//Middleware to check authentication
function checkAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/');
}


//Colors for Alert messages
const green = "#149886";
const red = "#A45D5D"


// ----- FUNCTIONS -----
//Delete book by book ID
async function deleteBook(bookId) {
    try{
        const result = await db.query(`
            DELETE FROM saved_books
            WHERE id=$1`,
            [bookId]);
    }catch (error){
        console.log(error);
    }
}

//Get all books for a specific user by userId
async function checkBooks(userId) {
    const result = await db.query(`
        SELECT *
        FROM saved_books
        WHERE user_id = $1`,
        [userId]);

    return result.rows;
}
//console.log(await checkBooks(1));

//Get book by book id
async function getBook(bookId) {
    const result = await db.query(`
        SELECT *
        FROM saved_books
        WHERE id = $1`,
        [bookId]);

    return result.rows[0];
}

//Retrieve username by user id
async function checkUsername(userId) {
    try{
        const result = await db.query(`
            SELECT username
            FROM users
            WHERE id = $1`,
            [userId]);

        return result.rows[0].username;
    }catch(error){
        return null;
    }
}

//Retrieve user password
async function checkPass(username) {
    try{
        const result = await db.query(`
            SELECT username, pin, id
            FROM users
            WHERE username = $1`,
            [username]);
        return result.rows[0];
    }catch (error){
        return null;
    }
}

//Insert new book
async function newBook(userId, bookTitle, bookNotes) {
    try{
        const result = await db.query(`
            INSERT INTO saved_books (book_notes, book_title, user_id)
            VALUES ($1, $2, $3)`,
            [bookNotes, bookTitle, userId]);
    }catch (error){
        console.log(error);
    }
}

//Check time of day
function checkTime() {
    const date = new Date();
    const time = date.getHours();

    if(time >= 5 && time < 12){
        return "Good Morning, "
    }
    else if(time >= 12 && time < 17){
        return "Good Afternoon, " 
    }
    else if(time >= 17 && time < 21){
        return "Good Evening, "
    }
    else if(time >= 21){
        return "Good Night, "
    }
}
//console.log(checkTime());





// ------ END POINTS --------
app.get("/", (req, res) => {
    if(req.session.userId){
        res.redirect("/dashboard");
    }
    else{
        res.render("index.ejs");
    }
})

//New book
app.post("/new-book", checkAuthenticated, async (req, res) => {
    //console.log(req.body);
    const title = req.body.book_title;
    const notes = req.body.book_notes;

    await newBook(req.session.userId, title, notes)
    res.redirect("/dashboard");

})


//View book
app.post("/open-book", checkAuthenticated, async (req, res) => {
    //console.log(req.body);
    const bookId = req.body.book_id;
    const bookData = await getBook(bookId);

    //console.log(bookData);

    res.render("opened-book.ejs", {book: bookData});
})

//Delete book
app.post("/delete-book", checkAuthenticated, async (req, res) => {
    const bookId = req.body.book_id;

    await deleteBook(bookId);
    res.redirect("/dashboard");
})


//Sign-in
app.post("/sign-in", async (req, res) => {
    const userDetails = {
        username: req.body.username,
        pin: req.body.pin};

    const savedUserDetails = await checkPass(userDetails.username);
    //console.log(savedUserDetails);

    //Compare submitted password against the one stored in database
    if (savedUserDetails && await bcrypt.compare(userDetails.pin, savedUserDetails.pin)){
        console.log("Correct");
        req.session.userId = savedUserDetails.id;
        res.redirect("/dashboard");

    }
    else{
        console.log("Failed");
        res.render("index.ejs", {alertMessage: "Incorrect user details, try again.", alertColor: red});

    }
})

//Sign-out
app.get("/sign-out", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).send('Could not sign-out, please try again');
        }
        else {
            res.clearCookie('connect.sid');
            res.redirect('/');
        }
    })
})

//Create new book
app.get("/new-book", checkAuthenticated, (req, res) => {
    res.render("new-book.ejs");
})



//User dashboard
app.get("/dashboard", checkAuthenticated,  async (req, res) => {
    const userId = req.session.userId;
    const username = await checkUsername(userId);
    const books = await checkBooks(userId);
    //console.log(userId);

    res.render("dashboard.ejs", {username: checkTime() + username, books: books});
})


//Register new accounts
app.post("/register", async (req, res) => {
    //Get username and pin from form
    const username = req.body.username;
    const pin = req.body.pin;
    //console.log(username, pin);

    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(pin, salt, async function(err, hash) {
            //console.log(hash);
            try {
                await db.query(`
                    INSERT INTO users (username, pin)
                    VALUES ($1, $2)`,
                    [username, hash])
                    res.render("index.ejs", {alertMessage: "Account has been created", alertColor: green});
            } catch(error) {
                console.log(error);
                res.render("index.ejs", {alertMessage: "Username already exists, try again.", alertColor: red});
            }
        })
    })
})


app.listen(port, () => {
    console.log(`Server running on port ${port}.`)
});