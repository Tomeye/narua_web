const splash = document.querySelector('#splashContainer');

window.addEventListener("load", (event) => {
    console.log('content start loading');
});

window.addEventListener("DOMContentLoaded", () => {
    console.log('content loaded');
    setTimeout(() => {
        splash.classList.add('display-none');
    }, 2000);
});