const express = require("express");
const app = express();
const cors = require("cors");

const {
  errorHandlerCustom,
  psqlErrorHandler,
  errorHandler500Status,
} = require("./middleware/errors.middleware.js");

const apiRouter = require("./routes/api-router.js");

app.use(
  cors({
    origin: ["https://nc-top-news.netlify.app", "http://localhost:3000"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());

app.use("/api", apiRouter);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Not Found." });
});

app.use(errorHandlerCustom);
app.use(psqlErrorHandler);
app.use(errorHandler500Status);

module.exports = app;
