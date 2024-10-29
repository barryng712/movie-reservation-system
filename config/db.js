require("dotenv").config();
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.DATABASE_URL,
  {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      maxPreparedStatements: 100,
    },
  }
);

module.exports = sequelize;