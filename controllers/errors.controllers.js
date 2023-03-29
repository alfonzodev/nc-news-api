const errorHandler = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
  next(err);
};
const psqlErrorHandler = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Invalid article id!" });
  }
  if (err.code === "23503" && err.constraint === "comments_author_fkey") {
    res.status(400).send({ msg: "Invalid username!" });
  }
  if (err.code === "23503" && err.constraint === "comments_article_id_fkey") {
    res.status(400).send({ msg: "Invalid article id!" });
  }
  next(err);
};

module.exports = { errorHandler, psqlErrorHandler };
