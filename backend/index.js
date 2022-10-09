const express = require('express');
const Sequelize = require('sequelize');
const app = express();

app.use(express.json());

const POSTGRESS_CONNECTION_STRING =
	'postgres://postgres:postgrespassword@localhost:5432/postgres';

const server = app.listen(8000, () => {
	console.log('server listening on port 8000');
});

app.post('/blog-post-event', async (req, res) => {
	let type;

	if (req.body.event.op === 'INSERT') {
		type = 'created';
	} else if (req.body.event.op === 'UPDATE') {
		if (
			req.body.event.data.old.is_published === true &&
			req.body.event.data.new.is_published === false
		) {
			type = 'unpublished';
		} else if (
			req.body.event.data.old.is_published == false &&
			req.body.event.data.new.is_published === true
		) {
			type = 'published';
		}
	}

	if (type) {
		const sequelize = new Sequelize(POSTGRESS_CONNECTION_STRING, {});
		const blogPostId = req.body.event.data.new.id;

		await sequelize.query(
			'INSERT INTO blog_post_activity(blog_post_id, type) values (:blogPostId, :type);',
			{
				replacements: {
					blogPostId: blogPostId,
					type: type,
				},
			}
		);
	}
});

// archiving posts action
app.post('/archive_post', async (req, res) => {
	console.log(req.body);

	const sequelize = new Sequelize(POSTGRESS_CONNECTION_STRING, {});
	const { age_in_second } = req.body.input;

	const [result, metadata] = await sequelize.query(
		"UPDATE blog_post SET is_published = false WHERE date < now() - interval ':age_in_second' second;",
		{ replacements: { age_in_second: age_in_second } }
	);

	res.status(200).json({ rows_affected: metadata.rowCount });
});
