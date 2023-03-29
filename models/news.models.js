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
          msg: "Not found: article_id does not exist!",
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
  if (!comment.hasOwnProperty("username") || !comment.hasOwnProperty("body")) {
    return Promise.reject({ status: 400, msg: "Error: missing information." });
  } else if (comment.body === "") {
    return Promise.reject({ status: 400, msg: "Error: empty comment." });
  }
  return db.query(
    "INSERT INTO comments(body, article_id, author) VALUES ($1, $2, $3) RETURNING *",
    [comment.body, article_id, comment.username]
  );
};

const updateArticleVoteCount = (article_id, incrementVote) => {
  if (!incrementVote.hasOwnProperty("inc_votes")) {
    return Promise.reject({ status: 400, msg: "Error: missing information." });
  }

  return db.query(
      "UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *",
      [incrementVote.inc_votes, article_id]
    )
    .then((data) => {
      if (!data.rows.length) {
        return Promise.reject({
          status: 404,
          msg: "Not found: article_id does not exist!",
        });
      } else {
        return data;
      }
    });
};

module.exports = {
  fetchTopics,
  fetchArticlebyId,
  fetchArticles,
  fetchCommentsByArticle,
  insertComment,
  updateArticleVoteCount,
};
