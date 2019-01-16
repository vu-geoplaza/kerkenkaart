<?php

include('db.php');

#$begin = filter_input(INPUT_POST, 'begin', FILTER_VALIDATE_INT);


$db = new db();
$list = $db->getAll();
if (isset($_POST['filter'])) {
    $data = createGeoJSON($list, $_POST['filter']);
} else {
    $data = createGeoJSON($list, false);
}
header('Content-Type: application/json');
echo json_encode($data);

/**
 * Create a standard object that can be encoded to json.
 *
 *
 * @param array $l An array of database row results
 * @return object
 */
Function createGeoJSON($l, $filter)
{
    $geo = new stdClass();
    $geo->type = "FeatureCollection";
    $geo->crs->properties->name = 'urn:ogc:def:crs:EPSG::4326';
    $geo->crs->type = 'name';
    $geo->features = array();
    $n = 0;

    foreach ($l as $row) {
        $add = True;
        if ($filter) {
            foreach ($filter as $property=>$val) {
                if (!in_array($row[$property], $val)) {
                    error_log($row[$property]);
                    $add = False;
                }
            }
        }
        if ($add) {
            $geo->features[$n] = new stdClass();
            $geo->features[$n]->type = "Feature";
            $geo->features[$n]->geometry = new stdClass();
            $geo->features[$n]->geometry->type = "Point";
            $geo->features[$n]->geometry->coordinates[0] = (double)$row['lon'];
            $geo->features[$n]->geometry->coordinates[1] = (double)$row['lat'];
            $geo->features[$n]->properties = new stdClass();
            $geo->features[$n]->properties->kerk_id = $row['id'];
            $geo->features[$n]->properties->naam = $row['plaats'] . ', ' . $row['naam'];
            if ($row['denominatie']=='Nederlandse Protestanten Bond'){
                $row['denominatie']='Nederlandse Protestantenbond';
            }
            $geo->features[$n]->properties->denominatie = $row['denominatie'];
            $geo->features[$n]->properties->type = $row['type'];
            $geo->features[$n]->properties->stijl = $row['stijl'];
            $n++;
        }
    }
    return $geo;
}



