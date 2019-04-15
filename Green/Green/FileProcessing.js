//File Processing Functions
//-------------------------
//
module.exports.getTempFolder = function() {
    return returnTempFolderPath();
}

function returnTempFolderPath() {
    var tempFolder = Project.Path + "Stores\\Files\\Temp\\";
    if (!aqFileSystem.Exists(tempFolder)) {
        aqFileSystem.CreateFolder(tempFolder);
    }
    
    return tempFolder;
}

function CreateExpectedTargetXmlFile(fileName){

    var res = aqFile.WriteToTextFile(returnTempFolderPath() + fileName + "_updated.xml", ProjectSuite.Variables.originalXml, aqFile.ctANSI, true);  
}

function copyXmlFileToTempFile(fileNameFrom, fileNameTo) {
  
     var fullSourceFilename = Project.Path + "Stores\\Files\\" + fileNameFrom+ ".xml";
     var fromFileContent = aqFile.ReadWholeTextFile(aqConvert.VarToStr(fullSourceFilename), aqFile.ctUTF8);
     writeDataToFile(fileNameTo, fromFileContent);
}

function updatePlaceholderInFile(fileName, placeHolder, newValue) {
  
    var content = aqFile.ReadWholeTextFile(returnTempFolderPath() + fileName + ".xml", aqFile.ctUTF8);
    content = content.replace(placeHolder, newValue);
    writeDataToFile(fileName, content);
}

function writeDataToFile(fileName, data) {
  
    var pathAndName = returnTempFolderPath() + fileName + ".xml";
    aqFile.Delete(pathAndName);
    
    if (aqFile.Create(pathAndName) == 0) {
        aqFile.WriteToTextFile(returnTempFolderPath() + fileName + ".xml", data, aqFile.ctANSI);
        Log.Message("The file '"+ fileName +"' was created and the specified text was written to it successfully.");
    } else {
        Log.Error("The file '"+ fileName +"' was not created."); 
    }
}

function writeContentToFile(fileName, content, extension) {
  
    var pathAndName = returnTempFolderPath() + fileName + "." + extension;
    aqFile.Delete(pathAndName);
    
    if (aqFile.Create(pathAndName) == 0) {
        aqFile.WriteToTextFile(returnTempFolderPath() + fileName + "." + extension, content, aqFile.ctANSI);
        Log.Message("The file '"+ fileName + "." + extension + "' was created and the specified text was written to it successfully.");
    } else {
        Log.Error("The file '"+ fileName + "." + extension + "' was not created."); 
    }
}

module.exports.writeToFile = function(fileName, data) {
    
    writeDataToFile(fileName,data);
}

module.exports.updateExistingFile = function(filePath, fileName, content, extension) {
  
    var pathAndName = filePath + fileName + "." + extension;
    aqFile.Delete(pathAndName);
    
    if (aqFile.Create(pathAndName) == 0) {
        aqFile.WriteToTextFile(filePath + fileName + "." + extension, content, aqFile.ctANSI);
        Log.Message("The file '"+ fileName + "." + extension + "' was updated successfully.");
    } else {
        Log.Error("The file '"+ fileName + "." + extension + "' was not created."); 
    }
}

module.exports.writeToFileWithExtension = function(fileName, content, extension) {
  
    writeContentToFile(fileName, content, extension);
}

module.exports.readPayloadFile = function(fileName)
{
    return aqFile.ReadWholeTextFile(returnTempFolderPath() + fileName + ".xml", aqFile.ctUTF8);
}

module.exports.readFromFile = function(fullFileName) {
    return aqFile.ReadWholeTextFile(fullFileName, aqFile.ctUTF8);
}

function compareFileContent(expectedFileName, actualFileName) {
    
    var fileName = returnTempFolderPath() + expectedFileName + ".xml";
    var file1Content = aqFile.ReadWholeTextFile(aqConvert.VarToStr(fileName), aqFile.ctUTF8);
    file1Content = file1Content.replace("undefined", "");
    fileName = returnTempFolderPath() + actualFileName + ".xml";
    var file2Content = aqFile.ReadWholeTextFile(aqConvert.VarToStr(fileName), aqFile.ctUTF8);
    file2Content = file2Content.replace("undefined", "");
    
    if (file1Content.localeCompare(file2Content) != 0) {
         Log.Error("Expected Payload Data in File '" + expectedFileName + "' does not equal Actual Payload Data in File '" + actualFileName + "'.");
         Runner.Stop(true);
    }
}

function deleteTempFiles() {
    var sPath;
    sPath = returnTempFolderPath() + "*";
    aqFile.Delete(sPath);
}
