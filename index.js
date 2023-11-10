import express from "express";

const app = express();
const port = 3000;

//Adding static files and middleware
app.use(express.static("public"));



// ------ END POINTS --------
app.get("/", (req, res) => {
    res.render("index.ejs");
})


app.listen(port, () => {
    console.log(`Server running on port ${port}.`)
});