/* This script library deals with pushing messages onto A Websphere MQ endpoint.
   This is done by an WebSphere Command-line utility called  MsgTest that relies on 
   an xml to define the Connetion and perform tasks against that connection.
*/
var XmlPayloads = require("XmlPayloads");
var FileProcessing = require("FileProcessing");
var Database = require("Database");

var LogStartMessage = "MsgTest V1.3.0 Started at ";
var LogTestResults = "Test results ";
var MsgTestConfig = "";
var delimiter = " ";

//InjectMessageOntoQueue
//Parameters:
//  1. Queue Manager  (eg ICCGW11)
//  2. Queue Name     (eg PSS.MATERIALDEFINITION.IN)
//  3. Channel Name   (eg ICCADMIN.ICCGW11)
//  4. Host           (eg per0tiib01)
//  5. Port           (eg 1430)
//  6. FilePath       (Full path to the MsgTest Utility and associated files)
//  7. MessageFileName(eg Just the filename:  eg MaterialDesigned_JIMF_Fines.xml) 
//  8. LogFileName    (eg WMQInjector.log)
function injectMessageOntoQueue (queueManager, queue, channel, host, port, filePath, messageFileName, logFileName) {
    
    var command = Project.Path + "Stores\\Files\\callMsgTest.bat "
                + Project.Path + "Stores\\Files\\PutMessageOnQueue.xml "
                + queueManager + " " 
                + queue + " " 
                + channel + " " 
                + host + " "
                + port + " "
                + filePath + " "
                + messageFileName + " "
                + logFileName;
    
    var wshShell = new Sys.OleObject("WScript.Shell");;
    wshShell.Run(command, 1, true);
}

function checkTime(i) {
    return (i < 10) ? "0" + i : i;
}

function isLogStartWithinTolerance(startTime, toleranceInSeconds) {
    var today = new Date();
    var y = today.getFullYear();
    var MM = checkTime(today.getMonth()) + 1;
    var d = checkTime(today.getDate());
    var h = checkTime(today.getHours());
    var m = checkTime(today.getMinutes());
    var s = checkTime(today.getSeconds());
    
    var startDateTime = new Date(d+"/"+MM+"/"+y+ " " +startTime);
    var todayTime = h+":"+m+":"+s;
    var todayWithTime = new Date(d+"/"+MM+"/"+y+ " " +todayTime);
    var difference = todayWithTime - startDateTime;
    difference = difference / 1000;    //Difference in Seconds
    
    return (difference > toleranceInSeconds ? false : true);
}

function waitForCompletionInInjectorLogs(filePath, logFileName) {

     var logMessage = FileProcessing.readFromFile(filePath + "\\" + logFileName);
     var lastMsgOffset = logMessage.lastIndexOf(LogStartMessage);
     var lastMessage = "No Message Found";
     var testResult = "Unknown";
     var resultMessage = "Unknown";
     var logTolleranceInSeconds = 5;
     var startTime = "";
     var loggingStarted = false;
     var accumulativeTime = 0;
     var timeout = 20000;
     var sleepTime = 2000;
     
     while (!loggingStarted) {
        if (lastMsgOffset > -1) {
          startTime = logMessage.substring(lastMsgOffset + LogStartMessage.length, logMessage.indexOf(".", lastMsgOffset + LogStartMessage.length));
          if (startTime.length > 0) {
              loggingStarted = isLogStartWithinTolerance(startTime, logTolleranceInSeconds);
              if (loggingStarted) {
                  //Check for End of Log and Result
                  lastMessage = logMessage.substring(lastMsgOffset);
                  var loggingEnded = false;
                  var startOfLog = LogStartMessage + startTime;
                  accumulativeTime = 0;
                  while (!loggingEnded) {
                      var resultOffset = lastMessage.indexOf(LogTestResults);
                      if (resultOffset > -1) {
                          testResult = lastMessage.substring(resultOffset + LogTestResults.length, lastMessage.indexOf(".", resultOffset));
                          resultMessage = "Test Result = " + testResult;
                          loggingEnded = true;
                          loggingStarted = true;
                      } else { 
                          if (accumulativeTime == timeout) {
                              Log.Error("Log Record End did not appear within " + accumulativeTime + " milliseconds.");
                              loggingEnded = true;
                          }
                          
                          delay(sleepTime);
                          accumulativeTime += sleepTime;
                          logMessage = FileProcessing.readFromFile(filePath + "\\" + logFileName);
                          lastMessage = logMessage.substring(startOfLog);
                      }
                  }
              }
          } else {
              if (accumulativeTime == timeout) {
                  Log.Error("Log Record Start did not appear within " + accumulativeTime + " milliseconds.");
              }
          }
          
          delay(sleepTime);
          accumulativeTime += sleepTime;
        } 
     } 
     
     return resultMessage;   
}

function injectMaterialDesignedMessageAndCheckResult(environment, description, fileName, expectedLog) {

    var filePath = Project.Path + "Stores\\Files";
    var queueManager = "ICCGW11";
    var queue = "SCP.MDCPC01.MESMDM.MATERIALDEFINITION.IN";
    var channel = "ICCADMIN.ICCGW11";
    var injectionResult;
    var host;
    var testingEnvironment = ProjectSuite.Variables.environment;
    if (environment != null && environment.length > 0) {
        testingEnvironment = environment;
    }
    
    switch (testingEnvironment.toUpperCase()) {
       case "DEV":
          host = "per0diib01";
          break;
       case "TEST":
       case "TEST_UNATTENDED":
          host = "per0tiib01";
          break;
       case "QA":
       case "QA_UNATTENDED":
          host = "per0qiib01";
          break;
       default:
          Log.Error("injectMaterialDesignedMessageAndCheckResult: Invalid Testing Environment specified! Currently only Dev, Test, Test_Unattended, QA & QA_Unattended are available.  Received " + environment + ".");
          Runner.Stop(true);
     }
     
     var port = "1430";
     var logFileName = "WMQInjector.log";
     var messageFileName = fileName;
     
     //Inject Message into queue    
     Log.Message("Injecting Message '" + description + "' into queue '" + queue + "'.");
     injectMessageOntoQueue (queueManager, queue, channel, host, port, filePath, messageFileName, logFileName) 
     
     //Wait for Processing to Finish
     ProjectSuite.Variables.injectorResult = waitForCompletionInInjectorLogs(filePath, logFileName);
     
     //Verify Result against Expected Log Result
     ProjectSuite.Variables.injectionSuccessful = verifyInjectionResult(ProjectSuite.Variables.injectorResult, expectedLog);
}

function getNumberAfterString(fullString, preString) {
    
    var number;
    var offset = fullString.indexOf(preString);
    if (offset > -1) {
        var numberString = parseInt(fullString.substring(offset+preString.length, fullString.indexOf(delimiter, offset)));
        number = parseInt(numberString);
        if (number == NaN) {
            throw ("Could not find a number in the MsgTest Log Result string after '" + preString + "'. Full result = '"+ fullString + "',");
        } 
    }
    
    return number;
}

function verifyInjectionResult(logFileResult, expected) {
    
    var totalString = "Total=";
    var successfulString = "Successful=";
    var failedString = "Failed=";
    var incompleteString = "Incomplete=";
    var results = [successfulString, failedString, incompleteString];
    var delimter = " ";
    var verification = true;
    var actualCount;
    var expectedCount;
    var injectorResult = logFileResult + delimiter; 
    var expectedResult = expected + delimiter;
        
    if (injectorResult != expectedResult) {
        var i;
        for (i = 0; i < results.length; i++) {
            try {
                actualCount = getNumberAfterString(injectorResult, results[i]);
                expectedCount = getNumberAfterString(expectedResult, results[i]);
                if (actualCount != expectedCount) {     
                    Log.Warning("Actual Result Field = '"+ results[i] +"' (Value="+actualCount+") does not equal the expected field (Value="+expectedCount+").");  
                    verification = false;  
                }

            } catch (parseError) {
                Log.Warning(parseError.message);
            }
        }
    }
    
    return verification;     
}