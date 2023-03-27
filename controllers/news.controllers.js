const { fetchTopics } = require("../models/news.models.js");

const getTopics = (req, res, next) => {
  fetchTopics().then((data) => {
    const topics = data.rows;
    res.status(200).send({ topics });
  });
};

module.exports = { getTopics };
