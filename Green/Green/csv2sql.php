<html>
<head>
<title> csv2 sql</title>
<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
</head>
<body>
<br>
<h1> Admin console for Generating Summary Report </h1>
<p> Please upload the CSV file</p>

</br>

<style>

a.fixed {

position: fixed;

right: 0;

top: 0;

width: 260px;



}


</style>





<form class="form-horizontal"method="post">
   
	<div class="form-group">
        <label for="csvfile" class="control-label col-xs-2">Name of the file</label>
		<div class="col-xs-3">
        <input type="name" class="form-control" value="C:/Temp/PSS.csv" name="csv" id="csv" required>
		</div>
		eg. C:/temp/PSS.csv
    </div>
	<div class="form-group">
	<label for="login" class="control-label col-xs-2"></label>
    <div class="col-xs-3">
    <button type="submit" class="btn btn-primary">Upload</button>
	</div>
	</div>
</form>
</div>

</body>

<?php 

error_reporting(0);

$link_address1 = 'Datepicker.php';
echo "<a class='fixed' href='".$link_address1."'>Home</a>";
			
			
$sqlname='localhost';
$username='root';
$table='PSSAUTO';
$password='';

/**

if(isset($_POST['password']))
{
$password=$_POST['password'];
}
else
{
$password= '';
}

**/
$db='PSS';


$file=$_POST['csv'];

//Terminate code when CSV file is empty

if ($file== null)
exit("");




$cons= mysqli_connect("$sqlname", "$username","$password","$db") or die(mysql_error());
//$result1=mysqli_query($cons,"select count(*) count from $table");
//$r1=mysqli_fetch_array($result1);
//$count1=(int)$r1['count'];
//If the fields in CSV are not seperated by comma(,)  replace comma(,) in the below query with that  delimiting character 
//If each tuple in CSV are not seperated by new line.  replace \n in the below query  the delimiting character which seperates two tuples in csv
// for more information about the query http://dev.mysql.com/doc/refman/5.1/en/load-data.html

//Delete all rows before uploading the data

//$delete = "delete from PSSAUTO";



//mysqli_query($cons,"$delete") or die(mysqli_error($cons));

//echo "<br>Cleaning up tables </br>";

mysqli_query($cons, '
    LOAD DATA INFILE "'.$file.'"
        REPLACE INTO TABLE '.$table.'
        FIELDS TERMINATED by \',\'
        LINES TERMINATED BY \'\r\n\'
		
');

//delete empty rows if there are any

//$deleteemptyrows="delete from PSSAUTO where OwnerCodeEvent=''";
//mysqli_query($cons,"$deleteemptyrows") or die(mysqli_error($cons));

//display number of records updated in the daabase

$result2=mysqli_query($cons,"select count(*) count from $table");
$r2=mysqli_fetch_array($result2);
$count2=$r2['count'];

//$count=$count2-$count1;
if($count2>0)
echo "Success";
echo "<b> total $count2 records have been added </b> ";

echo "<script>
    function capture() {    

     //your js code here

     }
   </script>";  

?>



</html>