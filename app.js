const express = require('express');
const app = express();

app.use(express.static('../narua_web'));

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
