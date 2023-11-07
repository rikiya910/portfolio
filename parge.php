<?php
include("common.php");

/*-------------------------------------------
    メイン処理
--------------------------------------------*/
$date = new DateTime();
$date->modify('-3 day');
$target_day = $date->format('Y-m-d');
console_log($target_day);

$sql = "delete from {$dbName} where delete_flag = true and time < '$target_day'";
console_log($sql);

$dbh->query($sql);
