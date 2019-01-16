<?php
include('db.php');

$list=$_POST['list'];
$filter=$_POST['filter'];

//PV should run new query when a filter is active

$db = new db();
$data = $db->getTypeaheadList($filter,$list);

header('Content-Type: application/json');
echo json_encode($data);
