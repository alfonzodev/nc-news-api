const db = require("../db/connection.js");

const fetchArticlebyId = (article_id) => {
  return db
    .query(
      `SELECT articles.author, articles.body, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.comment_id) AS comment_count 
        FROM articles 
        LEFT JOIN comments ON articles.article_id = comments.article_id 
        WHERE articles.article_id = $1 GROUP BY articles.article_id `,
      [article_id]
    )
    .then((data) => {
      if (data.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "Not Found: article_id does not exist.",
        });
      } else {
        return data;
      }
    });
};

const fetchArticles = (sort_by, order, topic) => {
  const validSortQueries = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
    "comment_count",
  ];
  let queryStr = `
    SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.comment_id) AS comment_count 
    FROM articles 
    LEFT JOIN comments ON articles.article_id = comments.article_id 
  `;

  const queryParams = [];

  // Including topic in sql query
  if (topic) {
    queryStr += ` WHERE topic = $1`;
    queryParams.push(topic);
  }

  queryStr += " GROUP BY articles.article_id";

  // Validating and including sort_by
  if (validSortQueries.includes(sort_by)) {
    queryStr += ` ORDER BY ${sort_by}`;
  } else {
    return Promise.reject({
      status: 400,
      msg: `Error: Invalid query - ${sort_by}.`,
    });
  }

  // validating and including order
  if (order === "asc" || order === "desc") {
    queryStr += ` ${order.toUpperCase()}`;
  } else {
    return Promise.reject({
      status: 400,
      msg: `Error: Invalid query - ${order}.`,
    });
  }

  return db.query(queryStr, queryParams);
};

const updateArticleVotes = (article_id, incrementVotes) => {
  if (!incrementVotes.hasOwnProperty("inc_votes")) {
    return Promise.reject({ status: 400, msg: "Error: missing information." });
  }

  return db
    .query(
      "UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *",
      [incrementVotes.inc_votes, article_id]
    )
    .then((data) => {
      if (data.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "Not Found: article_id does not exist.",
        });
      } else {
        return data;
      }
    });
};

const createArticle = (newArticle) => {
  if(newArticle.title === "" || newArticle.body === ""){
    return Promise.reject({status: 400, msg: "Error: missing information."})
  } 

  let queryStr = 'INSERT INTO articles';
  let queryParams = [newArticle.author, newArticle.title, newArticle.body, newArticle.topic];

  if(newArticle.hasOwnProperty('article_img_url')) {
    queryStr += '(author, title, body, topic, article_img_url) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    queryParams.push(newArticle.article_img_url);
  }else{
    queryStr += '(author, title, body, topic) VALUES ($1, $2, $3, $4) RETURNING *';
  } 
  return db.query(queryStr, queryParams).then((data) => {
    // Adding comment_count property to response object
    data.rows[0].comment_count = 0;
    return data;
  });
};

module.exports = { fetchArticlebyId, fetchArticles, updateArticleVotes, createArticle };
