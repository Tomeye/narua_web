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
