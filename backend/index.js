const express = require('express');
const sequalize = require('sequelize');
const app = express();

app.use(express.json());

const server = app.listen(8000, () => {
	console.log('server listening on port 8000');
});

app.post('/blog-post-event', (req, res) => {
	console.log(req.body);
});
