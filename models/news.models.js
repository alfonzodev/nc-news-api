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
          msg: "Not Found - Article does not exist!",
        });
      } else {
        return data;
      }
    });
};

const fetchArticles = () => {
  return db.query(`
    SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.comment_id) AS comment_count 
    FROM articles 
    LEFT JOIN comments ON articles.article_id = comments.article_id 
    GROUP BY articles.article_id 
    ORDER BY created_at DESC
  `);
};

module.exports = { fetchTopics, fetchArticlebyId, fetchArticles };
