const Sequelize = require("sequelize")


const connection = new Sequelize('heroku_a425a292363217e', 'b0fc99005183c0', '5c2a85ec442fb17', {
    host: 'us-cdbr-east-04.cleardb.com',
    dialect: 'mysql'
})



module.exports = connection