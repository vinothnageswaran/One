
function mapTemporaryZDrive(){
 
    Sys.OleObject("WScript.Shell").Exec("cmd /c 'PushD \\PER0DSOC02\BHP.SOCr.MessageProducer'") 
}

function disconnectTemporaryZDrive(){
 
    Sys.OleObject("WScript.Shell").Exec("cmd /c 'PopD'") 
}