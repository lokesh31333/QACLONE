const Sequelize = require("sequelize");
const { getUserModel } = require("./UserSql");

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
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.users = getUserModel(sequelize, Sequelize);

module.exports = {
  db,
};
