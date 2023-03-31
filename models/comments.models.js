const db = require("../db/connection.js");

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

const deleteCommentById = (comment_id) => {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1", [comment_id])
    .then((data) => {
      if (data.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "Not Found: comment_id does not exist.",
        });
      }
      return data;
    });
};

const updateCommentVotes = (incrementVotes, comment_id) => {
  if (!incrementVotes.hasOwnProperty("inc_votes")) {
    return Promise.reject({ status: 400, msg: "Error: missing information." });
  }
  return db
    .query(
      "UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *",
      [incrementVotes.inc_votes, comment_id]
    )
    .then((data) => {
      if (data.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "Not Found: comment_id does not exist.",
        });
      }
      return data;
    });
};

module.exports = {
  fetchCommentsByArticle,
  insertComment,
  deleteCommentById,
  updateCommentVotes,
};
