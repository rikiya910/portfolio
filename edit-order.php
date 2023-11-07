<?php
include("common.php");

/*-------------------------------------------
    メイン処理
--------------------------------------------*/
// $data = '5,6';
$ary = explode(",", $data);
$firstId = array_shift($ary);
$secondId = array_shift($ary);

$sqls = ["update {$dbName} set page_id = 0 where page_id = {$firstId}",
     "update {$dbName} set page_id = {$firstId} where page_id = {$secondId}",
    "update {$dbName} set page_id = {$secondId} where page_id = 0"];
console_log($sqls);

foreach($sqls as $sql) $dbh->query($sql);