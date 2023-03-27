const errorHandler = (err, req, res, next) => {
  if (err.status === 404 || err.status === 400) {
    res.status(err.status).send({ msg: err.msg });
  }
};

module.exports = { errorHandler };
