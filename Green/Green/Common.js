//Common to all Testcases Functions
//---------------------------------
//

function GeneralEvents_OnTimeout(Sender, Params)
{
    Runner.Stop(true);  
}

function GeneralEvents_OnStartTest(Sender){
    UpdateConnectionString();

    if (Project.TestItems.Current != null) {
        Indicator.PushText(Project.TestItems.Current.Name);
    }
}

function GeneralEvents_OnStopTest(Sender){

    var ErrorCount = Log.ErrCount;

    if (ErrorCount > 0) {
        ProjectSuite.Variables.FailedCount++;
    }
}

module.exports.setBoldedItalicLogMessage = function (mytext) {

    setStandoutMessage(mytext);   
}

function setStandoutMessage(mytext) {
  
    var attr = Log.CreateNewAttributes();
    attr.Bold = true;
    attr.Italic = true;
    // ...
    // Applies these attributes to a message
    Log.Message(mytext, "", pmNormal, attr);
}

function callMQListQueueStatus(queueManager, hostName, port, channel, queueName, expectedConnection, expectedUser, expectedStatus) {
    
    parms = "-m "+queueManager+" -h "+hostName+" -p "+port+" -c "+channel+" -q "+queueName;
    var handleState = "Unknown";
    var handleUserid = "Unknown";
    var connectedTo = "Unknown";
    var result = null;
    
    try {
        result = JavaClasses.UnnamedPackage.MQListQueueStatus.discover(parms);
        Log.Message(result);
        var errorFound = false;
        var obj = JSON.parse(result);
        handleState = obj.handleState;
        handleUserid = obj.handleUserid;
        connectedTo = obj.connectedTo;
        
     } catch (exception) {
        Log.Error("Error Running MQStatus utility.  Error: " + exception.message + ".");
     }
   
    if (handleState != expectedStatus) {
        Log.Error("Queue '"+queueName+"' expecting a Status = '"+expectedStatus+"'. Instead returned "+handleState);
        errorFound = true;
    }
    
    if (handleUserid != expectedUser) {
        Log.Error("Connection Userid to Queue '"+queueName+"' expected '"+expectedUser+"'. Instead returned "+handleUserid);  
        errorFound = true;
    }
    
    if (connectedTo != expectedConnection) {
        Log.Error("Queue '"+queueName+"' expected to be Connected to '"+expectedConnection+"'. Instead returned "+connectedTo);  
        errorFound = true;
    }
    
    if (!errorFound) {
        Log.Message("Queue '"+queueName+"' is '"+obj.handleState+"' and Connected to '"+obj.connectedTo+"' via userid '"+obj.handleUserid+"'");
    }
    
}