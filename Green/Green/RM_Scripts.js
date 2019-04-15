//RM Specific Functions
//---------------------
//
var XmlPayloads = require("XmlPayloads");
var FileProcessing = require("FileProcessing");
var Database = require("Database");

function getSourceRMPayload(type, environment) {

    var Qry;
    var sqlFile;
    var sqlQuery;
    var payLoad;
    var connectionString;
    var dbName = "RM";
    
    switch (type)
    {
        case "ResourceProperties":
          filename = "PublishPropertyMessageCheck.sql";
          break; 
     
        case "ResourceAssignments":
          filename = "PublishAssignmentMessageCheck.sql";
          break;    
          
        default:
          Log.Error("Invalid Payload type specified! Currently only ResourceProperties & ResourceAssignments types are available.  Received " + type + ".");
          Runner.Stop(true);            
    }   
     
    //Read the SQL query from a file and write to a String
    connectionString = Database.getDbConnectionString(dbName, environment);
    sqlFile = Project.Path + "Stores\\Files\\" + filename;
    sqlQuery = aqFile.ReadWholeTextFile(aqConvert.VarToStr(sqlFile), aqFile.ctANSI);
    
    return XmlPayloads.executeSQLToExtractPayload(connectionString, sqlQuery); 
}

function createNewRmMessageByStoredProc(type, environment, identifier) {
    
    var aConnection; 
    var resultSet;
    var filename; 
    var payload;
    var sqlFile;
    var sqlQuery
    var latestMsgSQL;
    var parameters;
    var placeHolder = "";
    var storedProcName;
    var systemCode;
    var testingEnvironment = ProjectSuite.Variables.environment;
    if (environment != null && environment.length > 0) {
        testingEnvironment = environment;
    }

    var connectionString = Database.getDbConnectionString('RM', testingEnvironment);
              
    switch (type)
    {   
        case "TrainEvent":
          filename = "RM_Call_StoredProc_AddTrainEvent.sql";
          payloadFilename = "RM_TrainEvent_Message.txt";
          storedProcName = "usp_AddTrainEvent";
          systemCode = "TrainEvent";
          break;
           
        case "WorkSchedule":
          filename = "RM_Call_StoredProc_AddWorkSchedule.sql";
          payloadFilename = "RM_WorkSchedule_Message.txt"
          storedProcName = "usp_AddWorkSchedule";
          systemCode = "LST";
          placeHolder = "$$PUBLISHDATE$$";
          break;
           
        default:
          Log.Error("Invalid Message type specified! Currently only TrainEvent & WorkSchedule are available.  Received " + type + ".");
          Runner.Stop(true);
     }
    
    payloadFilename = Project.Path + "Stores\\Files\\" + payloadFilename;
    payload = aqFile.ReadWholeTextFile(aqConvert.VarToStr(payloadFilename), aqFile.ctUTF8);
    if (placeHolder.length > 0) {
        utcDate = new Date().toISOString();
        var zOffset = utcDate.lastIndexOf('.');
        utcDate = utcDate.substring(0, zOffset) + ".000000+08:00"; 
        payload = payload.replace(placeHolder, utcDate);
    }
    
    var returnedMsgId = Database.executeRMStoredProc("RM", payload, storedProcName, systemCode);
    Log.Message("Call to Stored proc: " +storedProcName+ " generated record with MessageId = " + returnedMsgId );
    
    waitForRmMessageToExist(testingEnvironment, returnedMsgId);
}

function getLatestInBoundMessageSql () {
  
    sqlFilename = Project.Path + "Stores\\Files\\RM_GeneratePublishPropertyMessage_Check.sql";
    return aqFile.ReadWholeTextFile(aqConvert.VarToStr(sqlFilename), aqFile.ctANSI); 
}

function getLatestMessageFromRSTSql() {
  
    var sqlFilename = Project.Path + "Stores\\Files\\RM_Get_Last_RST_Message.sql";
    return aqFile.ReadWholeTextFile(aqConvert.VarToStr(sqlFilename), aqFile.ctANSI); 
}

function getRMProcessedMsgSql (msgId) {
     
    var messageSql;
    var sqlFileName = Project.Path + "Stores\\Files\\RM_Get_StagingProcessed.sql";
    var placeHolder = "$$MESSAGEID$$";
    
    messageSql = aqFile.ReadWholeTextFile(aqConvert.VarToStr(sqlFileName), aqFile.ctANSI); 
    if (placeHolder.length > 0) {
        messageSql = messageSql.replace(placeHolder, msgId);
    }
    
    return messageSql;
}

function getLatestMessageSql (type) {
  
    var latestMessageSql;
    var sqlFileName = Project.Path + "Stores\\Files\\RM_Get_Last_Message.sql";
    var placeHolder = "$$MESSAGETYPE$$";
    
    latestMessageSql = aqFile.ReadWholeTextFile(aqConvert.VarToStr(sqlFileName), aqFile.ctANSI); 
    if (placeHolder.length > 0) {
        latestMessageSql = latestMessageSql.replace(placeHolder, type);
    }
    
    return latestMessageSql; 
}

function setLastRMMessageIdToVariable(type, environment) {
    
    var dbName = "RM";
    ProjectSuite.Variables.msgId = getLatestMessageFromDB(dbName, environment, "messageId", type);
    ProjectSuite.Variables.originalXml = "";
    ProjectSuite.Variables.expectedXml = "";
    ProjectSuite.Variables.lastRmMsgId = ProjectSuite.Variables.msgId;
}

function saveSourceRMPayloadToFile(type, environment, fileName) {

    FileProcessing.writeToFile(fileName, getSourceRMPayload(type, environment));
}

function saveSourceRMPayloadToVariable(type, environment) {

    ProjectSuite.Variables.originalXml = getSourceRMPayload(type, environment);
}

function saveTargetRMPayloadFromRSTToVariable(environment, columnName) {
    var dbName = "RM";
    var message = getLatestRstMessageFromDB(dbName, environment, columnName);
    ProjectSuite.Variables.actualXml = message;
}

function saveTargetRMPayloadToVariable(environment, columnName, type) {
  
    var dbName = "RM";
    var message = getLatestMessageFromDB(dbName, environment, columnName, type);
    ProjectSuite.Variables.actualXml = message;
}

function sendMessageFromDbToFile(environment, columnName, fileName, type) {
  
    var dbName = "RM";
    var actualMessage = getLatestMessageFromDB(dbName, environment, columnName, type);
    FileProcessing.writeToFile(fileName, actualMessage);
}

function getLatestMessageFromDB(dbName, environment, columnName, type) {
  
    var connectionString = Database.getDbConnectionString(dbName, environment);
    var sqlQuery = getLatestMessageSql(type);
    var resultSet = Database.executeSQLQuery(connectionString, sqlQuery);    
    var columnValue = resultSet.FieldByName(columnName).Value;
    
    Log.Message("DbName: " +dbName+ " - Last " + columnName + " #### = " + columnValue);
    return columnValue;
}

function getLatestRstMessageFromDB(dbName, environment, columnName) {
  
    var connectionString = Database.getDbConnectionString(dbName, environment);
    var sqlQuery = getLatestMessageFromRSTSql();
    var resultSet = Database.executeSQLQuery(connectionString, sqlQuery);    
    var columnValue = resultSet.FieldByName(columnName).Value;
    
    Log.Message("DbName(with RST Message): " +dbName+ " - Last " + columnName + " #### = " + columnValue);
    return columnValue;
}

function waitForRmMessageAfterCallToProc(environment, type, identifier) {
  
    var dbName = "RM";
    var accumulativeTime = 0;
    var identifyingNode = "";
    var outgoingMessageId = 0;
    
    var connectionString = Database.getDbConnectionString(dbName, environment);
    
    switch(type) {
        
        case "TrainEvent":
          identifyingNode = "TrainConsist><Id"
          break;
          
        case "WorkSchedule":
          identifyingNode = ""
          break;
          
        default:
          Log.Error("Invalid Message Type specified! Currently only TrainEvent & WorkSchedule are available.  Received " + type + ".");
          Runner.Stop(true);
    }
    
    var sqlQuery = getLatestInBoundMessageSql();
    var resultSet = Database.executeSQLQuery(connectionString, sqlQuery);
    var errorCount = resultSet.FieldByName("IncomingErrorCount").Value;
    var incomingPayload = resultSet.FieldByName("IncomingMessage").Value;
    var outgoingPayload = resultSet.FieldByName("OutgoingMessage").Value;
    var actualId = XmlPayloads.getValueOfFirstNode(incomingPayload, identifyingNode);
    var agreementVersion = XmlPayloads.getValueOfFirstNode(outgoingPayload, "AgreementVersion");
    var oldRmMsgId = ProjectSuite.Variables.lastRmMsgId;
    
    Log.Message("Message isProcessed - Error Count = " +errorCount);
    
    while (errorCount != 0 || 
           actualId != identifier ||
           oldRmMsgId == agreementVersion ){
                
        if (accumulativeTime == 300000) {
            Log.Error("Record with an MDM MessageId = '"+agreementVersion+"' was not processed.");
            resultSet.Close;
            Runner.Stop(true);
        }
        delay(2000);
        accumulativeTime += 2000;

        resultSet = Database.executeSQLQuery(connectionString, sqlQuery);
        errorCount = resultSet.FieldByName("IncomingErrorCount").Value;
        incomingPayload = resultSet.FieldByName("IncomingMessage").Value;
        outgoingPayload = resultSet.FieldByName("OutgoingMessage").Value;
        outgoingMessageId = resultSet.FieldByName("OutgoingMessageId").Value;
        actualId = XmlPayloads.getValueOfFirstNode(incomingPayload, identifyingNode);
        agreementVersion = XmlPayloads.getValueOfFirstNode(outgoingPayload, "AgreementVersion");
    }
    
    Log.Message("Record with Identifier '"+identifier+"' and MessageId = '"+agreementVersion+"' has been processed with '"+errorCount+"' errors.");
    ProjectSuite.Variables.msgId = outgoingMessageId;
}

function waitForRmMessageToExist(environment, messageId) {
  
    var sqlQuery = getRMProcessedMsgSql(messageId);
    var testingEnvironment = ProjectSuite.Variables.environment;
    if (environment != null && environment.length > 0)  {
        testingEnvironment = environment;  
    }
  
    var connectionString = Database.getDbConnectionString("RM", testingEnvironment);  
    var resultSet = Database.executeSQLQuery(connectionString, sqlQuery);
    var payload;
    var recordFound;
    try {
        payload = resultSet.FieldByName("MessageContent").Value;
        recordFound = true;
    } catch (e) {
        recordFound = false;
    }
    
     while (!recordFound){
                
        if (accumulativeTime == 300000) {
            Log.Error("Record with an RM MessageId = '"+messageId+"' was not processed.");
            Runner.Stop(true);
        }
        delay(2000);
        accumulativeTime += 2000;
        
        resultSet = Database.executeSQLQuery(connectionString, sqlQuery);
        try {
            payload = resultSet.FieldByName("MessageContent").Value;
            recordFound = true;
        } catch (e) {
            recordFound = false;
        }
    }
}

function waitForRmMessageToProcess(type, environment, testIdentifier, qaIdentifier) {
  
    var dbName = "RM";
    var accumulativeTime = 0;
    var identifyingNode;
    var rmType = "ResourceDefinition";
    var sqlQuery;
    var errorCount = 0;
    var identifier;
    var testingEnvironment = ProjectSuite.Variables.environment;
    if (environment != null && environment.length > 0) {
        testingEnvironment = environment;
    }
    
    var connectionString = Database.getDbConnectionString(dbName, testingEnvironment);
    
    if (testingEnvironment.toUpperCase().endsWith('DEV')) {
        identifier = testIdentifier;
    } else if (testingEnvironment.toUpperCase().endsWith('TEST')) {
        identifier = testIdentifier;
    } else if (testingEnvironment.toUpperCase().endsWith('QA')) {
        identifier = qaIdentifier;
    } else {
        Log.Error("Invalid environment setting. Only DEV, UNATTENDED_DEV, TEST, UNATTENDED_TEST, QA & UNATTENDED_QA are acceptable.  Received '" + ProjectSuite.Variables.environment.toUpperCase() + "'.");
          Runner.Stop(true);
    }
    
    switch(type) {

        case "EquipmentItem":
          identifyingNode = "MesId";
          sqlQuery = getLatestMessageSql(rmType);
          break;
        
        case "EquipmentClass":
          identifyingNode = "ResourceClassCode";
          sqlQuery = getLatestMessageSql(rmType);
          break;
          
        case "EquipmentRoute":
          identifyingNode = "/ValidTo><MesId";
          sqlQuery = getLatestMessageSql(rmType);
          break;
          
        case "RailJobList":
          //identifyingNode = "NS1:SourceSystemCode";
          identifyingNode = "NS1:AgreementVersion";
          sqlQuery = getLatestMessageFromRSTSql();
          break;
          
        default:
          Log.Error("Invalid Message Type specified! Currently only EquipmentItem, EquipmentClass, EquipmentRoute & RailJobList are available.  Received " + type + ".");
          Runner.Stop(true);
    }
    
    var resultSet = Database.executeSQLQuery(connectionString, sqlQuery);
    var payload = resultSet.FieldByName("MessageContent").Value;
    var ns = "NS1:";
    var oldRmMsgId = "";
    if (type != "RailJobList") {
        errorCount = resultSet.FieldByName("ErrorCount").Value;
        oldRmMsgId = ProjectSuite.Variables.lastRmMsgId;
        ns = "";
    }
    
    var actualId = XmlPayloads.getValueOfFirstNode(payload, identifyingNode);                   //eg ActualId = A Guid value
    var agreementVersion = XmlPayloads.getValueOfFirstNode(payload, ns + "AgreementVersion");   
        
    Log.Message("Message isProcessed - Error Count = " +errorCount);
    
    while (errorCount != 0 || 
           actualId != identifier ||
           oldRmMsgId == agreementVersion ){
                
        if (accumulativeTime == 300000) {
            Log.Error("Record with an MDM MessageId = '"+agreementVersion+"' was not processed.");
            resultSet.Close;
            Runner.Stop(true);
        }
        delay(2000);
        accumulativeTime += 2000;

        resultSet = Database.executeSQLQuery(connectionString, sqlQuery);
        if  (type != "RailJobList") {
            errorCount = resultSet.FieldByName("ErrorCount").Value;
            oldRmMsgId = ProjectSuite.Variables.lastRmMsgId;
            ns = "";
        } 
        
        payload = resultSet.FieldByName("MessageContent").Value;
        actualId = XmlPayloads.getValueOfFirstNode(payload, identifyingNode);
        agreementVersion = XmlPayloads.getValueOfFirstNode(payload, ns + "AgreementVersion");
    }
    
    resultSet.Close;
    Log.Message("Record with Identifier '"+identifier+"' and MessageId = '"+agreementVersion+"' has been processed with '"+errorCount+"' errors.");
    ProjectSuite.Variables.msgId = agreementVersion;
}

function waitForRailJobListMessageToProcess(environment, identifier) {
  
    var dbName = "RM";
    var accumulativeTime = 0;
    var identifyingNode;
    var rmType = "ResourceDefinition";
    var sqlQuery;
    var testingEnvironment = ProjectSuite.Variables.environment;
    if (environment != null && environment.length > 0) {
        testingEnvironment = environment;
    }
    
    var connectionString = Database.getDbConnectionString(dbName, testingEnvironment);
    
    identifyingNode = "NS1:AgreementVersion";
    sqlQuery = getLatestMessageFromRSTSql();
    
    var resultSet = Database.executeSQLQuery(connectionString, sqlQuery);
    var payload = resultSet.FieldByName("MessageContent").Value;
    var ns = "NS1:";
    
    var actualId = XmlPayloads.getValueOfFirstNode(payload, identifyingNode);                   //eg ActualId = A Guid value
    var sourceSystem = XmlPayloads.getValueOfFirstNode(payload, "NS1:SourceSystemCode");   
        
    Log.Message("Message isProcessed - Id = " + identifier);
    
    while (actualId != identifier ||
           sourceSystem != "RST"){
                
        if (accumulativeTime == 300000) {
            Log.Error("Record with an MDM MessageId = '"+agreementVersion+"' was not processed.");
            resultSet.Close;
            Runner.Stop(true);
        }
        delay(2000);
        accumulativeTime += 2000;

        resultSet = Database.executeSQLQuery(connectionString, sqlQuery);
        actualId = XmlPayloads.getValueOfFirstNode(payload, identifyingNode);                   //eg ActualId = A Guid value
        sourceSystem = XmlPayloads.getValueOfFirstNode(payload, "NS1:SourceSystemCode");   
    
        payload = resultSet.FieldByName("MessageContent").Value;
    }
    
    resultSet.Close;
    Log.Message("Record with Identifier '"+identifier+"' and Source System = '"+sourceSystem+"' has been processed.");
}