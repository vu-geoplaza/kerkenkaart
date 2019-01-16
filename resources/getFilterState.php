<?php
include('db.php');

$filter=$_POST['filter'];

//PV should run new query when a filter is active

$db = new db();
$data = $db->getFilterState($filter);

header('Content-Type: application/json');
echo json_encode($data);
