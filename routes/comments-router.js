const commentsRouter = require('express').Router();

const {deleteComment, patchCommentVotes} = require('../controllers/comments.controllers.js')

commentsRouter.delete("/:comment_id", deleteComment);
commentsRouter.patch("/:comment_id", patchCommentVotes)
module.exports = commentsRouter;