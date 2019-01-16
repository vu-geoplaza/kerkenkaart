<?php
//error_reporting(E_ALL);
//ini_set('display_errors', 1);
include 'config.php';

/**
 * Description of db
 *
 * @author peter
 */
class db {

    function __construct() {
        // pgsql:host=localhost;port=5432;dbname=testdb;user=bruce;password=mypass
        $this->dbh = new PDO("pgsql:host=" . DBHOST . ";port=" . DBPORT . ";dbname=" . DB . ";user=" . DBUSER . ";password=" . DBPW) or die('connection failed');
    }

    Function getAll() {
        $this->dbh->exec("SET CHARACTER SET utf8");
        $sql = "SELECT * from vw_viewer_data";
        $sth = $this->dbh->prepare($sql);
        $sth->execute();
        $res = $sth->fetchAll(PDO::FETCH_ASSOC);
        error_log(print_r($res, true));
        return $res;
    }

    function getInfo($id) {
        $this->dbh->exec("SET CHARACTER SET utf8");
        $sql = 'SELECT * FROM "01_Hoofdtabel_Kerken" WHERE "ID"=:id';
        $sth = $this->dbh->prepare($sql);
        $sth->execute(array(":id" => $id));
        $res['hoofdtabel'] = $sth->fetchAll(PDO::FETCH_ASSOC);

        $sql = 'SELECT * FROM "011_Naam_Kerk" WHERE "ID"=:id';
        $sth = $this->dbh->prepare($sql);
        $sth->execute(array(":id" => $id));
        $res['naam'] = $sth->fetchAll(PDO::FETCH_ASSOC);

        $sql = 'SELECT * FROM "012_Denominatie" WHERE "ID"=:id';
        $sth = $this->dbh->prepare($sql);
        $sth->execute(array(":id" => $id));
        $res['denominatie'] = $sth->fetchAll(PDO::FETCH_ASSOC);

        $sql = 'SELECT * FROM "013_Architect" WHERE "ID"=:id';
        $sth = $this->dbh->prepare($sql);
        $sth->execute(array(":id" => $id));
        $res['architect'] = $sth->fetchAll(PDO::FETCH_ASSOC);

        $sql = 'SELECT * FROM "014_Bronnen" WHERE "ID"=:id';
        $sth = $this->dbh->prepare($sql);
        $sth->execute(array(":id" => $id));
        $res['bronnen'] = $sth->fetchAll(PDO::FETCH_ASSOC);
        return $res;
    }

}

/**
 * Clean some of the "regel" categories
 * 
 * @param type $KR
 * @return string The normalized string
 */
function cleanKR($KR) {
    switch ($KR) {
        case 'derde regel van Francisus':
        case 'derde regel van Francsicus':
        case 'derde regel van Franciscus ?':
        case 'derde regel van Francisciscus':
            $r = 'derde regel van Franciscus';
            break;
        case 'derde regel van Augustinus':
            $r = 'regel van Augustinus';
            break;
        case 'regel van Benedictus ?':
            $r = 'regel van Benedictus';
            break;
        case 'regel van Aken ?':
        case 'regel van Aken';
            $r = 'geen';
            break;
        case 'gen':
            $r = 'geen';
            break;
        case 'regel onbekend':
            $r = 'onbekend'; //???
            break;
        case NULL:
            $r = 'geen'; //???
            break;
        case 'n.v.t.':
            $r = 'geen';
            break;
        case 'begijnen':
            $r = 'geen';
            break;
        default:
            $r = $KR;
    }
    return $r;
}

/**
 * 
 * @param type $ST
 * @param type $r regel
 * @return type
 */
function cleanST($ST, $r) {
    switch ($ST) {
        case 'tertiarissen van Sint Dominicus 1447':
        case 'tertiarissen van Sint-Dominicus':
            $o = 'tertiarissen van Sint Dominicus';
            break;
        case 'victorinnen 1246*':
            $o = 'victorinnen';
            break;
        case 'celebroeders':
            $o = 'cellebroeders*';
            break;
        case 'Duitse orde':
            $o = 'Duitse Orde';
            break;
        case 'mannelijke en vrouwelijke religieuzen':
            $o = "broeders en zusters";
            break;
        case 'cellebroeders':
        case 'cellezusters':
        case 'hospitaalzusters':
        case 'seculiere kanunniken':
            if (($r == 'geen') || ($r == 'onbekend')) {
                $o = $ST . '*';
            } else {
                $o = $ST;
            }
            break;
        case 'regulieren (reguliere kanunniken)':
            $o = 'regulieren'; //navragen bij Koen
            break;
        case 'monniken en clerici':
        case 'kluizenaars':
            $o = 'monniken';
            break;
        case 'devoten':
            $o = 'broeders des gemenen levens';
            break;
        case 'bogarden':
            $o = 'begarden';
            break;
        case "uithof van Mari\xebngaarde (H27)":
        case 'uithof van Mariëngaarde (H27)':
            $o = 'norbertijnen';
            break;
        default:
            $o = $ST;
    }
    return $o;
}

function pretty_json($json) {

    $result = '';
    $pos = 0;
    $strLen = strlen($json);
    $indentStr = ' ';
    $newLine = "\n";
    $prevChar = '';
    $outOfQuotes = true;

    for ($i = 0; $i <= $strLen; $i++) {

// Grab the next character in the string.
        $char = substr($json, $i, 1);

// Are we inside a quoted string?
        if ($char == '"' && $prevChar != '\\') {
            $outOfQuotes = !$outOfQuotes;

// If this character is the end of an element,
// output a new line and indent the next line.
        } else if (($char == '}' || $char == ']') && $outOfQuotes) {
            $result .= $newLine;
            $pos--;
            for ($j = 0; $j < $pos; $j++) {
                $result .= $indentStr;
            }
        }

// Add the character to the result string.
        $result .= $char;

// If the last character was the beginning of an element,
// output a new line and indent the next line.
        if (($char == ',' || $char == '{' || $char == '[') && $outOfQuotes) {
            $result .= $newLine;
            if ($char == '{' || $char == '[') {
                $pos++;
            }

            for ($j = 0; $j < $pos; $j++) {
                $result .= $indentStr;
            }
        }

        $prevChar = $char;
    }

    return $result;
}

function decToDeg($coord, $lat) {
    $ispos = $coord >= 0;
    $coord = abs($coord);
    $deg = floor($coord);
    $coord = ($coord - $deg) * 60;
    $min = floor($coord);
    $sec = floor(($coord - $min) * 60);
    if ($lat) {
        $c = sprintf("%d&deg;%d'%d\"%s", $deg, $min, $sec, $ispos ? 'N' : 'S');
    } else {
        $c = sprintf("%d&deg;%d'%d\"%s", $deg, $min, $sec, $ispos ? 'E' : 'W');
    }
    return $c;
}
