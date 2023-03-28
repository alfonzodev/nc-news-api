const db = require("../db/connection.js");

const fetchTopics = () => {
  return db.query("SELECT * FROM topics");
};

const fetchArticlebyId = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then((data) => {
      if (!data.rows.length) {
        return Promise.reject({
          status: 404,
          msg: "Not Found: Article does not exist!",
        });
      } else {
        return data;
      }
    });
};

const fetchArticles = (article_id) => {
  return db.query(`
    SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.comment_id) AS comment_count 
    FROM articles 
    LEFT JOIN comments ON articles.article_id = comments.article_id 
    GROUP BY articles.article_id 
    ORDER BY created_at DESC
  `);
};

const fetchCommentsByArticle = (article_id) => {
  return db.query(
    "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC",
    [article_id]
  );
};

const insertComment = (article_id, comment) => {
  return db.query(
    "INSERT INTO comments(body, article_id, author) VALUES ($1, $2, $3) RETURNING *",
    [comment.body, article_id, comment.username]
  );
};

module.exports = {
  fetchTopics,
  fetchArticlebyId,
  fetchArticles,
  fetchCommentsByArticle,
  insertComment,
};
