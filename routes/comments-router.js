const commentsRouter = require('express').Router();

const {deleteComment, patchCommentVotes} = require('../controllers/comments.controllers.js')

const {protect} = require('../middleware/auth.middleware.js');

commentsRouter.delete("/:comment_id", protect, deleteComment);
commentsRouter.patch("/:comment_id", protect, patchCommentVotes)
module.exports = commentsRouter;