//PSS Specific Functions
//----------------------
//
var XmlPayloads = require("XmlPayloads");
var FileProcessing = require("FileProcessing");
var Database = require("Database");

function getLatestMessageSql (messageType) {
  
    var latestMessageSql;
    var sqlFileName = Project.Path + "Stores\\Files\\PSS_Get_Last_Message.sql";
    var environment = ProjectSuite.Variables.environment;
    var sqlString = aqFile.ReadWholeTextFile(aqConvert.VarToStr(sqlFileName), aqFile.ctUnicode);
    sqlString = sqlString.replace("$$ENV$$", environment);
    return sqlString.replace("$$MESSAGETYPE$$", messageType);
}

function setLastPSSMessageIdToVariable(type, environment) {
    
    var dbName = "PSS";
    ProjectSuite.Variables.msgId = getLatestMessageFromDB(dbName, environment, "messageId", type);
    ProjectSuite.Variables.lastPssMsgId = ProjectSuite.Variables.msgId;
    ProjectSuite.Variables.originalXml = "";
    ProjectSuite.Variables.expectedXml = "";
}

function saveTargetPSSPayloadToVariable(messageType, environment, columnName) {
  
    var dbName = "PSS";
    var message = getLatestMessageFromDB(dbName, environment, columnName, messageType);
    ProjectSuite.Variables.actualXml = message;
}

function sendMessageFromDbToFile(environment, columnName, fileName, messageType) {
  
    var dbName = "PSS";
    var actualMessage = getLatestMessageFromDB(dbName, environment, columnName, messageType);
    FileProcessing.writeToFile(fileName, actualMessage);
}

function getLatestMessageFromDB(dbName, environment, columnName, messageType) {
  
    var connectionString = Database.getDbConnectionString(dbName, environment);
    var sqlQuery = getLatestMessageSql(messageType);
    var resultSet = Database.executeSQLQuery(connectionString, sqlQuery);    
    var columnValue = resultSet.FieldByName(columnName).Value;
    
    Log.Message("DbName: " +dbName+ " - Last " + columnName + " for type " + messageType + "#### = " + columnValue);
    return columnValue;
}

function waitAndVerifyPSSMessageNotLanded(type, environment, identifier, waitTimeInMilliseconds) {

    var dbName = "PSS";
    var accumulativeTime = 0;
    var identifyingNode = "";
    var messageType;
    var testingEnvironment = ProjectSuite.Variables.environment;
    if (environment != null && environment.length > 0) {
        testingEnvironment = environment;
    }
    
    var connectionString = Database.getDbConnectionString(dbName, testingEnvironment);
    
    switch(type) {
        
        case "EquipmentItem":
          identifyingNode = "EquipmentID";
          messageType = "EquipmentItem";
          break;
        
        case "MaterialDesigned":
          identifyingNode = "MaterialCode";
          messageType = "MaterialDefinition";
          break;;
          
        default:
          Log.Error("Invalid Message Type specified! Currently only EquipmentItem & MaterialDefinition are available.  Received " + type + ".");
          Runner.Stop(true);
    }
    
    var sqlQuery = getLatestMessageSql(messageType);
    var resultSet = Database.executeSQLQuery(connectionString, sqlQuery);
    var isProcessed = resultSet.FieldByName("IsProcessed").Value;
    var payload = resultSet.FieldByName("MessageContent").Value;
    var actualId = XmlPayloads.getValueOfFirstNode(payload, identifyingNode);
    var pssMsgId = resultSet.FieldByName("MessageId").Value;
    var lastPssMsgId = ProjectSuite.Variables.lastPssMsgId;
    
    Log.Message("Waiting for " + waitTimeInMilliseconds + " milliseconds, Checking if the message lands.");
    
    while (accumulativeTime <= waitTimeInMilliseconds) {
      
        if (pssMsgId != lastPssMsgId) {
            if (actualId == identifier && isProcessed == 1) {
                ProjectSuite.Variables.lastPssMsgId = pssMsgId;
                Log.Error("Message of Type = '" + type + "', Identified by '" + identifier + "' landed in PSS when it should not.");
                break; 
            }
        }
        
        delay(2000);
        accumulativeTime += 2000;
        
        resultSet = Database.executeSQLQuery(connectionString, sqlQuery);
        isProcessed = resultSet.FieldByName("IsProcessed").Value;
        pssMsgId = resultSet.FieldByName("MessageId").Value;
        payload = resultSet.FieldByName("MessageContent").Value;
        actualId = XmlPayloads.getValueOfFirstNode(payload, identifyingNode); 
    }
    
    resultSet.Close;
    Log.Message("Record with Identifier '"+identifier+"' and MessageId = '"+actualId+"' did not land in PSS as expected.");
}


function waitForPSSMessageToProcess(type, environment, identifier) {
  
    var dbName = "PSS";
    var accumulativeTime = 0;
    var identifyingNode = "";
    var messageType;
    var testingEnvironment = ProjectSuite.Variables.environment;
    if (environment != null && environment.length > 0) {
        testingEnvironment = environment;
    }
    
    var connectionString = Database.getDbConnectionString(dbName, testingEnvironment);
    
    switch(type) {
        
        case "EquipmentItem":
          identifyingNode = "EquipmentID";
          messageType = "EquipmentItem";
          break;
        
        case "MaterialDesigned":
          identifyingNode = "MaterialCode";
          messageType = "MaterialDefinition";
          break;;
          
        default:
          Log.Error("Invalid Message Type specified! Currently only EquipmentItem & MaterialDefinition are available.  Received " + type + ".");
          Runner.Stop(true);
    }
    
    var sqlQuery = getLatestMessageSql(messageType);
    var resultSet = Database.executeSQLQuery(connectionString, sqlQuery);
    var isProcessed = resultSet.FieldByName("IsProcessed").Value;
    var payload = resultSet.FieldByName("MessageContent").Value;
    var actualId = XmlPayloads.getValueOfFirstNode(payload, identifyingNode);
    var sourceMessageId = sourceMessageId = XmlPayloads.getValueOfFirstNode(payload, "MesSequence");
    var pssMsgId = resultSet.FieldByName("MessageId").Value;
    var oldPssMsgId = ProjectSuite.Variables.lastPssMsgId;
    var failureOccurred = false;
    
    while (isProcessed == 0 || 
           actualId != identifier ||
           oldPssMsgId == pssMsgId ){
                
        if (accumulativeTime == 300000) {
            Log.Error("Record with an Source Id = '"+identifier+"' was not processed.");
            resultSet.Close;
            failureOccurred = true;
            break;
        }
        delay(2000);
        accumulativeTime += 2000;

        resultSet = Database.executeSQLQuery(connectionString, sqlQuery);
        isProcessed = resultSet.FieldByName("IsProcessed").Value;
        payload = resultSet.FieldByName("MessageContent").Value;
        actualId = XmlPayloads.getValueOfFirstNode(payload, identifyingNode);
        sourceMessageId = XmlPayloads.getValueOfFirstNode(payload, "MesSequence");
        pssMsgId = resultSet.FieldByName("MessageId").Value;
    }
    
    if (!failureOccurred) {
        resultSet.Close;
        Log.Message("Record with Identifier '"+identifier+"' and MessageId = '"+pssMsgId+"' has been processed.");
        ProjectSuite.Variables.msgId = sourceMessageId;
    }
}