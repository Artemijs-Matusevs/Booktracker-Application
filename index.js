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
    password: "",
    port: 5432,
})
db. connect();

const app = express();
const port = 3000;
const secretKey = ""
const saltRounds = 10;

//Adding static files and middleware set-up
app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: true}));
app.use(session({ secret: secretKey, resave: false, saveUninitialized: true}));



//Colors for Alert messages
const green = "#149886";
const red = "#A45D5D"


// ----- FUNCTIONS -----

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

//Retrieve the id of a specific user
async function checkUserId(username, pin) {
    try{
        const result = await db.query(`
            SELECT id
            FROM users
            WHERE username = $1 AND pin = $2`,
            [username, pin]);

        return result.rows[0].id;
    }catch(error){
        return null;
    }
}
//console.log(await checkUserId("Tom", 12));

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







// ------ END POINTS --------
app.get("/", (req, res) => {
    res.render("index.ejs");
})


//Sign-in
app.post("/sign-in", async (req, res) => {
    const userDetails = {
        username: req.body.username,
        pin: req.body.pin};

    console.log (userDetails);
})

//User dashboard
app.get("/dashboard", async (req, res) => {
    const userId = req.query.userId;
    //console.log(userId);

    const username = await checkUsername(userId);
    const userData = await checkBooks(userId);
    res.render("dashboard.ejs", {username: username});
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
                res.render("index.ejs", {alertMessage: "The pin must be 4 digits or the username already exists, try again.", alertColor: red});
            }
        })
    })
})


app.listen(port, () => {
    console.log(`Server running on port ${port}.`)
});