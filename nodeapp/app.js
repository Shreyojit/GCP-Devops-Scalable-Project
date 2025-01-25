const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Server is up and running");
});

app.listen(8000, () => {
    console.log("Server is up on port 8000");
});
