const express = require("express");
const cors = require("cors");
const { PORT } = require("./utils/config");
const { registerRouter } = require("./routes/registerRoutes");
const { loginRouter } = require("./routes/loginRoutes");
const { authChecker } = require("./utils/authChecker");
const { questionRouter } = require("./routes/questionRoutes");
const { userRouter } = require("./routes/userRoutes");
const { questionCommentRouter } = require("./routes/questionCommentRoutes");
const { answerRouter } = require("./routes/answerRoutes");
const { answerCommentRouter } = require("./routes/answerCommentRoutes");
const { tagsRouter } = require("./routes/tagsRoutes");
const { initializeRedisClient } = require("./utils/redisUtils");
const connectToDBAndStartServer = require("./db");

const app = express();
initializeRedisClient();
const API_PREFIX = "/api/v1";
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(`${API_PREFIX}/register`, registerRouter);
app.use(`${API_PREFIX}/login`, loginRouter);
app.use(`${API_PREFIX}/questions`, questionRouter);
app.use(`${API_PREFIX}/answers`, authChecker, answerRouter);
app.use(`${API_PREFIX}/users`, userRouter);
app.use(`${API_PREFIX}/question-comments`, authChecker, questionCommentRouter);
app.use(`${API_PREFIX}/answer-comments`, authChecker, answerCommentRouter);
app.use(`${API_PREFIX}/tags`, tagsRouter);

connectToDBAndStartServer(app, PORT);
