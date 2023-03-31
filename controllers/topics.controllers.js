const { fetchTopics } = require("../models/topics.models.js");

const getTopics = (req, res, next) => {
  fetchTopics()
    .then((data) => {
      const topics = data.rows;
      res.status(200).send({ topics });
    })
    .catch((err) => next(err));
};

module.exports = { getTopics };
