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
  <script>
  $( function() {
    $( "#datepicker" ).datepicker();
	
  } );
  </script>
  
</head>
<body>
<title>Bootstrap Example</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
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
<h2 class="city">PSS - Test Automation Summary Report</h2>
  <table style="width:10%">
  <tr>
  </tr>
  </table>
  
  <style>
a.fixed {
position: fixed;
right: 0;
top: 100;
width: 260px;
}
</style>

  
  <html>
<body>
<?php
$servername = "localhost";
$username = "root";
$password = "";
$database = "PSS";




echo "\t" ;
echo "\t" ;
echo "\t" ;
echo "\t" ;

// Create connection
$conn = mysqli_connect($servername, $username, $password, $database);
// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
   mysqli_select_db($conn,$database) or die(mysql_error());
   
  
            $query1 = "SELECT * FROM PSSAUTO";
			//$query2 = "SELECT Clinics ,COUNT('CLINICS') AS COUNT FROM QM GROUP BY CLINICS;";
			
			$ReverseStartdate = $_GET["datepicker1"];
			$startdate=date("Y-m-d", strtotime($ReverseStartdate) );
			//$startdate ='2018-10-24';
			$timestamp = strtotime($startdate);
			$formattedDate = date('F d, Y', $timestamp);
			
			
			
			$day = date('l', $timestamp);
			
			
			
			
			
			$link_admin = 'csv2sql.php';
			$link_datepicker = 'Datepicker.php';
			
			echo "<div class='col-xl-8'>
			 
			
			 <table class='table table-hover table-sm table-responsive  table-warning'>
			  
			<tr>
			
			<div class='container'>
			<div class='row'>
				
				
				
			<th>$formattedDate </th>
			<th>$day</th>
			
			</tr>";

			
			echo "<a href='".$link_datepicker."'>Home</a>";
			echo str_repeat('&nbsp;', 5); 
			//echo "<a href='Reportdetails.php'>Reportdetails</a>";
			echo str_repeat('&nbsp;', 5); 
			echo "<a class='top-right' href='".$link_admin."'>Admin</a>";
			
			"<td></td>";
			
			
			session_start();
			$_SESSION["date"] = $startdate;
			
			
			 echo "<div class='col-xs-4	'>
			 <table class='table table-hover table-bordered'>
			  <thead >
			<tr>
			<th>Date</th>
			<th>Day</th>
			<th>Total Test cases</th>
			<th>Total Passed</th>
			
			<th>Total Failed</th>
			<th>Test started</th>
			<th>Test stopped</th>
			<th>Test Duration in HH:MM:SS</th>
			
			</div>
			</tr>";
			
			
			
		//To display fortnightly
		
		for($i=0;$i<=14;$i++)
			
			{
				
				
		
		
		$TestSummaryquery = "Select Executiondate , count(Testcase) as Testcase , COUNT(IF(status='PASS',1, NULL)) 'PASS', COUNT(IF(status='FAIL',1, NULL)) 'FAIL' 
		
		from PSSAUTO where Executiondate='$startdate'";
		
		$Percentagequery =" select concat(round(( 'PASS'/Testcase * 100 ),2),'%') AS percentage from PSSAUTO";
		
		$Testduration = "SELECT TestCase,Status,Executiondate, min(TIME(Starttime)) as Stime , max(TIME(Endtime)) as Etime FROM PSSAUTO where Executiondate='$startdate'";
		//$Duration = "Select max(Stime) as mStime, min(Etime) as mEtime from PSSAUTO";
			
		
		
			
             $raw_results = mysqli_query($conn,"$TestSummaryquery") or die(mysqli_error($conn)); 
			 $raw_results1 = mysqli_query($conn,"$Percentagequery") or die(mysqli_error($conn)); 
			 $raw_results2 = mysqli_query($conn,"$Testduration") or die(mysqli_error($conn)); 
		
			
			 
			 $timestamp = strtotime($startdate);
			$formattedDate = date('F d, Y', $timestamp);
			
			
			$day = date('l', $timestamp);
			
		
			while($results2 = mysqli_fetch_assoc($raw_results2)){
			while($results1 = mysqli_fetch_assoc($raw_results1)){
            while($results = mysqli_fetch_assoc($raw_results)){
			echo "<tr>";
			 
			 
			
		
			
			if ($results['Testcase'] !=0)
			{
					
				
			//echo "<td><a href="Reportdetails.php>.$results['Executiondate']</a></td>";
			
			//<td><a href="<?php echo $results['Executiondate'];">Click Me</a></td>
			//echo "<td><a href="Reportdetails.php>Date</a></td>";
			
			$edate=$results['Executiondate'];
			
			//echo $edate;
			
			$_SESSION["execdate"] = $edate;
			
			//echo "<td>".$results['Executiondate']."</td>";
			//echo "<td><a href='Reportdetails.php'>$edate</a></td>";
			
			echo "<td><a href=Reportdetails.php?compna=",urlencode($edate),">$edate</a></td>";
			
			
			//echo "<td><a href='Reportdetails.php?eedate='.urlencode($$edate).'"'>$edate</a></td>";
			
			
			
			echo "<td>".$day."</td>";
			
			echo "<td>".$results['Testcase']."</td>";
			echo "<td>".$results['PASS']." </td>";
			echo "<td>".$results['FAIL']." </td>";
			echo "<td>".$results2['Stime']." </td>";
			echo "<td>".$results2['Etime']." </td>";
			//echo "<td>".$results1['percentage']." </td>";
			
			$S_time = strtotime($results2['Stime']);
			$E_time = strtotime($results2['Etime']);
			$Duration= $E_time - $S_time;
			$Duration= gmdate("H:i:s", $Duration);
			
			echo "<td>$Duration</td>";
			
			$data[]=$results;
					  
			  
			   echo "</tr>";
			}
			
		
			
}
			}
			}
			
			
			
			$date = date_create($startdate);
			date_sub($date, date_interval_create_from_date_string('1 days'));
			//echo date_format($date, 'Y-m-d');
			$startdate=date_format($date, 'Y-m-d');
			
			
			
		
			
			}
			 
			
			
			
			
			
		
			
		
				
				
?>

</body>
</html>