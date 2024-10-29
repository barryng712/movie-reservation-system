const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');
const Auth = require('../utils/auth');
class User extends Model {}

User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notEmpty: true,
            len: [6,100]
        }
    },
    role: {
        type: DataTypes.ENUM('admin', 'user'),
        allowNull: false,
    },
}, { sequelize, 
    modelName: 'user',
    hooks: {
        beforeCreate: async (user) => {
            user.password = await Auth.hashPassword(user.password);
        }
    }
});

module.exports = User;