import express from "express";

const app = express();
const port = 3000;

//Adding static files and middleware
app.use(express.static("public"));

//Colors for Alert messages
const green = "#149886";
const red = "#A45D5D"


// ----- FUNCTIONS -----


// ------ END POINTS --------
app.get("/", (req, res) => {
    res.render("index.ejs");
})

app.post("/register", (req, res) => {
    res.render("index.ejs", {alertMessage: "Account has been created", alertColor: green})
})


app.listen(port, () => {
    console.log(`Server running on port ${port}.`)
});