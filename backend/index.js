const express = require('express');
const Sequalize = require('sequelize');
const app = express();

app.use(express.json());

const POSTGRESS_CONNECTION_STRING =
	'postgres://postgres:postgrespassword@localhost:5432/postgres';

const server = app.listen(8000, () => {
	console.log('server listening on port 8000');
});

app.post('/blog-post-event', async (req, res) => {
	console.log(req.body);

	const sequalize = new Sequalize(POSTGRESS_CONNECTION_STRING, {});
	const blogPostId = req.body.event.data.new.id;

	await sequalize.query(
		'INSERT INTO blog_post_activity(blog_post_id, type) values (:blogPostId, :type);',
		{
			replacements: {
				blogPostId: blogPostId,
				type: 'created',
			},
		}
	);

	res.status(200).json({ message: 'event registered!' });
});
