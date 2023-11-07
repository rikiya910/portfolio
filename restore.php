<?php
include("common.php");

/*-------------------------------------------
    メイン処理
--------------------------------------------*/
$unique_id = $data;

$sql = "update {$dbName} set delete_flag = false where unique_id = {$unique_id}";

$dbh->query($sql);