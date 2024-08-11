const apiRouter = require("express").Router();
const articlesRouter = require("./articles-router.js");
const usersRouter = require("./users-router.js");
const topicsRouter = require("./topics-router.js");
const commentsRouter = require("./comments-router.js");

const { getEndpoints } = require("../controllers/api.controllers.js");
const { getGalleryImages, getAvatarImages } = require("../controllers/images.controllers.js");
const { getArticlesByAuthor } = require("../controllers/articles.controllers.js");

const { protect } = require("../middleware/auth.middleware.js");

apiRouter.get("/", getEndpoints);
apiRouter.get("/gallery", getGalleryImages);
apiRouter.get("/avatars", getAvatarImages);
apiRouter.get("/my-articles", protect, getArticlesByAuthor);

apiRouter.use("/topics", topicsRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/comments", commentsRouter);

module.exports = apiRouter;
