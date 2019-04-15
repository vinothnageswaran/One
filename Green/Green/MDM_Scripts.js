//MDM Specific Functions
//----------------------
//
var XmlPayloads = require("XmlPayloads");
var FileProcessing = require("FileProcessing");
var Database = require("Database");

function getSourceMDMPayload(type, testingEnvironment) {
  
 var Qry;
    var sqlFile;
    var sqlQuery;
    var payLoad;
    var connectionString;
    var dbName = "MDM";
    var checkSql = "MDM_PublishMessageCheck.sql";
    var placeHolder = "$$MESSAGETYPE$$";
    var fullMessageType;
    
    switch (type)
    {
        case "EquipmentItem":
          fullMessageType = "BHPBilliton.Mes.Mdm.ManufacturingExport.Model.Equipment.Equipment";
          break; 
     
        case "EquipmentRoute":
          fullMessageType = "BHPBilliton.Mes.Mdm.ManufacturingExport.Model.Network.EquipmentRoute";
          break;    
          
        case "EquipmentHierarchy":
          fullMessageType = "BHPBilliton.Mes.Mdm.ManufacturingExport.Model.Equipment.EquipmentHierarchy";
          break;    
          
        case "EquipmentHierarchyNode":
          fullMessageType = "BHPBilliton.Mes.Mdm.ManufacturingExport.Model.Equipment.EquipmentHierarchyNode";
          break;    
          
        case "EquipmentClass":
          fullMessageType = "BHPBilliton.Mes.Mdm.ManufacturingExport.Model.Equipment.EquipmentClass";
          break;
          
        case "MaterialDesigned":
          fullMessageType = "BHPBilliton.Mes.Mdm.ManufacturingExport.Model.Material.MaterialDesigned";
          break;
        default:
          Log.Error("Invalid Message type specified! Currently only EquipmentItem, EquipmentRoute, EquipmentClass, EquipmentHierarchy, EquipmentHierarchyNode & MaterialDefinition types are available.  Received " + type + ".");
          Runner.Stop(true);            
    }   
     
    //Read the SQL query from a file and write to a String
    connectionString = Database.getDbConnectionString(dbName, testingEnvironment);
    sqlFile = Project.Path + "Stores\\Files\\" + checkSql;
    sqlQuery = aqFile.ReadWholeTextFile(aqConvert.VarToStr(sqlFile), aqFile.ctANSI);
    sqlQuery = sqlQuery.replace(placeHolder, fullMessageType);
    
    return XmlPayloads.executeSQLToExtractPayload(connectionString, sqlQuery); 
}

function saveSourceMDMPayloadToFile(type, environment, fileName) {

    FileProcessing.writeToFile(fileName, getSourceMDMPayload(type, environment));
}

function saveSourceMDMPayloadToVariable(type, environment) {

    ProjectSuite.Variables.originalXml = getSourceMDMPayload(type, environment);
}

function createNewMdmMessage(type, environment, testIdentifier, qaIdentifier) {
    
    var aConnection; 
    var resultSet;
    var filename; 
    var sqlFile;
    var sqlQuery
    var latestMsgSQL;
    var placeHolder = "$$RECORDID$$";
    var placeHolder1 = "";
    var placeHolder2 = "";
    var dbName = "MDM";
    var identifier;
    var testingEnvironment = ProjectSuite.Variables.environment;
    if (environment != null && environment.length > 0 ) {
        testingEnvironment = environment;
    }
      
    switch (type)
    {   
        case "EquipmentItem":
          sqlQuery = ProjectSuite.Variables.NewEquipmentItemSQL;
          break;
           
        case "EquipmentRoute":
          sqlQuery = ProjectSuite.Variables.NewEquipmentRouteSQL;
          break;
           
        case "EquipmentHierarchy":
          sqlQuery = ProjectSuite.Variables.NewEquipmentHierarchySQL;
          break;
          
        case "EquipmentHierarchyNode":
          sqlQuery = ProjectSuite.Variables.NewEquipmentHierarchyNodeSQL;
          break;
          
        case "EquipmentClass":
          sqlQuery = ProjectSuite.Variables.NewEquipmentClassSQL;
          break;
          
        case "MaterialDesigned":
          sqlQuery = ProjectSuite.Variables.NewMaterialDesignedSQL;
          placeHolder = "$$MATERIALCODE$$";
          break;
          
        case "MaterialDesignedValue":
          sqlQuery = ProjectSuite.Variables.NewMaterialDesignedValueSQL;
          placeHolder = "$$MATERIALCODE$$";
          placeHolder1 = "$$CLASSPROPERTYCODE$$";
          placeHolder2 = "$$VALUE$$";
          break;
          
        default:
          Log.Error("Invalid Payload type specified! Currently only EquipmentItem, EquipmentRoute, EquipmentClass, EquipmentHierarchy, EquipmentHierarchyNode & MaterialDefinition types are available.  Received " + type + ".");
          Runner.Stop(true);
    }
    
    if (testingEnvironment.toUpperCase().endsWith('DEV')) {
        identifier = testIdentifier;
    } else if (testingEnvironment.toUpperCase().endsWith('TEST')) {
        identifier = testIdentifier;
    } else if (testingEnvironment.toUpperCase().endsWith('QA')) {
        identifier = qaIdentifier;
    } else {
        Log.Error("Invalid environment setting. Only DEV, UNATTENDED_DEV, TEST, UNATTENDED_TEST, QA & UNATTENDED_QA are acceptable.  Received '" + testingEnvironment + "'.");
          Runner.Stop(true);
    }
    
    sqlQuery = Database.updateSqlScriptVariable(sqlQuery, placeHolder, identifier);
    if (placeHolder1.length > 0) {
        sqlQuery = Database.updateSqlScriptVariable(sqlQuery, placeHolder, identifier);
    }
    aConnection = Database.createADBConnection(dbName, testingEnvironment);
    Database.executeSQLCommand(aConnection, sqlQuery);
    aConnection.Close();

    waitForMdmMessageToProcess(testingEnvironment, identifier, type);
}

//eg createNewMaterialDesignValueMessage(JIMF, Percent_Iron, 61.5)
function createNewMaterialDesignValueMessage(environment, identifier, classPropertyCode, propertyValue) {
    
    var aConnection; 
    var resultSet;
    //var filename; 
    var sqlFile;
    var sqlQuery
    var latestMsgSQL;
    var dbName = "MDM";
    var testingEnvironment = ProjectSuite.Variables.environment;
    if (environment != null && environment.length > 0 ) {
        testingEnvironment = environment;
    }
      
    //filename = "NewMaterialDesignedValueMessage.sql";
    var placeHolder = "$$MATERIALCODE$$";
    var placeHolder1 = "$$CLASSPROPERTYCODE$$";
    var placeHolder2 = "$$VALUE$$";
       
    //sqlFile = Project.Path + "Stores\\Files\\" + filename;
    //sqlQuery = aqFile.ReadWholeTextFile(aqConvert.VarToStr(sqlFile), aqFile.ctANSI);
    sqlQuery = ProjectSuite.Variables.NewMaterialDesignedValueSQL;
    sqlQuery = Database.updateSqlScriptVariable(sqlQuery, placeHolder, identifier);
    sqlQuery = Database.updateSqlScriptVariable(sqlQuery, placeHolder1, classPropertyCode);
    sqlQuery = Database.updateSqlScriptVariable(sqlQuery, placeHolder2, propertyValue);
    
    aConnection = Database.createADBConnection(dbName, testingEnvironment);
    Database.executeSQLCommand(aConnection, sqlQuery);
    aConnection.Close();

    waitForMdmMessageToProcess(testingEnvironment, identifier, "MaterialDesigned");
}

function setLastMDMMessageIdToVariable(type, testingEnvironment) {
    
    var dbName = "MDM";
    ProjectSuite.Variables.msgId = getLatestMessageFromDB(dbName, testingEnvironment, "messageId", type);
    ProjectSuite.Variables.originalXml = "";
    ProjectSuite.Variables.expectedXml = "";
}

function getLatestMDMMessageSql (type) {
  
    var latestMessageSql;
    var dbName = "MDM";
    var sqlFilename = Project.Path + "Stores\\Files\\MDM_PublishMessageCheck.sql";
    var placeHolder = "$$MESSAGETYPE$$";
    
    latestMessageSql = aqFile.ReadWholeTextFile(aqConvert.VarToStr(sqlFilename), aqFile.ctANSI); 
    if (placeHolder.length > 0) {
        latestMessageSql = latestMessageSql.replace(placeHolder, type);
    }
    
    return latestMessageSql;
}

function sendMessageFromDbToFile(dbName, environment, columnName, fileName, type) {
  
    var actualMessage = getLatestMessageFromDB(dbName, environment, columnName, type);
    FileProcessing.writeToFile(fileName, actualMessage);
}

function getLatestMessageFromDB(dbName, environment, columnName, type) {
  
    var connectionString = Database.getDbConnectionString(dbName, environment);
    var sqlQuery = getLatestMDMMessageSql(type);
    var resultSet = Database.executeSQLQuery(connectionString, sqlQuery);    
    var columnValue = resultSet.FieldByName(columnName).Value;
    
    if (columnValue == null) {
        Log.Warning("Unable to find Last message of type '"+ type +"' in database '"+ dbName +"'.");
    } else {
        Log.Message("DbName: " +dbName+ " - Last " + columnName + " #### = " + columnValue);
    }
    return columnValue;
}

function waitForMdmMessageToProcess(environment, identifier, type) {
  
    var dbName = "MDM";
    var accumulativeTime = 0;
    var IdentifyingNode = "";
    var messageType = "";
    var sqlFilename = Project.Path + "Stores\\Files\\MDM_PublishMessageCheck.sql";
    var testingEnvironment = ProjectSuite.Variables.environment;
    if (environment != null && environment.length > 0 ) {
        testingEnvironment = environment;
    }
    
    var connectionString = Database.getDbConnectionString(dbName, testingEnvironment);
    switch(type) {
        
        case "EquipmentItem":
          messageType = "BHPBilliton.Mes.Mdm.ManufacturingExport.Model.Equipment.Equipment";
          identifyingNode = "EquipmentID";
          break;
          
        case "EquipmentRoute":
          messageType = "BHPBilliton.Mes.Mdm.ManufacturingExport.Model.Network.EquipmentRoute";
          identifyingNode = "EquipmentRouteID";
          break;
          
        case "EquipmentHierarchy":
          messageType = "BHPBilliton.Mes.Mdm.ManufacturingExport.Model.Equipment.EquipmentHierarchy";
          identifyingNode = "HierarchyCode";
          break;
          
        case "EquipmentHierarchyNode":
          messageType = "BHPBilliton.Mes.Mdm.ManufacturingExport.Model.Equipment.EquipmentHierarchyNode";
          identifyingNode = "HierarchyCode";
          break;
          
        case "EquipmentClass":
          messageType = "BHPBilliton.Mes.Mdm.ManufacturingExport.Model.Equipment.EquipmentClass";
          identifyingNode = "EquipmentClassCode";
          break;
          
        case "MaterialDesigned":
          messageType = "BHPBilliton.Mes.Mdm.ManufacturingExport.Model.Material.MaterialDesigned";
          identifyingNode = "MaterialCode";
          break;
        
        default:
          Log.Error("Invalid Message Type specified! Currently only EquipmentItem, EquipmentRoute, EquipmentClass, EquipmentHierarchy, EquipmentHierarchyNode & MaterialDesigned are available.  Received " + type + ".");
          Runner.Stop(true);
    }
    
    var sqlQuery = aqFile.ReadWholeTextFile(aqConvert.VarToStr(sqlFilename), aqFile.ctANSI);
    sqlQuery = sqlQuery.replace("$$MESSAGETYPE$$", messageType);
    
    var resultSet = Database.executeSQLQuery(connectionString, sqlQuery);
    var isProcessed = resultSet.FieldByName("IsProcessed").Value;
    var msgId = resultSet.FieldByName("MessageId").Value;
    var payload = resultSet.FieldByName("MessagePayload").Value;
    var equipmentId = XmlPayloads.getValueOfFirstNode(payload, identifyingNode);
    var oldMdmMsgId = ProjectSuite.Variables.MsgId;
    
    Log.Message("Message isProcessed = " +isProcessed);
    
    while (isProcessed == false || 
           equipmentId != identifier ||
           oldMdmMsgId == msgId ){
                
        if (accumulativeTime == 300000) {
            Log.Error("Record identified by = '"+identifyingNode+"' and  '"+equipmentId+"' was not processed.");
            resultSet.Close;
            Runner.Stop(true);
        }
        delay(2000);
        accumulativeTime += 2000;

        resultSet = Database.executeSQLQuery(connectionString, sqlQuery);
        isProcessed = resultSet.FieldByName("IsProcessed").Value
        msgId = resultSet.FieldByName("MessageId").Value;
        payload = resultSet.FieldByName("MessagePayload").Value;
        equipmentId = XmlPayloads.getValueOfFirstNode(payload, identifyingNode);
    }
    
    resultSet.Close;
    Log.Message("Record for "+identifyingNode+" '"+equipmentId+"' and MessageId = '"+msgId+"' has a process flag of '"+isProcessed+"'");
    ProjectSuite.Variables.msgId = msgId;
}