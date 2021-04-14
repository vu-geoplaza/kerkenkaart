<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
include('db.php');
include('rowsToGeoJson.php');
$db = new db();

if (isset($_POST['filter'])) {
    $data = createMinimalGeoJSON($db->getFiltered($_POST['filter']));
} else {
    $data = createMinimalGeoJSON($db->getAll());
}
header('Content-Type: application/json');
echo json_encode($data);
