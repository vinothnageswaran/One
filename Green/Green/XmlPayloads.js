//XML Payload functions
//---------------------
//
var FileProcessing = require("FileProcessing");
var Common = require("Common");

function DeleteElements(elementName){

    var originalXml = ProjectSuite.Variables.originalXml;
    if(elementName != null){
        originalXml = originalXml.replace(new RegExp(elementName, 'gi'), "");
    }else{
        Log.Message("No source elements found, Check xml!");
    }
  
    ProjectSuite.Variables.originalXml = originalXml; 
}

//Replace XML elements to make source and destination XMLs identical to compare the files
function ReplaceElements(elementName, replaceWith){
  
    var originalXml = ProjectSuite.Variables.originalXml;
  
    if(elementName != null){
        originalXml = originalXml.replace(new RegExp(elementName, 'gi'), replaceWith);
    }else{
        Log.Message("No source elements found, Check xml!");
    }
  
    ProjectSuite.Variables.originalXml = originalXml;
}

function MergeElements(element){
  
    var originalXml = ProjectSuite.Variables.originalXml;
    if(element != null){
        originalXml = element + "\r" + originalXml;
    }else{
        Log.Message("No source elements found, Check xml!");
    }
  
    ProjectSuite.Variables.originalXml = originalXml;
}

module.exports.executeSQLToExtractPayload = function(connectionString, sqlQuery) {
  
    var sqlCommand;
    var resultSet;
    var payLoad = "";
    
    try {
      sqlCommand = ADO.CreateADOQuery();
      sqlCommand.ConnectionString = connectionString;
      sqlCommand.CommandTimeout = 300;
      sqlCommand.SQL = sqlQuery;
      sqlCommand.Open();
      sqlCommand.First();

      while (!sqlCommand.EOF) {
          Log.Message("MessageId: " + sqlCommand.FieldByName("MessageId").Value + 
          " | MessagePayLoad : " + sqlCommand.FieldByName("MessagePayload").Value);
          payLoad = payLoad + sqlCommand.FieldByName("MessagePayload").Value;
          sqlCommand.Next();
      };
      sqlCommand.Close();
      Delay(500);
            
    } catch (sqlError) {
       Log.Error("Sql Error executing script.  Error: " + sqlError + ".");
       Runner.Stop(true);
    }
     
    return payLoad;
}

function performUpdateActionOnPayload(payLoad, action, data, replaceWithData) {
  
    var updatedPayload = payLoad;
    
    switch (action.toUpperCase()) {
      case "REPLACE":
          updatedPayload = updatedPayload.replace(new RegExp(data, 'g'), replaceWithData);
          break;
      case "STRIPNODE":
          updatedPayload = stripNodeFromXML(updatedPayload, data);
          break;
      case "STRIPNODEVALUE":
          updatedPayload = stripNodeDataFromXML(updatedPayload, data);
          break;
      default: {
          Log.Error("Invalid Cleanup Action Specified! Currently only Replace, StripNode & StripNodeValue are available.  Received " + action + ".");
          Runner.Stop(true);
      }
    }
    
    return updatedPayload;
}

function removeDynamicDataFromExpectedPayload(payLoad, action, data, replaceWithData) {
    
    ProjectSuite.Variables.expectedCleanedXml = performUpdateActionOnPayload(payLoad, action, data, replaceWithData);
}

function removeDynamicDataFromActualPayload(payLoad, action, data, replaceWithData) {
    
    ProjectSuite.Variables.actualCleanedXml = performUpdateActionOnPayload(payLoad, action, data, replaceWithData);
}

function compareXmlContent(expectedPayload, actualPayload) {
    
    var expectedContent = expectedPayload.replace("undefined", "");
    expectedContent = expectedContent.replace(/\>\s+\</g, '><');

    var actualContent = actualPayload.replace("undefined", "");
    actualContent = actualContent.replace(/[\n\r]/g, '');
    
    if (expectedContent.localeCompare(actualContent) != 0) {
         Log.Error("Expected Payload Data does not equal Actual Payload Data");
         
         var expectedPayloadFilename = "expected_TargetPayload_cleanedUp";
         FileProcessing.writeToFile(expectedPayloadFilename, expectedContent);
         var actualPayloadFilename = "actual_TargetPayload_cleanedUp";
         FileProcessing.writeToFile(actualPayloadFilename, actualContent);         
    }
}

function removeDynamicDataFromPayload(payLoadFile, action, data, replaceWithData) {
  
    var payload = "";
    
    if (ProjectSuite.Variables.payloadXml.length == 0) {
        payLoadFile = FileProcessing.getTempFolder() + payLoadFile + ".xml";
        payload = aqFile.ReadWholeTextFile(aqConvert.VarToStr(payLoadFile), aqFile.ctUTF8);
        ProjectSuite.Variables.payloadXml = payload;     
    }
    
    var payload = ProjectSuite.Variables.payloadXml;
   
    switch (action.toUpperCase()) {
      case "REPLACE":
          payload = payload.replace(new RegExp(data, 'g'), replaceWithData);
          break;
      case "STRIPNODE":
          payload = stripNodeFromXML(payload, data);
          break;
      case "STRIPNODEVALUE":
          payload = stripNodeDataFromXML(payload, data);
          break;
      default: {
          Log.Error("Invalid Cleanup Action Specified! Currently only Replace, StripNode & StripNodeValue are available.  Received " + action + ".");
          Runner.Stop(true);
      }
    }
    
    ProjectSuite.Variables.payloadXml = payload;
}

function stripNodeFromXML(payload, nodeName) {
  
    var result = payload;
    var nextNodeOffset;
    var startNode = "<" + nodeName + ">";
    var endNode  = "</" + nodeName + ">";
    if (nodeName.indexOf(" ") > -1) {
        endNode = "</" + nodeName.substring(0, nodeName.indexOf(" ")) + ">";
    }
   
    var altEndNode = "/>";
    var endOffset = 0;
    var startOffset = payload.indexOf(startNode);
    var firstPart = payload;
    var lastPart = "";
    
    while (startOffset > -1) {
        firstPart = result.substring(0, startOffset); 
        nextNodeOffset = result.indexOf("<", startOffset + 1);
        altEndOffset = result.indexOf(altEndNode, startOffset);
        if (altEndOffset != -1 && altEndOffset < nextNodeOffset) {
            lastPart = result.substring(startOffset + startNode.length);
        } else { 
          endOffset = result.indexOf(endNode, startOffset);
          if (endOffset > -1) {
              endOffset = endOffset + endNode.length;
              lastPart = result.substring(endOffset);
          }
        }
        
        result = firstPart + lastPart;
        startOffset = result.indexOf(startNode);
    }
    
    return result;
}

function stripNodeDataFromXML(payload, nodeName) {
  
    var result = "";
    var startNode = "<" + nodeName + ">";
    var endNode  = "</" + nodeName + ">";
    var endOffset = 0;
    var startOffset = payload.indexOf(startNode);
    var firstPart = payload;
    var lastPart;
    
    if (startOffset > -1) {
        firstPart = payload.substring(0, startOffset + startNode.length);   
        endOffset = payload.indexOf(endNode, startOffset);
        if (endOffset > -1) {;
            lastPart = payload.substring(endOffset);
        }
    }
    
    return firstPart + lastPart;
}

function buildExpectedRstXml(identifier) {

    var fullSourceFilename = Project.Path + "Stores\\Files\\RM_RailJobList_RST_Template.txt";
    var xml =  aqFile.ReadWholeTextFile(aqConvert.VarToStr(fullSourceFilename), aqFile.ctUTF8);
    ProjectSuite.Variables.expectedXml = xml.replace("$$AGREEMENTVERSION$$", identifier);
}

function buildExpectedXml(fileNameFrom, placeHolder, newValue) {
  
     var fullSourceFilename = Project.Path + "Stores\\Files\\" + fileNameFrom+ ".xml";
     var fromFileContent = aqFile.ReadWholeTextFile(aqConvert.VarToStr(fullSourceFilename), aqFile.ctUTF8);
     ProjectSuite.Variables.expectedXml = fromFileContent.replace(placeHolder, newValue);
}

function addRepeatingGroup(sourcePayload, sourceNodeName, targetPayload, targetNodeName, repeatingGroup) {
  
    var updatedTargetPayload = targetPayload;
    var sourceStartNode = "<" + sourceNodeName + ">";
    var targetStartNode = "<" + targetNodeName + ">";
    var targetEndNode  = "</" + targetNodeName + ">";
    var count = (sourcePayload.match(new RegExp(sourceStartNode, 'gi')) || []).length;
    var repeatingGroupSet = "";
    var i;
    
    try {
        //Build the desired number of repeating groups
        if (count == 0) {
            throw ("There are no occurances of the sourceStartNode ("+sourceStartNode+") in the source Payload.");  
        }
        
        for (i=0; i< count; i++) {
            repeatingGroupSet = repeatingGroupSet + repeatingGroup;    
        }
    
        //Update the targetPayload with the repeating group set
        var targetStartOffset = targetPayload.indexOf(targetStartNode);
        if (targetStartOffset == -1) {
            throw ("Target Start Node (" + targetStartNode + ") does not exist in the target Payload.");
        }
    
        var targetEndOffset = targetPayload.indexOf(targetEndNode);
        if (targetEndOffset == -1) {
            throw ("Target End Node (" + targetEndNode + ") does not exist in the target Payload.");
        } else {
            targetEndOffset = targetEndOffset + targetEndNode.length;
        }
    
        updatedTargetPayload = targetPayload.substring(0, targetStartOffset)
                             + repeatingGroupSet
                             + targetPayload.substring(targetEndOffset);
    
    } catch (err) {
        Log.Error(err);
        Runner.Stop(true);
    }
    
    return updatedTargetPayload;
}

function multiUpdateRmPayloadTemplate(sourceNodeName, targetNodeName, repeatingGroup) {
  
    if (sourceNodeName != null && targetNodeName != null) {
        var originalXml = ProjectSuite.Variables.originalXml;
        var expectedXml = ProjectSuite.Variables.expectedXml;
    
        if (repeatingGroup != null) {
            ProjectSuite.Variables.expectedXml = addRepeatingGroup(originalXml, sourceNodeName, expectedXml, targetNodeName, repeatingGroup);
        } else {
            ProjectSuite.Variables.expectedXml = setMultiNodeValue(originalXml, sourceNodeName, expectedXml, targetNodeName);
        }
    }
}

function updateRmPayloadTemplate(sourceNodeName, targetNodeName) {
  
    if (sourceNodeName != null && targetNodeName != null) {
        var originalXml = ProjectSuite.Variables.originalXml;
        var expectedXml = ProjectSuite.Variables.expectedXml;
    
        ProjectSuite.Variables.expectedXml = updateNodeData(originalXml, sourceNodeName, expectedXml, targetNodeName);
    }
}

function translateMdmPayLoad(sourceNodeName, targetNodeName) {
    
    if (ProjectSuite.Variables.expectedXml.length == 0) {
        ProjectSuite.Variables.expectedXml = ProjectSuite.Variables.originalXml;
    }
    
    var expectedPayload = ProjectSuite.Variables.expectedXml;
    ProjectSuite.Variables.expectedXml = translateNode(expectedPayload, sourceNodeName, targetNodeName);
}

function setPayLoadToGlobalVariable(payloadFilename) {
  
    ProjectSuite.Variables.originalXml = FileProcessing.readPayloadFile(payloadFilename);
}

function setExpectedPayLoadToGlobalVariable(payloadFilename) {
  
    ProjectSuite.Variables.expectedXml = FileProcessing.readPayloadFile(payloadFilename);
}

function updateNodeData(sourceXmlString, sourceNodeName, targetXmlString, targetNodeName) {
  
    var nodeValue = getNodeValue(sourceXmlString, sourceNodeName);
    var resultXml = setNodeValue(targetXmlString, targetNodeName, nodeValue);
    if (resultXml.length == 0) {
        resultXml = targetXmlString;
    }
    
    return resultXml;
}

module.exports.updateXMLNode = function(sourceXmlString, sourceNodeName, targetXmlString, targetNodeName) {
    
    return updateNodeData(sourceXmlString, sourceNodeName, targetXmlString, targetNodeName);
}

function translateNode(xmlString, fromName, toName) {
  
    var resultString = xmlString;
    
    if (fromName != null && toName != null) {
        if (fromName.localeCompare(toName) != 0) {
            resultString = changeClosingNode(resultString, fromName, toName);
            resultString = resultString.replace (new RegExp('<' + fromName + '>', 'g'), '<' + toName + '>');
        }
    }
    
    return resultString;
}

function changeClosingNode(xmlString, nodeName, newNodeName) {
    
    var lastOffset = 0;
    var nodeFound = true;
    var newString = xmlString;
    while (nodeFound) {
        var nextOffset = newString.indexOf(nodeName, lastOffset);
        if (nextOffset > -1) {
            var newNodelbOff = newNodeName.indexOf("<");
            var actualCosingNewNodeName;
            if (newNodelbOff > -1) {
                actualClosingNewNodeName = "/" + newNodeName.substring(newNodelbOff+1);
            } else {
                actualClosingNewNodeName = "/" + newNodeName;
            }
        
            var lbOff = nodeName.indexOf("<");
            if (lbOff > -1) {
                var actualClosingNodeName = "/" + nodeName.substring(lbOff+1);  
                var endOff = newString.indexOf(actualClosingNodeName, lastOffset);
            } else {
                var actualClosingNodeName = "/" + nodeName;  
                var endOff = newString.indexOf(actualClosingNodeName, lastOffset);
            }
            
            newString = newString.substring(0, endOff) + actualClosingNewNodeName + newString.substring(endOff + actualClosingNodeName.length);
            lastOffset = nextOffset + 1;
        } else {
            nodeFound = false;
        }
    }
    
    return newString;
}

module.exports.translateXMLNode = function(xmlString, fromName, toName) {
  
    translateNode(xmlString, fromName, toName);
}

function getActualNodeNameOfCompoundNode(compoundNodeName) {
  
    var actualNodeName = compoundNodeName;
    var index = compoundNodeName.indexOf("<");
    if (index > -1) {
        actualNodeName = compoundNodeName.substring(index+1);
    }

    return actualNodeName;
}

function setMultiNodeValue(sourcePayload, sourceNodeName, targetPayload, targetNodeName) {
    
     var sourceStartNode = "<" + sourceNodeName + ">";
     var sourceEndNode  = "</" + getActualNodeNameOfCompoundNode(sourceNodeName) + ">";
     var targetStartNode = "<" + targetNodeName + ">";
     var targetEndNode  = "</" + getActualNodeNameOfCompoundNode(targetNodeName) + ">";
     var updatedPayload = targetPayload;
     var notFound = 0;
     
     //Get the Source Node Count - Assumption Source Node Count should equal the Target Node Count      
     var count = (sourcePayload.match(new RegExp(sourceStartNode, 'gi')) || []).length;
     
     //Loop through each found occurance
     var i;
     for (i = 0; i < count; i++) {
        //Get the Node Value - occurance i
        var j;
        var sourceStartIndex = 0;
        var taragetEndIndex = 0;
        var targetStartIndex = 0;
        var targetEndIndex = 0;
        try {
            for (j=0; j <= i; j++) {
                if (j == 0) {
                    sourceStartIndex = sourcePayload.indexOf(sourceStartNode, sourceStartIndex);        
                    targetStartIndex = updatedPayload.indexOf(targetStartNode, targetStartIndex);
                } else {
                    sourceStartIndex = sourcePayload.indexOf(sourceStartNode, sourceStartIndex + 1);
                    targetStartIndex = updatedPayload.indexOf(targetStartNode, targetStartIndex + 1);
                }
            
                if (sourceStartIndex == -1) {
                    throw ("Occurance " + (j+1) + " of source node '" + sourceNodeName + "' could not be found.");
                } else {
                    sourceStartIndex = sourceStartIndex + sourceStartNode.length;
                }
                
                if (targetStartIndex == -1) {
                    throw ("Occurance " + (j+1) + " of target node '" + targetNodeName + "' could not be found.");
                } else {
                    targetStartIndex = targetStartIndex + targetStartNode.length;
                }
                sourceEndIndex = sourcePayload.indexOf(sourceEndNode, sourceStartIndex);
                targetEndIndex =updatedPayload.indexOf(targetEndNode, targetStartIndex);
                
                if (sourceEndIndex == -1) {
                    throw ("Occurance " + (j+1) + " of source end node '" + sourceNodeName + "' could not be found.");
                }
                
                if (targetEndIndex == -1) {
                    throw ("Occurance " + (j+1) + " of target end node '" + targetNodeName + "' could not be found.");
                }
            }
        
            //Update the target Payload with the source payload data
            var sourceData = sourcePayload.substring(sourceStartIndex,sourceEndIndex);
            updatedPayload = updatedPayload.substring(0, targetStartIndex) + sourceData + updatedPayload.substring(targetEndIndex);
            
        } catch (err) {
            Log.Error(err);
            Runner.Stop(true);
        }
     }
     
     return updatedPayload;
}

function getNodeValue(payload, nodeName) {
  
    var result = "";
    var startNode = "<" + nodeName + ">";
    var endNode  = "</" +  getActualNodeNameOfCompoundNode(nodeName) + ">";
    var endOffset = 0;
    var startOffset = payload.indexOf(startNode);
    
    if (startOffset > -1) {
        startOffset = startOffset + startNode.length;
        endOffset = payload.indexOf(endNode, startOffset);
        if (endOffset > -1) {
            result = payload.substring(startOffset, endOffset);
        }
    }
    
    return result;
}

module.exports.getValueOfFirstNode = function(payload, nodeName) {
  
    return getNodeValue(payload, nodeName);
}

function setNodeValue(payload, nodeName, nodeValue) {
  
    var result = "";
    var startNode = "<" + nodeName + ">";
    var endNode  = "</" + nodeName + ">";
    var endOffset = 0;
    var startOffset = payload.indexOf(startNode);
    
    if (nodeName != null) {
        if (startOffset > -1) {
            startOffset = startOffset + startNode.length;
            endOffset = payload.indexOf(endNode, startOffset);
            if (endOffset > -1) {
                var part1 = payload.substring(0, startOffset);
                var part2 = payload.substring(endOffset);
                result = part1 + nodeValue + part2;
            } else {
                Log.Error("Could not find end node '" + nodeName + "' in payload");
                Runner.Stop(true);
            }
        } else {
            Log.Error("Could not find start node '" + nodeName + "' in payload");
            Runner.Stop(true);
        }
    }
    
    return result;
}
