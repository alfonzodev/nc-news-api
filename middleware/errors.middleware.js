const errorHandlerCustom = (err, req, res, next) => {
  if (err.status && err.msg) {
    return res.status(err.status).send({ msg: err.msg });
  }
  next(err);
};
const psqlErrorHandler = (err, req, res, next) => {
  if (err.code === "22P02") {
    return res.status(400).send({ msg: "Error: invalid data format." });
  }
  if (err.code === "23503") {
    if (err.constraint === "comments_author_fkey") return res.status(404).send({ msg: "Not Found: username does not exist." });
    if (err.constraint === "comments_article_id_fkey") return res.status(404).send({ msg: "Not Found: article_id does not exist." });
    if (err.constraint === "articles_author_fkey") return res.status(404).send({ msg: "Not Found: author does not exist." });
    if (err.constraint === "articles_topic_fkey") return res.status(404).send({ msg: "Not Found: topic does not exist." });
  }

  if(err.code === "23502"){
    return res.status(400).send({msg: "Error: missing information."})
  }
  if(err.code === "23505"){
    return res.status(409).send({msg: `Error: ${err.detail}`})
  }
  next(err);
};

const errorHandler500Status = (err, req, res, next) => {
  console.log(err);
  return res.status(500).send({ msg: err });
};

module.exports = {
  errorHandlerCustom,
  psqlErrorHandler,
  errorHandler500Status,
};
