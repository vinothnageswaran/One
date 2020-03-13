
//const database = require ('./pages/home/database.js');



const cucumber = require('cypress-cucumber-preprocessor').default
const sql = require("mssql");
const PSS_seed_dbConfigautomation = {
  user: "Automationuser",
  password: "Password123",
  server: "IORPER-SQLT06\\SQL2014",
  database: "LSTIOPSDbSeedAutomation"
};

const PSS_dbConfig = {
    user: "Automationuser",
    password: "Password123",
    server: "IORPER-SQLT06\\SQL2014",
    database: "LSTDBAutomation"
  };


  const PSS_Seed_dbConfig = {
    user: "Automationuser",
    password: "Password123",
    server: "IORPER-SQLT06\\SQL2014",
    database: "LSTIOPSDbSeedAutomation"
  };

  const PSSD_dbConfig = {
    user: "Automationuser",
    password: "Password123",
    server: "IORPER-SQLT06\\SQL2014",
    database: "LstProxy"
  };

  const PSSD_Seed_dbConfig = {
    user: "Automationuser",
    password: "Password123",
    server: "IORPER-SQLT06\\SQL2014",
    database: "LstProxyAutomation"
  };

  

  module.exports = (on, config) => {
    on("file:preprocessor", cucumber()),
      on("task", {
        getTides(id) {
          return sql.connect(PSS_dbConfig).then(pool => {
            return pool
              .request()
              .input('input_parameter', sql.BigInt, id)
              .query("SELECT AssetId FROM LSTDbAutomation.dbo.Asset where assetid=@input_parameter");
          });
        },

        PSS_file(sqlscript) {
          
          return sql.connect(PSS_dbConfig).then(pool => {
            return pool
              .request()
              .query(sqlscript);
           
          });
        },

        PSS_Seed_file(sqlscript) {
          
          return sql.connect(PSS_Seed_dbConfig).then(pool => {
            return pool
              .request()
              .query(sqlscript);
           
          });
        },
        PSSD_file(sqlscript) {
          
          return sql.connect(PSSD_dbConfig).then(pool => {
            return pool
              .request()
              .query(sqlscript);

           
          });
        },

        PSSD_seed_file(sqlscript) {
          
          return sql.connect(PSSD_Seed_dbConfig).then(pool => {
            return pool
              .request()
              .query(sqlscript);
           
          });
        },

        
          getGenerationStatus() {
            return sql.connect(PSS_dbConfig).then(pool => {
              return pool
                .request()
                .query("SELECT generationstatus from LSTDbAutomation.dbo.ScenarioGeneration where ScenarioGenerationId =(Select max(scenariogenerationid) from LSTDbAutomation.dbo.ScenarioGeneration)");
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






