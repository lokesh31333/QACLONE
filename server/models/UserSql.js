const { DataTypes } = require("sequelize");

const getUserModel = (sequelize, Sequelize) => {
  const user = sequelize.define(
    "user",
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      user_password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

  return user;
};

module.exports = {
  getUserModel,
};
