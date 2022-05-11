const mongoose = require("mongoose");
const Question = require("./models/question");
const { MONGODB_URI: url } = require("./utils/config");
const { setRedisJsonValue } = require("./utils/redisUtils");
const { Sequelize } = require("sequelize");
const { getUserModel } = require("./models/UserSql");

const connectToDBAndStartServer = async (app, PORT) => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });

    console.log("Connected to MongoDB!");
    const questions = await Question.find({ pendingApproval: false })
      .populate("author", "username")
      .sort({ hotAlgo: -1 })
      .lean();
    const questionsKeyValueObject = {};
    questions.forEach((question) => {
      questionsKeyValueObject[question._id] = question;
    });
    // Populate Cache with updated list
    await setRedisJsonValue("ALL_QUESTIONS", ".", questionsKeyValueObject);
    const sequelize = new Sequelize(
      process.env.DATABASE_NAME,
      process.env.DATABASE_USERNAME,
      process.env.DATABASE_PASSWORD,
      {
        host: process.env.DATABASE_HOST,
        dialect: "mysql",
        /* Using port 3307 to aviod port conflict with other database instances on your machine */
        port: 3307,
      }
    );
    getUserModel(sequelize, Sequelize);
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}   `);
    });
  } catch (error) {
    console.error(`Error while connecting to MongoDB: `, error.message);
  }
};

module.exports = connectToDBAndStartServer;
