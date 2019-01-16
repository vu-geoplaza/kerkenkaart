<?php
/**
 * Created by PhpStorm.
 * User: peter
 * Date: 18-1-2018
 * Time: 11:16
 */
include('db.php');
if (isset($_GET['id'])) {
    $id = $_GET['id'];
} else {
    $id = $_POST['id'];
}
$data['json']=getData($id);
$data['html']=createHtml($data['json']);
header('Content-Type: application/json');
echo json_encode($data);

function createHtml($d){
    $html='<table>';
    $html.=htmlRow('id',$d['id']);
    $html.=htmlRow('naam',naamHtml($d));
    $html.=htmlRow('denominatie',denominatieHtml($d));
    $html.=htmlRow('architect',architectHtml($d));
    $adres=$d['straatnaam'].' '.$d['huisnummer'].', '.$d['plaats'];
    $html.=htmlRow('adres',$adres);
    $v=$d['jaar_ingebruikname'];
    if (isset($d['jaar_buiten_gebruik'])&&$d['jaar_buiten_gebruik']!==0 ){
        $v.='-'.$d['jaar_buiten_gebruik'];
    }
    $html.=htmlRow('in gebruik',$v);

    $v=$d['huidige_bestemming'];
    if (isset($d['opmerkingen_bestemming'])){
        $v.=' [Opm: '. $d['opmerkingen_bestemming'] .']';
    }
    $html.=htmlRow('huidige bestemming',$v);
    $html.=htmlRow('consecratie',$d['jaar_consecratie']);
    $html.=htmlRow('vorm',$d['vorm_type']);
    if ($d['functie_kathedraal']){
        $v='ja';
    } else {
        $v='nee';
    }
    $html.=htmlRow('kathedraal',$v);
    if ($d['eretitel_basiliek']){
        $v='ja';
    } else {
        $v='nee';
    }
    $html.=htmlRow('basiliek',$v);
    $v=$d['stijl'];
    if (isset($d['opmerkingen_stijl'])){
        $v.=' [Opm: '. $d['opmerkingen_stijl'] .']';
    }
    $html.=htmlRow('stijl',$v);
    $html.=htmlRow('stijl school',$d['stijl_school']);
    $html.=htmlRow('monumenten status',$d['monumenten_status']);
    $html.=htmlRow('rijksmonument nummer',$d['rijksmonument_nummer']);
    $html.=htmlRow('provinciaal monument id',$d['provinciaal_monument_id']);
    $html.=htmlRow('gemeente monument id',$d['gemeente_monument_id']);
    $html.=htmlRow('bronnen',bronnenHtml($d));
    $html.='</table>';
    return $html;
}

function htmlRow($k,$v){
    $html='<tr>';
    $html.='<td><b>'.$k.'</b></td>';
    $html.='<td>'.$v.'</td>';
    $html.='</tr>';
    return $html;
}

function bronnenHtml($d) {
    $html='<ul>';
    foreach ($d['bronnen'] as $key=>$val) {
        $html.='<li>';
        if (isset($val['auteur'])) {
            $html.=$val['auteur'];
        }
        if (isset($val['jaar_van_uitgave'])){
            $html.= ' ('. $val['jaar_van_uitgave'] .'). ';
        }
        $html.='<i>' . $val['titel'] . '</i>';
        if (isset($val['jaar_van_uitgave'])){
            $html.= ' ('. $val['jaar_van_uitgave'] .')';
        }
        if (isset($val['link'])){
            $html.= ' [<a href="'. $val['link'] .'" target="_BLANK">link</a>]';
        }
        if (isset($val['permalink'])){
            $html.= ' [<a href="'. $val['permalink'] .'" target="_BLANK">link</a>]';
        }
        if (isset($val['opmerkingen'])){
            $html.=' [Opm: '.$val['opmerkingen'].']';
        }
        $html.='</li>';
    }
    $html.='</ul>';
    return $html;
}

function architectHtml($d){
    $html='<ul>';
    foreach ($d['architect'] as $key=>$val) {
        $html.='<li>' . $val['architect'];
        if (isset($val['opmerkingen'])){
            $html.=' [Opm: '.$val['opmerkingen'].']';
        }
        $html.='</li>';
    }
    $html.='</ul>';
    return $html;
}


function denominatieHtml($d){
    $html='<ul>';
    foreach ($d['denominatie'] as $key=>$val) {
        $html.='<li>' . $val['denominatie'];
        if ($val['van']!==0) {
            $html .= ' (';
            if ($val['van'] !== 0) {
                $html .= $val['van'];
            }
            if ($val['tot'] !== 0) {
                $html .= '-' . $val['tot'];
            }
            $html .= ')';
        }
        if (isset($val['opmerkingen'])){
            $html.=' [Opm: '.$val['opmerkingen'].']';
        }
        $html.='</li>';
    }
    $html.='</ul>';
    return $html;
}

function naamHtml($d){
    $html='<ul>';
    foreach ($d['naam'] as $key=>$val) {
        $html.='<li>' . $val['naam_kerk'];
        if ($val['van']!==0) {
            $html .= ' (';
            if ($val['van'] !== 0) {
                $html .= $val['van'];
            }
            if ($val['tot'] !== 0) {
                $html .= '-' . $val['tot'];
            }
            $html .= ')';
        }
        if (isset($val['opmerkingen'])){
            $html.=' [Opm: '.$val['opmerkingen'].']';
        }
        $html.='</li>';
    }
    $html.='</ul>';
    return $html;
}


function getData($id){
    $db=new db();
    $res=$db->getInfo($id);

    $data=setArray($res,'hoofdtabel')[0];
    $data['naam']=setArray($res,'naam');
    $data['denominatie']=setArray($res,'denominatie');
    $data['architect']=setArray($res,'architect');
    $data['bronnen']=setArray($res,'bronnen');
    return $data;
}

/**
 * @param $res
 * @param $k
 * @return array
 */
function setArray($res, $k){
    $d=array();
    foreach ($res[$k] as $i=>$v) {
        foreach ($v as $key=>$val) {
            $d[$i][strtolower($key)]=$val;
        }
    }
    return $d;
}