//Database Functions
//------------------
//
var FileProcessing = require("FileProcessing");

module.exports.UpdateConnectionString = function() {
    //Obtain a collection of the DBTable elements using the aqObject.GetProperties method
    var props = aqObject.GetProperties(DBTables);
    var prop;
    var tableName;
    var newConnectionString = ProjectSuite.Variables.myConnString;
    var ConnectionString = "Value.ConnectionString";

    while (props.HasNext()) {
        //Move to the next property
        prop = props.Next();
        //Obtain the table name
        tableName = prop.Name;

        prop.Value.ConnectionString = newConnectionString;

    }
}

module.exports.executeRMStoredProc = function(dbName, payload, spName, systemCode) {
     AConnection = ADO.CreateADOConnection();
     AConnection.ConnectionString = returnConnectionString(dbName);
     AConnection.LoginPrompt = false;
     AConnection.Open();
     
     AConnection.BeginTrans();
     var command = "Begin Tran " +
                   "DECLARE @return_value int " +
                   "DECLARE @messageIdResult bigint " +
                   "SET @messageIdResult = 0 " +
                   "DECLARE @todaysDate DATETIME " +
                   "SET @todaysDate = GETDATE() " +
                   "DECLARE	@xmlPayload XML SET @xmlPayload = '" + 
                   payload +
                   "' EXEC	@return_value = [ResourceManagement].[Staging].[" + spName + "] " +
                   "     @xml = @xmlPayload, " +
                   "     @publishDate = @todaysDate, " +
                   "     @claimedSourceSystemCode = N'" + systemCode + "', " +
                   "     @messageIdResult = @messageIdResult OUTPUT " +
                   "  SELECT CAST(@messageIdResult AS varchar) " +
                   "Commit";
     
     FileProcessing.writeToFile("storedProc" , command, "sql");                              
                   
     var RecSet = AConnection.Execute_(command);
     
     RecSet.MoveFirst();
     var msgIdResult = 0;
     while(! RecSet.EOF)
     {
        msgIdResult = RecSet.Fields.Item(0).Value;
        RecSet.MoveNext();
     }
     AConnection.CommitTrans();
     AConnection.Close();
     return msgIdResult;
}

module.exports.updateSqlScriptVariable = function(sqlScript, variableName, variableValue) {
  
    var updatedScript = sqlScript;
    if (updatedScript.indexOf(variableName) > -1) {
        updatedScript = updatedScript.replace(variableName, variableValue);   
    }
    
    return updatedScript;
}

module.exports.createADBConnection = function(dbName, testingEnvironment) {

     var environment = ProjectSuite.Variables.environment;
     var aConnection;
     var result;
     var command;
     var connectionString = returnConnectionString(dbName, testingEnvironment);
     
     try {
        aConnection = ADO.CreateConnection();
        aConnection.ConnectionString = connectionString;
        aConnection.Open();
     } catch (sqlError) {
        Log.Error("SQL Error while establishing a Connection.  Error: " + sqlError.message + ".");
        Runner.Stop(true);
     }
     
     return aConnection;
}

function returnConnectionString(dbName, testingEnvironment) {

    var environment = ProjectSuite.Variables.environment;
    if (testingEnvironment != null && testingEnvironment.length > 0) {
        environment = testingEnvironment;
    }
    var userid = ProjectSuite.Variables.userid;
    var password = ProjectSuite.Variables.password;
    return constructConnectionString(dbName, environment, userid, password)
}

module.exports.getDbConnectionString = function(dbName, testingEnvironment) {

    return returnConnectionString(dbName, testingEnvironment);
}

function setConnectionCredentials(environment, userid, password) {
  
    var credentials;
    switch (environment.toUpperCase()) {
      case "DEV":
      case "TEST":
      case "QA":
        credentials = "Integrated Security=SSPI";
        break;
      case "UNATTENDED_DEV":
      case "UNATTENDED_TEST":
      case "UNATTENDED_QA":
        if (userid != null && userid.length != 0) {
            credentials = "User Id="+userid+";Password="+password;
        } else {
            Log.Error("Unattended Execution requires a valid Userid & Password. The Userid received was null or blank.");
            Runner.Stop(true);
        }
        
        if (password != null && password.length != 0) {
            credentials = "User Id="+userid+";Password="+password;
        } else {
            Log.Error("Unattended Execution requires a valid Userid & Password. The Password received was null or blank.");
            Runner.Stop(true);
        }
        
        break;
          Log.Error("Invalid Environment specified. Valid environment are: Dev, Test, QA, Unattended_Dev, Unattended_Test & Unattended_QA. Received '"+environment+"'.");
          Runner.Stop(true);
      default:
        break;
    }
    
    return credentials;
}

function setDataSourceAndCatalog(dbName, environment) {
  
    var dataSourceAndCatalog;
    switch (environment.toUpperCase()) {
      case "DEV":
      case "UNATTENDED_DEV":
          switch (dbName.toUpperCase()) {
              case "MDM":
                dataSourceAndCatalog = "Initial Catalog=MDMManufacturing;Data Source=iorper-sqld07.apac.ent.bhpbilliton.net";
                break;
              case "DM":
                dataSourceAndCatalog = "Initial Catalog=DM_WAIO_Port;Data Source=iorper-sqld07.apac.ent.bhpbilliton.net";
                break;
              case "RM":
                dataSourceAndCatalog = "Initial Catalog=ResourceManagement;Data Source=iorper-sqld07.apac.ent.bhpbilliton.net";
                break;
              case "PSS":
              case "lST":
              case "PST":
                dataSourceAndCatalog = "Initial Catalog=IOPSDBMessageDev;Data Source=IOPSVSQLDEV.apac.ent.bhpbilliton.net";
                break;
              case "RST":
                dataSourceAndCatalog = "Initial Catalog=RSTPublishDatabase;Data Source=IORPER-SQLD09.apac.ent.bhpbilliton.net";
                break;
              case "SOCR":
                dataSourceAndCatalog = "Initial Catalog=SOCr;Data Source=iorper-sqld07.apac.ent.bhpbilliton.net";
                break;
              default: 
                Log.Error("Invalid Test Database Name specified! Currently only MDM, DM, RM, PSS, PST, LST, RST & SOCR are available.  Received " + dbName + ".");
                Runner.Stop(true);
          }
          
          break;
      case "TEST": 
      case "UNATTENDED_TEST":
          switch (dbName.toUpperCase()) {
              case "MDM":
                dataSourceAndCatalog = "Initial Catalog=MDMManufacturing;Data Source=iorper-sqlt07.apac.ent.bhpbilliton.net";
                break;
              case "DM":
                dataSourceAndCatalog = "Initial Catalog=DM_WAIO_Port;Data Source=iorper-sqlt07.apac.ent.bhpbilliton.net";
                break;
              case "RM":
                dataSourceAndCatalog = "Initial Catalog=ResourceManagement;Data Source=iorper-sqlt07.apac.ent.bhpbilliton.net";
                break;
              case "PSS":
              case "lST":
              case "PST":
                dataSourceAndCatalog = "Initial Catalog=IOPSDBMessageTest;Data Source=IOPSVSQLTEST.apac.ent.bhpbilliton.net";
                break;
              case "RST":
                dataSourceAndCatalog = "Initial Catalog=RSTPublishDatabase_BAU;Data Source=IORPER-SQLT09.apac.ent.bhpbilliton.net";
                break;
              case "SOCR":
                dataSourceAndCatalog = "Initial Catalog=SOCr;Data Source=iorper-sqlt07.apac.ent.bhpbilliton.net";
                break;
              default: 
                Log.Error("Invalid Test Database Name specified! Currently only MDM, DM, RM, PSS, PST, LST, RST & SOCR are available.  Received " + dbName + ".");
                Runner.Stop(true);
          }
          
          break;
      case "QA":
      case "UNATTENDED_QA":
          switch (dbName.toUpperCase()) {
              case "MDM":
                dataSourceAndCatalog = "Initial Catalog=MDMManufacturing;Data Source=agsqlcls05Q01L.apac.ent.bhpbilliton.net";
                break;
              case "DM":
                dataSourceAndCatalog = "Initial Catalog=DM_WAIO_Port;Data Source=agsqlcls05Q01L.apac.ent.bhpbilliton.net";
                break;
              case "RM":
                dataSourceAndCatalog = "Initial Catalog=ResourceManagement;Data Source=agsqlcls05Q01L.apac.ent.bhpbilliton.net";
                break;
              case "PSS":
              case "lST":
              case "PST":
                dataSourceAndCatalog = "Initial Catalog=IOPSDBMessageQA;Data Source=IOPSAGL_Q1.apac.ent.bhpbilliton.net";
                break;
              case "RST":
                dataSourceAndCatalog = "Initial Catalog=RSTPublishDatabase_BAU;Data Source=IORPER-SQC07N01.apac.ent.bhpbilliton.net";
                break;
              case "SOCR":
                dataSourceAndCatalog = "to be advised";
                break;
              default: 
                Log.Error("Invalid Test Database Name specified! Currently only MDM, DM, RM, PSS, PST, LST, RST & SOCR are available.  Received " + dbName + ".");
                Runner.Stop(true);
          }
          
          break;
      default:
        Log.Error("Invalid Environment specified. Valid environment are: Dev, Test, QA, Unattended_Dev, Unattended_Test & Unattended_QA. Received '"+environment+"'.");
        Runner.Stop(true);
    }
    
    return dataSourceAndCatalog;
}

function constructConnectionString(dbName, environment, userid, password) {
  
    var connectionString = "Provider=SQLOLEDB.1;Persist Security Info=False";  
    return connectionString + ";" + setDataSourceAndCatalog(dbName, environment) + ";" + setConnectionCredentials(environment, userid, password);
}

module.exports.executeSQLCommand = function(aConnection, sqlCom) {
  
    var sqlCommand;
    var resultSet;
    
    try {
    
      sqlCommand = ADO.CreateCommand();
      sqlCommand.ActiveConnection = aConnection;
      sqlCommand.commandType = adCmdText;
      sqlCommand.commandText = sqlCom;
      resultSet = sqlCommand.Execute();
      
    } catch (sqlError) {
       sqlCommand.Close;
       Log.Error("Sql Error executing script.  Error: " + sqlError.message + ".");
       Runner.Stop(true);
    }
     
    return resultSet;
}

module.exports.executeSQLQuery = function(connectionString, sqlQuery) {
  
    var sqlCommand;
    var resultSet;
    
    try {
    
      sqlCommand = ADO.CreateADOQuery();
      sqlCommand.ConnectionString = connectionString;
      sqlCommand.SQL = sqlQuery;
      sqlCommand.Open();
      sqlCommand.First();
      while (!sqlCommand.EOF) {
          sqlCommand.Next();
      }
      
    } catch (sqlError) {
       sqlCommand.Close;
       Log.Error("Sql Error executing script.  Error: " + sqlError.message + ".");
       Runner.Stop(true);
    }
     
    return sqlCommand;
}

module.exports.executeStoredProc = function(connectionString, procName, parameters) {
  
    var SProc = ADO.CreateADOStoredProc();
    SProc.ConnectionString = connectionString;
    SProc.ProcedureName = procName;
    SProc.CommandTimeout = 5;
    var counter = 0;
    
    //Add the Return parameter
    SProc.Parameters.AddParameter();
    SProc.Parameters.Items(counter).name = 'return_value';
    SProc.Parameters.Items(counter).DataType = adInteger;
    SProc.Parameters.Items(counter).Direction = adParamReturnValue;
    SProc.Parameters.Items(counter).Value = null;
    
    //Add the input parameters
    for (var key in parameters) {
        counter++;
        SProc.Parameters.AddParameter();
        SProc.Parameters.Items(counter).name = key;
        SProc.Parameters.Items(counter).value = parameters[key];
    }
    
    //Add the output parameter
    counter++;
    SProc.Parameters.AddParameter();
    SProc.Parameters.Items(counter).name = 'messageIdResult';
    SProc.Parameters.Items(counter).DataType = adInteger;
    SProc.Parameters.Items(counter).Direction = pdOutput;
    SProc.Parameters.Items(counter).Value = null;
    
    SProc.ExecProc();
    var returnId = SProc.FieldByName('messageIdResult').Value;
    
    return returnId;
}

module.exports.runStoredProcedure = function(connString, psStoredProcedure) {
  
   try {

      lResult = 0;
      var adDate = 7;
      var oConn = getActiveXObject('ADODB.Connection');
     
      oConn.ConnectionString = connString;
      oConn.ConnectionTimeout = 0;     
      oConn.Mode = adModeShareExclusive;
      oConn.Open;
  
      //create and execute the stored procedure command object
      //oCmdSP = getActiveXObject("ADODB.Command");
      oCmdSP = ADO.CreateCommand();
      oCmdSP.ActiveConnection = oConn;         
      oCmdSP.CommandType = adCmdStoredProc;
      oCmdSP.CommandText = psStoredProcedure;
      oCmdSP.Execute();
      lResult = 1; 
   }
   catch (e) {
      Log.Error("Sql Error executing script.  Error: " + e.message + ".");
      Runner.Stop(true);
   }
  
   if (oConn){
      oConn.Close;
      oConn = null;
      oCmdSP = null;
   }  
   return lResult;
}

function RunStoredProcedure(psStoredProcedure, pdData, sDSN, sUser, sPassword) {
  
   try {

      lResult = 0;
      var adDate = 7;
      var oConn = new ActiveXObject('ADODB.Connection');
  
  if (aqEnvironment.GetWinMajorVersion() == 5) // 5 == XP
         var sConnStr = "Driver={Microsoft ODBC for Oracle};CONNECTSTRING="+sDSN+";uid="+sUser+";pwd="+sPassword+";"; 
  else // 6 = W7
   sConnStr =  "Provider=OraOLEDB.Oracle;Data Source="+sDSN+";User ID="+sUser+";Password="+sPassword+";";
     
  oConn.ConnectionString = sConnStr;
      oConn.ConnectionTimeout = 0;     
      oConn.Mode = adModeShareExclusive;
      oConn.Open;
  
      //create and execute the stored procedure command object
      oCmdSP = new ActiveXObject("ADODB.Command");
      oCmdSP.ActiveConnection = oConn;         
      oCmdSP.CommandType = adCmdStoredProc;
      oCmdSP.CommandText = psStoredProcedure;
      if (pdData !== undefined ) { 
         if (pdData.Exists("RunDate") && pdData.Item("RunDate") !== undefined && pdData.Item("RunDate") !== null) {
            oParmSP = oCmdSP.CreateParameter ("dDateParm", adDate, adParamInput);
            oParmSP.value = pdData.Item("RunDate")
            oCmdSP.Parameters.Append(oParmSP);
         }   
      }
      oCmdSP.Execute();
      lResult = 1; 
   }
   catch (e) {
      DLI_WriteLog (gsLogFile, "Error", sMyName + ', ' + e.description);
      lResult = 0;
   }
  
   if (oConn){
      oConn.Close;
      oConn = null;
      oCmdSP = null;
   }  
   return lResult;
} //RunStoredProcedure