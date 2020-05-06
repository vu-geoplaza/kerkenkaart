<?php

include('db.php');
$db = new db();

if (isset($_POST['filter'])) {
    $data = createGeoJSON($db->getFiltered($_POST['filter']));
} else {
    $data = createGeoJSON($db->getAll());
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
Function createGeoJSON($l)
{
    $stijlen = ["neogotiek", "modernisme - functionalisme", "expressionisme", "traditionalisme", "neorenaissance", "eclecticisme", "neoromaans", "classicisme", "gotiek", "renaissance", "romaans", "neoclassicisme", "neobarok", "rationalisme", "overig"];
    $geo = new stdClass();
    $geo->type = "FeatureCollection";
    $geo->crs->properties->name = 'urn:ogc:def:crs:EPSG::4326';
    $geo->crs->type = 'name';
    $geo->features = array();
    $n = 0;

    foreach ($l as $row) {
        $geo->features[$n] = new stdClass();
        $geo->features[$n]->type = "Feature";
        $geo->features[$n]->geometry = new stdClass();
        $geo->features[$n]->geometry->type = "Point";
        $geo->features[$n]->geometry->coordinates[0] = (double)$row['lon'];
        $geo->features[$n]->geometry->coordinates[1] = (double)$row['lat'];
        $geo->features[$n]->properties = new stdClass();
        $geo->features[$n]->properties->kerk_id = $row['id'];
        $geo->features[$n]->properties->naam = $row['naam'];
        if ($row['denominatie'] == 'Nederlandse Protestanten Bond') {
            $row['denominatie'] = 'Nederlandse Protestantenbond';
        }
        if ($row['denominatie'] == 'Hersteld Hervormde Kerk') {
            $row['denominatie'] = 'Overig';
        }
        $geo->features[$n]->properties->denominatie = $row['denominatie'];
        $geo->features[$n]->properties->type = $row['type'];
        if ($row['stijl'] == "classisisme") {
            $row['stijl'] = "classicisme";
        }

        if (in_array($row['stijl'], $stijlen)) {
            $geo->features[$n]->properties->stijl = $row['stijl'];
        } else {
            $geo->features[$n]->properties->stijl = "overig";
        }

        if ($row['huidige_bestemming'] == 'kerk') {
            $hb = 'kerk';
        } else {
            $hb = 'anders';
        }
        $geo->features[$n]->properties->huidige_bestemming = $hb;
        $geo->features[$n]->properties->plaats = $row['plaats'];
        $geo->features[$n]->properties->monument = $row['monument'];
        $geo->features[$n]->properties->ingebruik = $row['ingebruik'];
        $geo->features[$n]->properties->periode = $row['periode'];
        $n++;
    }
    return $geo;
}



