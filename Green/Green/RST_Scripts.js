//RST Specific Functions
//----------------------
//
var XmlPayloads = require("XmlPayloads");
var FileProcessing = require("FileProcessing");
var Database = require("Database");

function getSourceRSTPayload(type, environment, identifier) {

    var Qry;
    var sqlFile;
    var sqlQuery;
    var payLoad;
    var typeCode;
    var connectionString;
    var dbName = "RST";
    var placeHolder = "$$MESSAGEGUID$$";
    var testingEnvironment = ProjectSuite.Variables.environment;
    if (environment != null && environment.length > 0) {
        testingEnvironment = environment;
    }
    
    switch (type)
    {
        case "RailJobList":
          filename = "RST_Get_Last_Message_Sent.sql";
          break; 
     
        default:
          Log.Error("Invalid Payload type specified! Currently only RailJobList type (code = 4) is available.  Received " + type + ".");
          Runner.Stop(true);            
    }   
     
    //Read the SQL query from a file and write to a String
    connectionString = Database.getDbConnectionString(dbName, testingEnvironment);
    sqlFile = Project.Path + "Stores\\Files\\" + filename;
    sqlQuery = aqFile.ReadWholeTextFile(aqConvert.VarToStr(sqlFile), aqFile.ctANSI);
    sqlQuery = sqlQuery.replace(placeHolder, identifier);
    
    return XmlPayloads.executeSQLToExtractPayload(connectionString, sqlQuery);
}

function createNewRstMessage(type, environment, identifier) {
    
    var aConnection; 
    var resultSet;
    var filename; 
    var payload;
    var sqlFile;
    var sqlQuery
    var latestMsgSQL;
    var parameters;
    var placeHolder = "$$MESSAGEID$$";
    var dbName = "RST";
    var testingEnvironment = ProjectSuite.Variables.environment;
    if (environment != null && environment.length > 0) {
        testingEnvironment = environment;
    }
    
    var connectionString = Database.getDbConnectionString(dbName, testingEnvironment);
      
    switch (type)
    {   
        case "RailJobList":
          sqlQuery = ProjectSuite.Variables.NewRailJobListSQL;
          break;
           
        default:
          Log.Error("Invalid Message type specified! Currently only RailJobList is available.  Received " + type + ".");
          Runner.Stop(true);
     }
    
    sqlQuery = Database.updateSqlScriptVariable(sqlQuery, placeHolder, identifier);
    aConnection = Database.createADBConnection(dbName);
    Database.executeSQLCommand(aConnection, sqlQuery);
    aConnection.Close();

    waitForRstMessageToProcess(type, testingEnvironment, identifier);
}

function getLatestInBoundMessageSql () {
  
    sqlFilename = Project.Path + "Stores\\Files\\RM_GeneratePublishPropertyMessage_Check.sql";
    return aqFile.ReadWholeTextFile(aqConvert.VarToStr(sqlFilename), aqFile.ctANSI); 
}

function getLatestMessageSql (dbName, identifier) {
  
    var latestMessageSql;
    var sqlFileName;
    
    switch (dbName)
    {
      case "RST":
        sqlFilename = Project.Path + "Stores\\Files\\RST_Get_Last_Message_Sent.sql";
        break;
     
      default:
        Log.Error("Invalid Database Name specified! Currently only RST is available.  Received " + dbName + ".");
        Runner.Stop(true);
    }  
    
    var sqlText = aqFile.ReadWholeTextFile(aqConvert.VarToStr(sqlFilename), aqFile.ctANSI);
    return sqlText.replace("$$MESSAGEGUID$$", identifier); 
}

function setLastRSTMessageIdToVariable(environment, identifier) {
    
    var dbName = "RST";
    ProjectSuite.Variables.msgId = getLatestMessageFromDB(dbName, environment, "MessageId", identifier);
    ProjectSuite.Variables.originalXml = "";
    ProjectSuite.Variables.expectedXml = "";
}

function saveSourceRSTPayloadToFile(type, environment, identifier, fileName) {

    FileProcessing.writeToFile(fileName, getSourceRSTPayload(type, environment, identifier));
}

function saveSourceRSTPayloadToVariable(type, environment, identifier) {

    ProjectSuite.Variables.originalXml = getSourceRSTPayload(type, environment, identifier);
}

function saveTargetRSTPayloadToVariable(environment, columnName, identifier) {
  
    var dbName = "RST";
    var message = getLatestMessageFromDB(dbName, environment, columnName, identifier);
    ProjectSuite.Variables.actualXml = message;
}

function sendMessageFromDbToFile(environment, columnName, fileName, identifier) {
  
    var dbName = "RST";
    var actualMessage = getLatestMessageFromDB(dbName, environment, columnName, identifier);
    FileProcessing.writeToFile(fileName, actualMessage);
}

function getLatestMessageFromDB(dbName, environment, columnName, identifier) {
  
    var connectionString = Database.getDbConnectionString(dbName, environment);
    var sqlQuery = getLatestMessageSql(dbName, identifier);
    var resultSet = Database.executeSQLQuery(connectionString, sqlQuery);    
    var columnValue = resultSet.FieldByName(columnName).Value;
    
    Log.Message("DbName: " +dbName+ " - Last " + columnName + " #### = " + columnValue);
    return columnValue;
}

function waitForRstMessageToProcess(type, environment, identifier) {
  
    var dbName = "RST";
    var accumulativeTime = 0;
    var identifyingNode = "AgreementVersion";
    var testingEnvironment = ProjectSuite.Variables.environment;
    if (environment != null && environment.length > 0) {
        testingEnvironment = environment;
    }
    
    var connectionString = Database.getDbConnectionString(dbName, testingEnvironment);
    
    switch(type) {

        case "RailJobList":
          identifyingNode = "MessageID";
          break;
          
        default:
          Log.Error("Invalid Message Type specified! Currently only RailJobList is available.  Received " + type + ".");
          Runner.Stop(true);
    }
    
    var sqlQuery = getLatestMessageSql(dbName, identifier);
    var resultSet = Database.executeSQLQuery(connectionString, sqlQuery);
    var payload = resultSet.FieldByName("MessagePayload").Value;
    var actualId = XmlPayloads.getValueOfFirstNode(payload, identifyingNode);
    var rstMsgId = resultSet.FieldByName("MessageId").Value;
    var oldRmMsgId = ProjectSuite.Variables.lastRstMsgId;
    
    Log.Message("Message isProcessed");
    
    while (actualId != identifier ||
           oldRmMsgId == rstMsgId ){
                
        if (accumulativeTime == 300000) {
            Log.Error("Record with an RST MessageGUID = '"+idenifier+"' was not processed.");
            Runner.Stop(true);
        }
        delay(2000);
        accumulativeTime += 2000;

        resultSet = Database.executeSQLQuery(connectionString, sqlQuery);
        payload = resultSet.FieldByName("MessagePayload").Value;
        rstMsgId = resultSet.FieldByName("MessageId").Value;
        actualId = XmlPayloads.getValueOfFirstNode(payload, identifyingNode);
    }
    
    Log.Message("Record of Type '"+type+"' and MessageGUID = '"+identifier+"' has been processed.");
    ProjectSuite.Variables.msgId = rstMsgId;
}