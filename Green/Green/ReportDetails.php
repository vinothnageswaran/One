<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Search</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="style.css"/>
	
	<meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>jQuery UI Datepicker - Default functionality</title>
  <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
  <link rel="stylesheet" href="/resources/demos/style.css">
  <script src="https://code.jquery.com/jquery-1.12.4.js"></script>
  <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
  
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
<link href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css" rel="stylesheet" />
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js"></script>
 <script type="text/javascript" src="Psstable.js"></script>


</head>
<body>
<title>Bootstrap Example</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
  
  <link rel="stylesheet" type="text/css" href="extensions/filter-control/bootstrap-table-filter-control.css">
<script src="extensions/filter-control/bootstrap-table-filter-control.js"></script>
</head>
<body>
<style>
.city {
    background-color: tomato;
    color: white;
    padding: 10px;
	tab1 { padding-left: 4em; }
    tab2 { padding-left: 8em; }
    tab3 { padding-left: 20em; }
	
	
	
} 
</style>
<h2 class="city">PSS summary report</h2>


  <table style="width:10%">
  <tr>
  </tr>
  </table>
 <html>
<body>

<style>
<?php include 'Report.css'; ?>
</style>


<?php
$servername = "localhost";
$username = "root";
$password = "";
$database = "PSS";

echo "\t" ;
echo "\t" ;
echo "\t" ;
echo "\t" ;


session_start();



// Create connection			

$conn = mysqli_connect($servername, $username, $password, $database);
// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
   mysqli_select_db($conn,$database) or die(mysql_error());
  			
			//$ReverseStartdate = $_GET["datepicker1"];
			//$startdate=date("Y-m-d", strtotime($ReverseStartdate) );
			//$startdate ='2018-11-29';
			
		$startdate = $_GET['compna']; 
		//$startdate = $_SESSION["execdate"];
		
		$query1 = "SELECT TestCase,Status,Executiondate, TIME(Starttime) as Stime , TIME(Endtime) as Etime , Errormessage FROM PSSAUTO where Executiondate='$startdate' order by Executiontime";
			 $TestSummary = "Select count(Testcase) as Testcasecount , COUNT(IF(status='PASS',1, NULL)) 'PASS', COUNT(IF(status='FAIL',1, NULL)) 'FAIL' 
		
			from PSSAUTO where Executiondate='$startdate'";
		
			
			
			
			
			$timestamp = strtotime($startdate);
			$day = date('l', $timestamp);
			$formattedDate = date('F d, Y', $timestamp);
			
			
			$link_admin = 'csv2sql.php';
			$link_datepicker = 'Datepicker.php';
			$link_Clinicssummary= 'Clinicsummary.php';
			
			
			
			 echo "<div class='col-xl-12'>
			 <table class='table table-hover table-sm table-responsive  table-warning'>
			  <tr>
			<div class='container'>
			<div class='row'>
			<th>Tests Executed on $formattedDate </th>
			<th>$day</th>
			
			</tr>";
			
			
			echo "<br>";
			//links
	
			
			echo "<a href='".$link_datepicker."'>Home</a>";		
			echo str_repeat('&nbsp;', 5); 
		//	echo "<a href='".$link_Clinicssummary."'>Clinics Summary</a>";
		//	echo str_repeat('&nbsp;', 5); 
			echo "<a href='".$link_admin."'>Admin</a>";
	
			
             $raw_results = mysqli_query($conn,"$query1") or die(mysqli_error($conn)); 
			 $raw_results1 = mysqli_query($conn,"$TestSummary") or die(mysqli_error($conn)); 
			
			 //Column headers
			 
			 echo "<div class='col-xl-12'>
			 
			 	
			 
			 <table id ='Reports' class='table table-hover table-bordered  table-sm'>
			  <thead>
			<tr>
			<th class='th-sm'>Sno</th>
			<th>Test case</th>
			<th>Status</th>
		

			<th>Test Duration in HH:MM:SS</th>
			<th>Remarks</th>
			<th>Reason for failure</th>
			
			</thead>
			</div>
			</tr>";
			
			
		$sno=0;
				
					
		while($results = mysqli_fetch_assoc($raw_results)){
			
			$sno++;
			echo "<tr>";
			echo"<td>$sno</td>";
			echo "<td>".$results['TestCase']."</td>";
			
				if($results['Status']=='PASS') // 
         echo "<td style='background-color: #f0f8ff;'>".$results['Status']."</td>"; 
		else   if($results['Status']=='FAIL')// 
         echo "<td style='background-color: #FF0000;'>".$results['Status']."</td>"; 
			
			//echo "<td>".$results['Status']." </td>";
			//echo "<td>".$results['Appointmentdate']."</td>";
			//echo "<td>".$results['Executiondate']." </td>";
			//echo "<td>".$results['Executiontime']."</td>";
			//echo "<td>".$results['Stime']."</td>";
			//echo "<td>".$results['Etime']."</td>";
			
			
			
			
			$S_time = strtotime($results['Stime']);
			$E_time = strtotime($results['Etime']);
			$Testdurationinsec= $E_time - $S_time;
			$Testduration= gmdate("H:i:s", $Testdurationinsec);
			
			echo "<td>$Testduration</td>";
			$Remarks= ($Testdurationinsec >180)? 'More than 3 minutes' : '';
			
			echo "<td>$Remarks</td>";
			
			echo "<td>".$results['Errormessage']."</td>";
		
			
			
			
  
  
  
			
			}
						
			while($results1 = mysqli_fetch_assoc($raw_results1)){
			//echo "<td>".$results1['TestCasecount']."</td>";
			
			
			echo "<tr>";
			echo " </tr>";
			
			echo"<td></td>";
			echo"<td>
			<span style='font-weight:bold'>Total PASS</span><br></td>" ; 
			"<br></br>";
			echo "<td><span style='font-weight:bold'>".$results1['PASS']."</span></td>";
			
			echo "<tr>";
			
			echo"<td></td>";
			echo"<td>
			<span style='font-weight:bold'>Total FAIL</span><br></td>" ; 
			"<br></br>";
			echo "<td><span style='font-weight:bold'>".$results1['FAIL']."</span></td>";
			echo " </tr>";
			
			//echo"<td></td>";
			
			$GrandTotal= $results1['PASS'] + $results1['FAIL'];
			
			echo "<tr>";
			
			echo"<td></td>";
			
			echo"<td>
			<span style='font-weight:bold'>Grand Total</span><br></td>" ; 
			"<br></br>";
			echo "<td><span style='font-weight:bold'>$GrandTotal</span></td>";
			
			echo " </tr>";
			
			
			
		}
		
		

         

?>
</body>
</html>