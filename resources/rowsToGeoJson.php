<?php
$stijlen = ["neogotiek", "modernisme - functionalisme", "expressionisme", "traditionalisme", "neorenaissance", "eclecticisme", "neoromaans", "classicisme", "gotiek", "renaissance", "romaans", "neoclassicisme", "neobarok", "rationalisme", "overig"];
$denominaties = ["Christelijke Gereformeerde Kerk","Christian Science Church","Doopsgezinde Sociëteit","Evangelisch Lutherse Kerk","Gereformeerde Gemeente (in Nederland)", "Gereformeerde Kerk (vrijgemaakt)","Gereformeerde Kerken","Nederlandse Hervormde Kerk","Nederlandse Protestantenbond","Oud-Katholieke Kerk","Protestantse Kerk Nederland","Remonstrantse Broederschap","Rooms-katholieke Kerk"];

Function createMinimalGeoJSON($l)
{
    global $stijlen, $denominaties;
    $geo = new stdClass();
    $geo->type = "FeatureCollection";
    $geo->attribution = 'Wesselink, H. (2020). Kerkenkaart [Data set]. Retrieved on ' . date("F j, Y") . ', from https://geoplaza.vu.nl/projects/kerken';
    $geo->features = array();
    $n = 0;
    foreach ($l as $row) {
        $geo->features[$n] = new stdClass();
        $geo->features[$n]->type = "Feature";
        $geo->features[$n]->geometry = new stdClass();
        $geo->features[$n]->properties = new stdClass();
        $geo->features[$n]->geometry->type = "Point";
        $geo->features[$n]->geometry->coordinates[0] = (double)$row['lon'];
        $geo->features[$n]->geometry->coordinates[1] = (double)$row['lat'];

        $geo->features[$n]->properties->kerk_id = $row['id'];
        $geo->features[$n]->properties->naam = $row['naam'];
        $denominatie_column = 'denominatie_laatst'; // or 'denominatie' slightly different queries
        if ($row[$denominatie_column] == 'Nederlandse Protestanten Bond') {
            $row[$denominatie_column] = 'Nederlandse Protestantenbond';
        }
        if (!in_array($row[$denominatie_column], $denominaties)) {
            $row[$denominatie_column] = 'Overig';
        }
        $geo->features[$n]->properties->denominatie = $row[$denominatie_column];
        $geo->features[$n]->properties->type = $row['type'];
        if ($row['stijl'] == "classisisme") { //typo
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

Function arrValues($k, $properties, $r)
{
    $properties->{$k} = [];
    $i=0;
    foreach ($r as $arrval) {
        foreach ($arrval as $key=>$value) {
            if ($key!=='ID') {
                $properties->{$k}[$i]->{$key} = isset($value) ? $value : '';
            }
        }
        $i++;
    }
    return $properties;
}

Function createMaximalGeoJSON($l)
{
    global $stijlen, $denominaties;
    $geo = new stdClass();
    $geo->type = "FeatureCollection";
    $geo->attribution = 'Wesselink, H. (2020). Kerkenkaart [Data set]. Retrieved on ' . date("F j, Y") . ', from https://geoplaza.vu.nl/projects/kerken';
    $geo->features = array();
    $n = 0;
    foreach ($l as $row) {
        $geo->features[$n] = new stdClass();
        $geo->features[$n]->type = "Feature";
        $geo->features[$n]->geometry = new stdClass();
        $geo->features[$n]->properties = new stdClass();
        $geo->features[$n]->geometry->type = "Point";
        $geo->features[$n]->geometry->coordinates[0] = (double)$row['lokatie'][0]['lon'];
        $geo->features[$n]->geometry->coordinates[1] = (double)$row['lokatie'][0]['lat'];

        foreach ($row['hoofdtabel'][0] as $key => $value) {
            $geo->features[$n]->properties->{$key} = isset($value) ? $value : '';
        }
        foreach (['naam', 'denominatie', 'architect', 'bronnen'] as $item) {
            $geo->features[$n]->properties = arrValues($item, $geo->features[$n]->properties, $row[$item]);
        }
        $geo->features[$n]->properties->bag_pand_id = $row['bag_pand_id'][0]['pand_id'];
        $n++;
    }
    return $geo;
}

