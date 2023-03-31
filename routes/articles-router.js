const articlesRouter = require("express").Router();

const {getArticles, getArticleById,  patchArticleVotes} = require('../controllers/articles.controllers.js')
const {getCommentsByArticleId, postComment} = require('../controllers/comments.controllers.js')

articlesRouter.get("/", getArticles);
articlesRouter.route("/:article_id").get(getArticleById).patch(patchArticleVotes);
articlesRouter.route("/:article_id/comments").get(getCommentsByArticleId).post(postComment);

module.exports = articlesRouter;
