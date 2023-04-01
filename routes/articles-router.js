const articlesRouter = require("express").Router();

const {getArticles, postArticle, getArticleById,  patchArticleVotes} = require('../controllers/articles.controllers.js')
const {getCommentsByArticleId, postComment} = require('../controllers/comments.controllers.js')

articlesRouter.route("/").get(getArticles).post(postArticle);
articlesRouter.route("/:article_id").get(getArticleById).patch(patchArticleVotes);
articlesRouter.route("/:article_id/comments").get(getCommentsByArticleId).post(postComment);

module.exports = articlesRouter;
