//SOCR Message Producer
//---------------------
//
var XmlPayloads = require("XmlPayloads");
var FileProcessing = require("FileProcessing");
var Database = require("Database");

function endOfLoopMessage() {
  Log.Message("End of Data-Driven Loop", "", pmNormal, attr);
}

function injectSOCRMessage (environment, messageCount, messageType, filePathToXml) {
    
    var batfileName = "";
    switch (environment.toUpperCase()) {
        case "DEV":
        case "UNATTENDED_DEV":
            batfileName = Project.Path + "Stores\\Files\\MessageProducer_Dev.bat"
            break;
        case "TEST":
        case "UNATTENDED_TEST":
        case "QA":
        case "UNATTENDED_QA":
            batfileName = Project.Path + "Stores\\Files\\MessageProducer_Test.bat"
            break;
        default:
            Log.Error("Invalid Environment Specified. Only Dev, Test, Test_Unattended, QA or QA_Unattened are available.  Received " + environment + ".");
            Runner.Stop(true);
    }

    var wshShell = new Sys.OleObject("WScript.Shell");
    var command = batfileName + " " + messageCount + " " + messageType + " " + filePathToXml;
    var command_return_value = wshShell.Run(command);
    if (command_return_value != 0) {
        Log.Error("MessageProducer Injector tool returned a return code of " + command_return_value + ". Expected a successful execution (returncode should = 0)");
        Runner.Stop(true);
    }
}

function pad(number, width, length) {
    length = length || '0';
    number = number + '';
    return number.length >= width ? number : new Array(width - number.length + 1).join(length) + number;
}

function incrementControlRecipeId() {
    
    var controlRecipeIdFile = Project.Path + "Stores\\Files\\ControlRecipeIdFile.txt";
    var currentId = aqFile.ReadWholeTextFile(aqConvert.VarToStr(controlRecipeIdFile), aqFile.ctANSI);
    var newId;
    var counter = parseInt(currentId);
    if (counter == NaN) {
        throw("Stored controlReciperId is not a number.  Found " + currentId);
    } else {
       newId = ++counter;
       FileProcessing.updateExistingFile(Project.Path + "Stores\\Files\\", "ControlRecipeIdFile", newId, "txt");
    }
    
    return newId;
}

function processControlRecipeMessages(environment, messageCount, description, fileName, expectedResult, specificControlRecipeId) {
  
    var placeHolder = "$$CONTROLRECIPEID$$";
    var testingEnvironment = ProjectSuite.Variables.environment;
    if (environment != null && environment.length > 0)  {
        testingEnvironment = environment;  
    }
    
    var messageType = "ControlRecipe";
    if (fileName != null) {
        var xmlFileName = Project.Path + "Stores\\Files\\" + fileName + ".xml";
        var tempXmlFileName = FileProcessing.getTempFolder() + fileName + ".xml";
        var expectedToSucceed = false;
        if (expectedResult == 'Succeeds') {
            expectedToSucceed = true;
        }
    
        //Replace the ControlRecipeID in the message to be a controlled number
        var controlRecipeId = specificControlRecipeId;
        if (specificControlRecipeId != null && specificControlRecipeId.length > 0) {
            controlRecipeId = specificControlRecipeId;
        } else {
            controlRecipeId = incrementControlRecipeId().toString();
        }
        
        ProjectSuite.Variables.controlRecipeId = controlRecipeId;

        //var fileToProcess = FileProcessing.getTempFolder() + fileName;
        payload = aqFile.ReadWholeTextFile(aqConvert.VarToStr(xmlFileName), aqFile.ctUTF8);
        payload = payload.replace(placeHolder, controlRecipeId);
        ProjectSuite.Variables.originalXml = payload;
        FileProcessing.writeToFile(fileName, payload);
    
        //Inject the Message
        Log.Message("Injecting a " + messageType + " described as '" + description + "'.  Expected result is that it " + expectedResult, "", );
        injectSOCRMessage (testingEnvironment, messageCount, messageType, tempXmlFileName); 
        
        //Check the landing Table in SOCR
        waitForSOCRMessageToLand(controlRecipeId, messageType, testingEnvironment);
        
        //Get the Action Log
         var actionMessage = getInboundMessageAction(testingEnvironment, ProjectSuite.Variables.msgId);
        if (actionMessage == null || actionMessage.length == 0) {
            Log.Warning("No Action Message found for a " + messageType + "(Id=" + ProjectSuite.Variables.msgId + ") described as '" + description + "'.");
        } else {
            Log.Message("Action Message Id = " + parseActionLog(actionMessage, "InboundMessageId"));
            Log.Message("Action Message Action = " + parseActionLog(actionMessage, "Action"));
            Log.Message("Action Message Description = " + parseActionLog(actionMessage, "Description"));
            var Failures =  parseActionLog(actionMessage, "Failures");
        
            if (expectedToSucceed) {
                if (Failures != null && Failures.length > 0) {
                    Log.Error("Message Processing expected to proceed but Validation Errors Occurred: .");
                    Log.Message("Validation Failures: " + Failures);
                }
            } else {
                if (Failures == null || Failures.length == 0) {
                    Log.Warning("Failure Expected but no Validation Failures where present.")
                } else {
                    Log.Message("Validation Failures: " + Failures);  
                }
            }
        }
    }
}

function parseActionLog(jsonText, keyRequired) {
  
    var response = "";
    var jsonObj = JSON.parse(jsonText);
    switch (keyRequired) {
        case "Failures":
          for (var i in jsonObj.Failures) {
            if (i > 0) {
              response = failures + "\n" + jsonObj.Failures[i].Reason;
            } else {
              response = jsonObj.Failures[0].Reason;
            }
          }
          break;
          
        default: 
          response = jsonObj[keyRequired];
    }
    
    return response;
}

function verifySapControlRecipe(payload, environment, verifyLanded) {
  
    var testingEnvironment = ProjectSuite.Variables.environment;
    if (environment != null && environment.length > 0)  {
        testingEnvironment = environment;  
    }
    
    var dbName = "SOCR";
    var sapControlRecipeSql = ProjectSuite.Variables.CheckSapControlRecipeSQL;
    
    var connectionString = Database.getDbConnectionString(dbName, testingEnvironment);
    var materialId = XmlPayloads.getValueOfFirstNode(payload, "MaterialID");
    var controlRecipeId = XmlPayloads.getValueOfFirstNode(payload, "ControlRecipeID");
    var processOrderId = XmlPayloads.getValueOfFirstNode(payload, "ProcessOrderID");
    var statusCode = XmlPayloads.getValueOfFirstNode(payload, "StatusCode");
    var typeCode = XmlPayloads.getValueOfFirstNode(payload, "TypeCode");
    var periodCode = XmlPayloads.getValueOfFirstNode(payload, "PeriodCode");
     
    sapControlRecipeSql = sapControlRecipeSql.replace("$$CONTROLRECIPEID$$", controlRecipeId);
    sapControlRecipeSql = sapControlRecipeSql.replace("$$PROCESSORDERID$$", processOrderId);
    sapControlRecipeSql = sapControlRecipeSql.replace("$$MATERIALID$$", materialId);
    sapControlRecipeSql = sapControlRecipeSql.replace("$$PERIODCODE$$", periodCode);
    sapControlRecipeSql = sapControlRecipeSql.replace("$$STATUSCODE$$", statusCode);
    sapControlRecipeSql = sapControlRecipeSql.replace("$$TYPECODE$$", typeCode);
    
    var resultSet = Database.executeSQLQuery(connectionString, sapControlRecipeSql);  
    var idFound = resultSet.FieldByName("Id").Value;
    if (verifyLanded) {
        if (idFound == null) {
            Log.Error("Can not find Row in dbo.SapControlRecipe table for ControlRecipeId =  " + controlRecipeId + ".");
        } else {
            Log.Message("Found row in dbo.SapControlRecipe table with id = " + idFound);
        }
    } else { //Verify Not Landed 
        if (idFound == null){
            Log.Message("Row NOT Found in dbo.SapControlRecipe table as expected.");
        } else {
            Log.Error("Incorrectly Found a Row in dbo.SapControlRecipe table for ControlRecipeId =  " + controlRecipeId + ". Expected NOT to be there.");
        }
    }
}

function verifySocrMessageIsSuperseded(environment, lastMsgId) {
  
    var testingEnvironment = ProjectSuite.Variables.environment;
    var socrSql;
    if (environment != null && environment.length > 0)  {
        testingEnvironment = environment;  
    }
    
    var dbName = "SOCR";
    var socrSql = ProjectSuite.Variables.SapSupersededControlRecipeSql;
    socrSql = socrSql.replace("$$CONTROLRECIPEID$$", ProjectSuite.Variables.controlRecipeId);
    socrSql = socrSql.replace("$$LASTMESSAGEID$$", lastMsgId);
    
    var connectionString = Database.getDbConnectionString(dbName, testingEnvironment);
    var resultSet = Database.executeSQLQuery(connectionString, socrSql);  
    var status = resultSet.FieldByName("Status").Value;
    if (status != "Superseded") {
        Log.Error("The Status for the previous superseded Control Recipe Message was NOT 'Superseded. Instead found '" + status + "'.");
    } else {
        Log.Message("The Status for the previous duplicate message is correctly set to 'Superseded'.");
    }
}

function verifySocrProcessedData(type, environment, columnName, newValue, dbResult) {
    
    var testingEnvironment = ProjectSuite.Variables.environment;
    var socrSql;
    if (environment != null && environment.length > 0)  {
        testingEnvironment = environment;  
    }
    
    var expectedValue = newValue;
    if (expectedValue == "$$CONTROLRECIPEID$$") {
        expectedValue = ProjectSuite.Variables.controlRecipeId;
    }
    
    var dbName = "SOCR";
    switch (type) {
        case "SapControlRecipe":
          socrSql = ProjectSuite.Variables.SapControlRecipeSql;
          socrSql = socrSql.replace("$$COLUMNNAME$$", columnName);
          socrSql = socrSql.replace("$$DBRESULT$$", dbResult);
          socrSql = socrSql.replace("$$CONTROLRECIPEID$$", ProjectSuite.Variables.controlRecipeId);
          break;
          
        default: 
          Log.Error("Invalid Type specified.  Only SOCR Table names of SapControlRecipe is acceptable.  Found " + type);
          Runner.Stop(true);
    }
    
    var connectionString = Database.getDbConnectionString(dbName, testingEnvironment);
    var resultSet = Database.executeSQLQuery(connectionString, socrSql);  
    var actualValue = resultSet.FieldByName(columnName).Value;
    if (actualValue != expectedValue) {
        Log.Error("Checking Sap.ControlRecipe Table: The actual value for column '" + columnName + " = " + actualValue + "' which does not equal the expected value of '" + expectedValue + "'.");
    } else {
        Log.Message("Checking Sap.ControlRecipe Table: Change in column '" + columnName + "' correctly set to '" + expectedValue + "'");
    }
}

function saveSourcePayloadToVariable(type, xmlMessage) {

    ProjectSuite.Variables.originalXml = xmlMessage;
}

function setLastSOCRMessageIdToVariable(type, environment) {
    
    var dbName = "SOCR";
    ProjectSuite.Variables.msgId = getLatestMessageFromDB(dbName, environment, "MessageKey", type);
    ProjectSuite.Variables.originalXml = "";
    ProjectSuite.Variables.expectedXml = "";
}

function getLatestSOCRMessageSql (type) {
  
    var latestMessageSql;
    var dbName = "SOCR";
    var sqlFilename = Project.Path + "Stores\\Files\\SOCR_PublishMessageCheck.sql";
    var placeHolder = "$$MESSAGETYPE$$";
    
    latestMessageSql = aqFile.ReadWholeTextFile(aqConvert.VarToStr(sqlFilename), aqFile.ctANSI); 
    if (placeHolder.length > 0) {
        latestMessageSql = latestMessageSql.replace(placeHolder, type);
    }
    
    return latestMessageSql;
}

function getLatestMessageFromDB(dbName, environment, columnName, type) {
  
    var connectionString = Database.getDbConnectionString(dbName, environment);
    var sqlQuery = getLatestSOCRMessageSql(type);
    var resultSet = Database.executeSQLQuery(connectionString, sqlQuery);    
    var columnValue = resultSet.FieldByName(columnName).Value;
    
    Log.Message("DbName: " +dbName+ " - Last " + columnName + " #### = " + columnValue);
    return columnValue;
}

function getInboundMessageAction(environment, identifier) {
  
     var dbName = "SOCR";
     var sqlFilename = Project.Path + "Stores\\Files\\SOCR_MessageActionLogCheck.sql";
     var testingEnvironment = ProjectSuite.Variables.environment;
     if (environment != null && environment.length > 0) {
         testingEnvironment = environment;
     }
     
     var connectionString = Database.getDbConnectionString(dbName, testingEnvironment);
     var sqlQuery = aqFile.ReadWholeTextFile(aqConvert.VarToStr(sqlFilename), aqFile.ctANSI);
     sqlQuery = sqlQuery.replace("$$MESSAGEID$$", identifier);
     var resultSet = Database.executeSQLQuery(connectionString, sqlQuery);
     return resultSet.FieldByName("Action").Value;
}

function waitForSOCRMessageToLand(identifier, type, environment) {
  
    var dbName = "SOCR";
    var accumulativeTime = 0;
    var IdentifyingNode;
    var sqlFilename = Project.Path + "Stores\\Files\\SOCR_PublishMessageCheck.sql";
    if (ProjectSuite.Variables.msgId == null) {
        ProjectSuite.Variables.msgId = 0;
    }
    
    var testingEnvironment = ProjectSuite.Variables.environment;
    if (environment != null && environment.length > 0) {
        testingEnvironment = environment;
    }
    
    var connectionString = Database.getDbConnectionString(dbName, testingEnvironment);
    switch(type) {
        
        case "ControlRecipe":
          identifyingNode = "ControlRecipeID";
          break;
        
        default:
          Log.Error("Invalid Message Type specified! Currently only ControlRecipe is available.  Received " + type + ".");
          Runner.Stop(true);    
    }
    
    var sqlQuery = aqFile.ReadWholeTextFile(aqConvert.VarToStr(sqlFilename), aqFile.ctANSI);
    sqlQuery = sqlQuery.replace("$$MESSAGETYPE$$", type);
    
    var resultSet = Database.executeSQLQuery(connectionString, sqlQuery);
    var msgId = resultSet.FieldByName("Id").Value;
    var payload = resultSet.FieldByName("Message").Value;
    var processOrderId = XmlPayloads.getValueOfFirstNode(payload, identifyingNode);
    var oldSOCRId = ProjectSuite.Variables.MsgId;
    
    Log.Message("Last Message Id = " +msgId);
    
    while (processOrderId != identifier ||
           oldSOCRId == msgId.toString() ){
                
        if (accumulativeTime == 300000) {
            Log.Error("Record with MessageId = '"+msgId+"' and "+identifyingNode+" = '"+processOrderId+"' was not processed.");
            Runner.Stop(true);
        }
        delay(2000);
        accumulativeTime += 2000;

        resultSet = Database.executeSQLQuery(connectionString, sqlQuery);
        msgId = resultSet.FieldByName("Id").Value;
        payload = resultSet.FieldByName("Message").Value;
        processOrderId = XmlPayloads.getValueOfFirstNode(payload, identifyingNode);
    }
    
    Log.Message("Record for "+identifyingNode+" = '"+processOrderId+"' and Id = '"+msgId+"' has been processed.");
    ProjectSuite.Variables.msgId = msgId;
    ProjectSuite.Variables.actualXml = payload;
}