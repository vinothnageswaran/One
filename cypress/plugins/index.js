
//const database = require ('./pages/home/database.js');



const cucumber = require('cypress-cucumber-preprocessor').default
const sql = require("mssql");
const dbConfigautomationseed = {
  user: "Automationuser",
  password: "Password123",
  server: "IORPER-SQLT06\\SQL2014",
  database: "LSTIOPSDbSeedAutomation"
};

const dbConfigautomation = {
    user: "Automationuser",
    password: "Password123",
    server: "IORPER-SQLT06\\SQL2014",
    database: "LSTDBAutomation"
  };

  

  module.exports = (on, config) => {
    on("file:preprocessor", cucumber()),
      on("task", {
        getTides(id) {
          return sql.connect(dbConfigautomation).then(pool => {
            return pool
              .request()
              .input('input_parameter', sql.BigInt, id)
              .query("SELECT AssetId FROM LSTDbAutomation.dbo.Asset where assetid=@input_parameter");
          });
        },

        seedasfile(sqlscript) {
          
          return sql.connect(dbConfigautomationseed).then(pool => {
            return pool
              .request()
              .query(sqlscript);
           
          });
        },
        seedasquery(sqlscript) {
          
          return sql.connect(dbConfigautomationseed).then(pool => {
            return pool
              .request()
              .query(sqlscript);
           
          });
        }
        
      });
  };






