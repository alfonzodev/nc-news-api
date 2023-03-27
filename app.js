const { getTopics } = require("./controllers/news.controllers.js");
const express = require("express");

const app = express();

app.use(express.json());

app.get("/api/topics", getTopics);

module.exports = app;
