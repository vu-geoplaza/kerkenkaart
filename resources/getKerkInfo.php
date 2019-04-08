<?php

/**
 * Created by PhpStorm.
 * User: peter
 * Date: 18-1-2018
 * Time: 11:16
 */
Define('BAG_WFS_URL', 'https://geodata.nationaalgeoregister.nl/bag/wfs?&request=GetFeature&typeNames=bag:pand&count=5&cql_filter=bag:identificatie=');

include('db.php');
if (isset($_GET['id'])) {
    $id = (integer) $_GET['id'];
} else {
    $id = (integer) $_POST['id'];
}
$data['json'] = getData($id);
$data['html'] = createHtml($data['json']);
header('Content-Type: application/json');
echo json_encode($data);

function createHtml($d) {
    $html = '<table>';
    $html .= htmlRow('id', $d['id']);
    $html .= htmlRow('naam', naamHtml($d));
    $tmp = denominatieHtml($d);
    $denominatieHtml = $tmp[0];
    $denom_last = $tmp[1];
    $html .= htmlRow('denominatie', $denominatieHtml);
    $html .= htmlRow('architect', architectHtml($d));
    $adres = $d['straatnaam'] . ' ' . $d['huisnummer'] . ', ' . $d['plaats'];
    $html .= htmlRow('adres', $adres);
    $v = $d['jaar_ingebruikname'];
    if (isset($d['jaar_buiten_gebruik']) && $d['jaar_buiten_gebruik'] !== 0) {
        $v .= ' - ' . $d['jaar_buiten_gebruik'];
    }
    $html .= htmlRow('in gebruik', $v);
    $html .= htmlRow('bijzonderheden', $d['bijzonderheden']);

    $v = $d['huidige_bestemming'];
    //if ($v == 'kerk') {
    //    $v .= ' ('.$denom_last.')';
    //}
    if (isset($d['opmerkingen_bestemming'])) {
        $v .= ' [' . $d['opmerkingen_bestemming'] . ']';
    }
    $html .= htmlRow('huidige bestemming', $v);
    $html .= htmlRow('consecratie', $d['jaar_consecratie']);
    $html .= htmlRow('vorm', $d['vorm_type']);
    if ($d['functie_kathedraal']) {
        $v = 'ja';
    } else {
        $v = 'nee';
    }
    $html .= htmlRow('kathedraal', $v);
    if ($d['eretitel_basiliek']) {
        $v = 'ja';
    } else {
        $v = 'nee';
    }
    $html .= htmlRow('basiliek', $v);
    $v = $d['stijl'];
    if (isset($d['opmerkingen_stijl'])) {
        $v .= ' [ ' . $d['opmerkingen_stijl'] . ']';
    }
    $html .= htmlRow('stijl', $v);
    $html .= htmlRow('stijl school', $d['stijl_school']);
    $html .= htmlRow('monumenten status', $d['monumenten_status']);
    $rm = ($d['rijksmonument_nummer'] !== 0) && ($d['rijksmonument_nummer'] !== '') ? $d['rijksmonument_nummer'] . ' [<a href="' . BASE_URL_MR . $d['rijksmonument_nummer'] . '" target="_BLANK">link</a>]' : '';
    $html .= htmlRow('rijksmonument nummer', $rm);
    $html .= htmlRow('provinciaal monument id', $d['provinciaal_monument_id']);
    $html .= htmlRow('gemeente monument id', $d['gemeente_monument_id']);
    $html .= htmlRow('bronnen', bronnenHtml($d));
    $html .= htmlRow('Basisregistratie Adressen en Gebouwen (Actueel)', '<div id="bag_info"></div>');
    //https://www.google.com/maps/search/?api=1&query=47.5951518,-122.3316393
    $url = 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=' . urlencode($d['lokatie']['lat'] . ',' . $d['lokatie']['lon']);
    $html .= htmlRow('Google street view', '<a href="' . $url . '" target="streetview">view</a>');
    $html .= '</table>';
    return $html;
}

function htmlRow($k, $v) {
    $html = '<tr>';
    $html .= '<td style="width: 30%; overflow: hidden; text-overflow: ellipsis;"><b>' . $k . '</b></td>';
    $html .= '<td style="width: 70%;">' . $v . '</td>';
    $html .= '</tr>';
    return $html;
}

function bronnenHtml($d) {
    $html = '<ul>';
    foreach ($d['bronnen'] as $key => $val) {
        $html .= '<li>';
        if (isset($val['auteur'])) {
            $html .= $val['auteur'];
        }
        if (isset($val['jaar_van_uitgave'])) {
            $html .= ' (' . $val['jaar_van_uitgave'] . '). ';
        }
        $html .= '<i>' . $val['titel'] . '</i>';
        if (isset($val['jaar_van_uitgave'])) {
            $html .= ' (' . $val['jaar_van_uitgave'] . ')';
        }
        if (isset($val['link'])) {
            $html .= ' [<a href="' . $val['link'] . '" target="_BLANK">link</a>]';
        }
        if (isset($val['permalink'])) {
            $html .= ' [<a href="' . $val['permalink'] . '" target="_BLANK">link</a>]';
        }
        if (isset($val['opmerkingen'])) {
            $html .= ' [' . $val['opmerkingen'] . ']';
        }
        $html .= '</li>';
    }
    $html .= '</ul>';
    return $html;
}

function architectHtml($d) {
    $html = '<ul>';
    foreach ($d['architect'] as $key => $val) {
        $html .= '<li>' . $val['architect'];
        if (isset($val['opmerkingen'])) {
            $html .= ' [' . $val['opmerkingen'] . ']';
        }
        $html .= '</li>';
    }
    $html .= '</ul>';
    return $html;
}

function denominatieHtml($d) {
    $html = '<ul>';
    foreach ($d['denominatie'] as $key => $val) {
        $html .= '<li>' . $val['denominatie'];
        if ($val['van'] !== 0) {
            $html .= ' (';
            if ($val['van'] !== 0) {
                $html .= $val['van'];
            }
            if ($val['tot'] !== 0) {
                $html .= '-' . $val['tot'];
            }
            $html .= ')';
        }
        if (isset($val['opmerkingen'])) {
            $html .= ' [' . $val['opmerkingen'] . ']';
        }
        $html .= '</li>';
    }
    $html .= '</ul>';
    return array($html, $val['denominatie']);
}

function naamHtml($d) {
    $html = '<ul>';
    foreach ($d['naam'] as $key => $val) {
        $html .= '<li>' . $val['naam_kerk'];
        if ($val['van'] !== 0) {
            $html .= ' (';
            if ($val['van'] !== 0) {
                $html .= $val['van'];
            }
            if ($val['tot'] !== 0) {
                $html .= '-' . $val['tot'];
            }
            $html .= ')';
        }
        if (isset($val['opmerkingen'])) {
            $html .= ' [' . $val['opmerkingen'] . ']';
        }
        $html .= '</li>';
    }
    $html .= '</ul>';
    return $html;
}

function getData($id) {
    $db = new db();
    $res = $db->getInfo($id);

    $data = setArray($res, 'hoofdtabel')[0];
    $data['naam'] = setArray($res, 'naam');
    $data['denominatie'] = setArray($res, 'denominatie');
    $data['architect'] = setArray($res, 'architect');
    $data['bronnen'] = setArray($res, 'bronnen');
    $data['bag_pand_id'] = $res['bag_pand_id'][0]['pand_id'];
    $data['lokatie'] = setArray($res, 'lokatie')[0];
    error_log(print_r($data['lokatie'], true));
    return $data;
}

/**
 * @param $res
 * @param $k
 * @return array
 */
function setArray($res, $k) {
    $d = array();
    foreach ($res[$k] as $i => $v) {
        foreach ($v as $key => $val) {
            $d[$i][strtolower($key)] = $val;
        }
    }
    return $d;
}
