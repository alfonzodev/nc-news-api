const articlesRouter = require("express").Router();

const {getArticles, postArticle, getArticleById,  patchArticleVotes} = require('../controllers/articles.controllers.js')
const {getCommentsByArticleId, postComment} = require('../controllers/comments.controllers.js')

const {protect} = require('../middleware/auth.middleware.js');


articlesRouter.route("/").get(getArticles).post(protect, postArticle);
articlesRouter.route("/:article_id").get(getArticleById).patch(protect, patchArticleVotes);
articlesRouter.route("/:article_id/comments").get(getCommentsByArticleId).post(protect, postComment);

module.exports = articlesRouter;
