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

module.exports = { fetchTopics, fetchArticlebyId };
