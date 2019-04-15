//DM Specific Functions
//---------------------
//
var XmlPayloads = require("XmlPayloads");
var FileProcessing = require("FileProcessing");
var Database = require("Database");

function setLastDMMessageIdToVariable(type) {
    
    var dbName = "DM";
    var dmPayload = getLatestMessageFromDB(dbName, "Message", type);
    ProjectSuite.Variables.lastDmMsgId = XmlPayloads.getValueOfFirstNode(dmPayload, "MesSequence");
    ProjectSuite.Variables.originalXml = "";
    ProjectSuite.Variables.expectedXml = "";
}

function createNewDmMessage(type, environment, identifier) {
    
    var aConnection; 
    var resultSet;
    var filename; 
    var sqlFile;
    var sqlQuery
    var latestMsgSQL;
    var placeHolder;
    var dbName = "DM";
    var testingEnvironment = ProjectSuite.Variables.environment;
    if (environment != null && environment.length > 0) {
        testingEnvironment = environment;
    }
      
    switch (type)
    {   
        case "EquipmentItem":
          placeHolder = "$$RECORDID$$";
          filename = "NewDMEquipmentItemMessage.sql";
          break;
           
        case "EquipmentRoute":
          placeHolder = "$$RECORDID$$";
          filename = "NewDMEquipmentRouteMessage.sql";
          break;
           
        case "EquipmentHierarchy":
          placeHolder = "$$RECORDID$$";
          filename = "NewDMEquipmentHierarchyMessage.sql";
          break;
           
        case "EquipmentHierarchyNode":
          placeHolder = "$$RECORDID$$";
          filename = "NewDMEquipmentHierarchyNodeMessage.sql";
          break;
           
        default:
          Log.Error("Invalid Payload type specified! Currently only EquipmentItem, EquipmentRoute, EquipmentHierarchy & EquipmentHierarchyNode types are available.  Received " + type + ".");
          Runner.Stop(true);
     }
    
    sqlFile = Project.Path + "Stores\\Files\\" + filename;
    sqlQuery = aqFile.ReadWholeTextFile(aqConvert.VarToStr(sqlFile), aqFile.ctANSI);
    sqlQuery = Database.updateSqlScriptVariable(sqlQuery, placeHolder, identifier);
    aConnection = Database.createADBConnection(dbName, testingEnvironment);
    Database.executeSQLCommand(aConnection, sqlQuery);
    aConnection.Close();

    waitForDmMessageToProcess(identifier);
}

function getLatestDMMessageSql (type) {
  
    var latestMessageSql;
    var sqlFilename = Project.Path + "Stores\\Files\\DM_Get_Last_Message_Received.sql";
    var placeHolder = "$$MESSAGETYPENAME$$";
    
    latestMessageSql = aqFile.ReadWholeTextFile(aqConvert.VarToStr(sqlFilename), aqFile.ctANSI); 
    if (placeHolder.length > 0) {
        latestMessageSql = latestMessageSql.replace(placeHolder, type);
    }
    
    return latestMessageSql;
}

function saveTargetDMPayloadToVariable(environment, columnName, type) {
  
    var dbName = "DM";
    var message = getLatestMessageFromDB(dbName, environment, columnName, type);
    ProjectSuite.Variables.actualXml = message;
}

function sendMessageFromDbToFile(environment, columnName, fileName, type) {
  
    var dbName = "DM";
    var actualMessage = getLatestMessageFromDB(dbName, environment, columnName, type);
    FileProcessing.writeToFile(fileName, actualMessage);
}

function getLatestMessageFromDB(dbName, environment, columnName, type) {
  
    var connectionString = Database.getDbConnectionString(dbName, environment);
    var sqlQuery = getLatestDMMessageSql(type);
    var resultSet = Database.executeSQLQuery(connectionString, sqlQuery);    
    var columnValue = resultSet.FieldByName(columnName).Value;
    
    Log.Message("DbName: " +dbName+ " - Last " + columnName + " #### = " + columnValue);
    return columnValue;
}

function waitForDmMessageToAppear(msgId, environment, testEquipmentId, qaEquipmentId, type) {
  
    var dbName = "DM";
    var accumulativeTime = 0;
    var sqlFilename = "Stores\\Files\\DM_Get_Last_Message_Received.sql";
    var equipmentId;
    var testingEnvironment = ProjectSuite.Variables.environment;
    if (environment != null && environment.length > 0) {
        testingEnvironment = environment;
    }
    
    
    if (testingEnvironment.toUpperCase().endsWith('DEV')) {
        equipmentId = testEquipmentId;
    } else if (testingEnvironment.toUpperCase().endsWith('TEST')) {
        equipmentId = testEquipmentId;
    } else if (testingEnvironment.toUpperCase().endsWith('QA')) {
        equipmentId = qaEquipmentId;
    } else {
        Log.Error("Invalid environment setting. Only DEV, UNATTENDED_DEV, TEST, UNATTENDED_TEST, QA and UNATTENDED_QA are acceptable.  Received '" + testingEnvironment.toUpperCase() + "'.");
          Runner.Stop(true);
    }
    
    var connectionString = Database.getDbConnectionString(dbName, testingEnvironment);
    switch(type) {
        
        case "Equipment":
          identifyingNode = "EquipmentID";
          break;
          
        case "EquipmentRoute":
          identifyingNode = "EquipmentRouteID";
          break;
          
        case "EquipmentHierarchy":
          identifyingNode = "HierarchyCode";
          break;
          
         case "EquipmentHierarchyNode":
          identifyingNode = "HierarchyCode";
          break;
          
        default:
          Log.Error("Invalid Message Type specified! Currently only EquipmentItem, EquipmentRoute, EquipmentHierarchy & EquipmentHierarchyNode are available.  Received " + dbName + ".");
          Runner.Stop(true);
    }
    
    var sqlQuery = aqFile.ReadWholeTextFile(aqConvert.VarToStr(sqlFilename), aqFile.ctANSI);
    sqlQuery = sqlQuery.replace("$$MESSAGETYPENAME$$", type);
    var resultSet = Database.executeSQLQuery(connectionString, sqlQuery);
    var dmPayload = resultSet.FieldByName("Message").Value;
    var payloadMsgId = XmlPayloads.getValueOfFirstNode(dmPayload, "MesSequence");
    var payloadEquipmentId = XmlPayloads.getValueOfFirstNode(dmPayload, identifyingNode);
    
    while ( payloadMsgId != msgId &&
            payloadEquipmentId != equipmentId){
                
        if (accumulativeTime == 300000) {
            Log.Error("DM Record with MesSequence = '"+msgId+"' and "+identifyingNode+" '"+equipmentId+"' could not be found.");
            resultSet.Close;
            Runner.Stop(true);
            
        }
        delay(2000);
        accumulativeTime += 2000;

        resultSet = Database.executeSQLQuery(connectionString, sqlQuery);
        dmPayload = resultSet.FieldByName("Message").Value;
        payloadMsgId = XmlPayloads.getValueOfFirstNode(dmPayload, "MesSequence");
        payloadEquipmentId = XmlPayloads.getValueOfFirstNode(dmPayload, identifyingNode);
    }
    
    resultSet.Close;
    Log.Message("DM Record with MesSequence = '"+msgId+"' and "+identifyingNode+" '"+equipmentId+"' was found.");
    ProjectSuite.Variables.lastDmMsgId = msgId;
    ProjectSuite.Variables.msgId = msgId;
}