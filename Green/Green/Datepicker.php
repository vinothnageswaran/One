<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>jQuery UI Datepicker - Default functionality</title>
<link rel="stylesheet"
	href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
<link rel="stylesheet" href="/resources/demos/style.css">
<script src="https://code.jquery.com/jquery-1.12.4.js"></script>
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
<script>
  $( function() {
    $( "#datepicker" ).datepicker();
	
  } );
  </script>
</head>
<body>



	<Form Name="form1" Method="GET" ACTION="Testsummary.php">



		<style>
.title {
	background-color: tomato;
	color: white;
	padding: 10px;
	tab1
	{
	padding-left
	:
	4em;
}

tab2 {
	padding-left: 8em;
}

tab3 {
	padding-left: 20em;
}

}
.button {
	border: none;
	background: #3a7999;
	color: #f2f2f2;
	padding: 10px;
	font-size: 18px;
	border-radius: 5px;
	position: relative;
	box-sizing: border-box;
	transition: all 50000ms ease;
}
</style>
		<h2 class="title">PSS Test Automation Summary Report</h2>
<?php
$link_address1 = 'csv2sql.php';
echo str_repeat('&nbsp;', 450);
echo "<a class='fixed' href='" . $link_address1 . "' data-toggle'tooltip' title='Macros modifies column P date format to yyyy-mm-dd hh:mm:ss and place the CSV file in to default folder C:/temp/qmtoreport.csv'>Admin</a>";

?>


<p>
			Date<input type="text" VALUE="" name="datepicker1" id="datepicker"
				required>
		</p>


		<br> <br> <br> <br> <br> <br> <br> <br> <br> <br>

		<div style="position: relative;">


			<br> <br> <br>


			<div class="col-xs-3">

				<div style="position: relative;">

					<div class="wrapper">

						<div style="position: absolute; top: 0; right: 10;">
							<INPUT class="button" TYPE="Submit" VALUE="Generate Report" />
						</div>

					</div>

				</div>
	
	</FORM>



	<br>
	<br>
	<br>



	<br>

	<br>
	<br>
	<br>


</body>
</html>



