const format = require("pg-format");
const db = require("../connection");
const { convertTimestampToDate, createRef, formatComments } = require("./utils");

const seed = ({ galleryData, avatarsData, topicData, userData, articleData, commentData }) => {
  return db
    .query(`DROP TABLE IF EXISTS comments;`)
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS articles;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS users;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS topics;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS gallery;`);
    })
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS avatars;`);
    })
    .then(() => {
      const galleryTablePromise = db.query(`CREATE TABLE gallery(
        img_id SERIAL PRIMARY KEY,
        img_url VARCHAR
        );`);
      const avatarsTablePromise = db.query(`CREATE TABLE avatars(
          avatar_id SERIAL PRIMARY KEY,
          avatar_img_url VARCHAR
          );`);
      return Promise.all([galleryTablePromise, avatarsTablePromise]);
    })
    .then(() => {
      const topicsTablePromise = db.query(`
      CREATE TABLE topics (
        slug VARCHAR PRIMARY KEY,
        description VARCHAR
      );`);

      const usersTablePromise = db.query(`
      CREATE TABLE users (
        username VARCHAR PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(75) NOT NULL,
        name VARCHAR NOT NULL,
        avatar_id INT REFERENCES avatars(avatar_id) DEFAULT 1 
      );`);

      return Promise.all([topicsTablePromise, usersTablePromise]);
    })
    .then(() => {
      return db.query(`
      CREATE TABLE articles (
        article_id SERIAL PRIMARY KEY,
        title VARCHAR NOT NULL,
        topic VARCHAR NOT NULL REFERENCES topics(slug),
        author VARCHAR NOT NULL REFERENCES users(username),
        body VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        votes INT DEFAULT 0 NOT NULL,
        img_id INT REFERENCES gallery(img_id) DEFAULT 1
      );`);
    })
    .then(() => {
      return db.query(`
      CREATE TABLE comments (
        comment_id SERIAL PRIMARY KEY,
        body VARCHAR NOT NULL,
        article_id INT REFERENCES articles(article_id) ON DELETE CASCADE,
        author VARCHAR REFERENCES users(username) NOT NULL,
        votes INT DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );`);
    })
    .then(() => {
      const insertGalleryQueryStr = format(
        "INSERT INTO gallery (img_url) VALUES %L;",
        galleryData.map((url) => [url])
      );
      const galleryPromise = db.query(insertGalleryQueryStr);
      const insertAvatarsQueryStr = format(
        "INSERT INTO avatars (avatar_img_url) VALUES %L;",
        avatarsData.map((url) => [url])
      );
      const avatarsPromise = db.query(insertAvatarsQueryStr);
      return Promise.all([galleryPromise, avatarsPromise]);
    })
    .then(() => {
      const insertTopicsQueryStr = format(
        "INSERT INTO topics (slug, description) VALUES %L;",
        topicData.map(({ slug, description }) => [slug, description])
      );
      const topicsPromise = db.query(insertTopicsQueryStr);

      const insertUsersQueryStr = format(
        "INSERT INTO users ( username, name, email, password, avatar_id) VALUES %L;",
        userData.map(({ username, name, email, password, avatar_id }) => [
          username,
          name,
          email,
          password,
          avatar_id,
        ])
      );
      const usersPromise = db.query(insertUsersQueryStr);

      return Promise.all([topicsPromise, usersPromise]);
    })
    .then(() => {
      const formattedArticleData = articleData.map(convertTimestampToDate);
      const insertArticlesQueryStr = format(
        "INSERT INTO articles (title, topic, author, body, created_at, votes, img_id) VALUES %L RETURNING *;",
        formattedArticleData.map(
          ({ title, topic, author, body, created_at, votes = 0, img_id }) => [
            title,
            topic,
            author,
            body,
            created_at,
            votes,
            img_id,
          ]
        )
      );

      return db.query(insertArticlesQueryStr);
    })
    .then(({ rows: articleRows }) => {
      const articleIdLookup = createRef(articleRows, "title", "article_id");
      const formattedCommentData = formatComments(commentData, articleIdLookup);

      const insertCommentsQueryStr = format(
        "INSERT INTO comments (body, author, article_id, votes, created_at) VALUES %L;",
        formattedCommentData.map(({ body, author, article_id, votes = 0, created_at }) => [
          body,
          author,
          article_id,
          votes,
          created_at,
        ])
      );
      return db.query(insertCommentsQueryStr);
    });
};

module.exports = seed;
