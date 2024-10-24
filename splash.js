const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});


const splash = document.querySelector("#splash-container");

window.addEventListener("load", (event) => {
    console.log("content start loading");
});

window.addEventListener("DOMContentLoaded", () => {
    console.log("content loaded");
    setTimeout(() => {
        splash.classList.add("splash-disappear");
    }, 2000);
});



