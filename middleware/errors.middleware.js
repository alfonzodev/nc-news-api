const errorHandlerCustom = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
  next(err);
};
const psqlErrorHandler = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Error: invalid data format." });
  }
  if (err.code === "23503" && err.constraint === "comments_author_fkey") {
    res.status(404).send({ msg: "Not Found: username does not exist." });
  }
  if (err.code === "23503" && err.constraint === "comments_article_id_fkey") {
    res.status(404).send({ msg: "Not Found: article_id does not exist." });
  }
  next(err);
};

const errorHandler500Status = (err, req, res, next) => {
  res.status(500).send({ msg: err });
};

module.exports = {
  errorHandlerCustom,
  psqlErrorHandler,
  errorHandler500Status,
};
