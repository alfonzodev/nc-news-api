const db = require("../db/connection.js");

const fetchArticleById = (article_id) => {
  return db
    .query(
      `SELECT
          articles.author,
          articles.body,
          articles.title,
          articles.article_id,
          articles.topic,
          articles.created_at,
          articles.votes,
          articles.img_id,
          gallery.img_url AS img_url,
          COUNT(comments.comment_id) AS comment_count
       FROM articles
       LEFT JOIN comments ON articles.article_id = comments.article_id
       LEFT JOIN gallery ON articles.img_id = gallery.img_id
       WHERE articles.article_id = $1
       GROUP BY articles.article_id, gallery.img_url`,
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

const fetchArticles = (sort_by, order, topic, limit, p) => {
  const validSortQueries = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
    "comment_count",
  ];

  // Base query with JOIN to include img_url
  let selectQueryStr = `
    SELECT
      articles.author,
      articles.title,
      articles.article_id,
      articles.body,
      articles.topic,
      articles.created_at,
      articles.votes,
      articles.img_id,
      gallery.img_url AS img_url,  -- Include img_url
      COUNT(comments.comment_id) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    LEFT JOIN gallery ON articles.img_id = gallery.img_id  -- Join with gallery
  `;
  const selectQueryParams = [];

  let countQueryStr = `SELECT COUNT(*) FROM articles`;
  const countQueryParams = [];

  // Including topic in sql query
  if (topic) {
    selectQueryStr += ` WHERE articles.topic = $1`;
    selectQueryParams.push(topic);
    countQueryStr += ` WHERE topic = $1`;
    countQueryParams.push(topic);
  }

  selectQueryStr += ` GROUP BY articles.article_id, gallery.img_url`;

  // Validating and including sort_by
  if (validSortQueries.includes(sort_by)) {
    selectQueryStr += ` ORDER BY ${sort_by}`;
  } else {
    return Promise.reject({
      status: 400,
      msg: `Error: Invalid query - ${sort_by}.`,
    });
  }

  // validating and including order
  if (order === "asc" || order === "desc") {
    selectQueryStr += ` ${order.toUpperCase()}`;
  } else {
    return Promise.reject({
      status: 400,
      msg: `Error: Invalid query - ${order}.`,
    });
  }

  // validating and including pagination
  if (isNaN(p)) {
    return Promise.reject({
      status: 400,
      msg: `Error: Invalid query - ${p}.`,
    });
  } else if (isNaN(limit)) {
    return Promise.reject({
      status: 400,
      msg: `Error: Invalid query - ${limit}.`,
    });
  }
  selectQueryStr += topic ? ` LIMIT $2 OFFSET $3` : ` LIMIT $1 OFFSET $2`;
  const offset = limit * (p - 1);
  selectQueryParams.push(limit, offset);

  return Promise.all([
    db.query(selectQueryStr, selectQueryParams),
    db.query(countQueryStr, countQueryParams),
  ]);
};

const fetchArticlesByAuthor = (author) => {
  return db.query(
    `SELECT
        articles.article_id,
        articles.author,
        articles.title,
        articles.body,
        articles.topic,
        articles.created_at,
        articles.votes,
        articles.img_id,
        gallery.img_url AS img_url
     FROM articles
     LEFT JOIN gallery ON articles.img_id = gallery.img_id
     WHERE articles.author = $1
     ORDER BY articles.created_at DESC`,
    [author]
  );
};

const updateArticleVotes = (article_id, incrementVotes) => {
  if (!incrementVotes.hasOwnProperty("inc_votes")) {
    return Promise.reject({ status: 400, msg: "Error: missing information." });
  }

  return db
    .query("UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *", [
      incrementVotes.inc_votes,
      article_id,
    ])
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
  if (newArticle.title === "" || newArticle.body === "" || newArticle.topic === "") {
    return Promise.reject({ status: 400, msg: "Error: missing information." });
  }

  let queryStr = "INSERT INTO articles";
  let queryParams = [newArticle.author, newArticle.title, newArticle.body, newArticle.topic];

  if (newArticle.hasOwnProperty("img_id")) {
    queryStr += "(author, title, body, topic, img_id) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    queryParams.push(newArticle.img_id);
  } else {
    queryStr += "(author, title, body, topic) VALUES ($1, $2, $3, $4) RETURNING *";
  }
  return db.query(queryStr, queryParams).then((data) => {
    // Adding comment_count property to response object
    data.rows[0].comment_count = 0;
    return data;
  });
};

const deleteArticle = (articleId) => {
  return db.query("SELECT * FROM articles WHERE article_id = $1", [articleId]).then((data) => {
    if (data.rowCount === 0) {
      return Promise.reject({
        status: 404,
        msg: "Not Found: article_id does not exist.",
      });
    }

    return db.query("DELETE FROM articles WHERE article_id = $1", [articleId]);
  });
};

module.exports = {
  fetchArticleById,
  fetchArticlesByAuthor,
  fetchArticles,
  updateArticleVotes,
  createArticle,
  deleteArticle,
};
