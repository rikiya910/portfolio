<?php
include("common.php");

/*-------------------------------------------
    メイン処理
--------------------------------------------*/
$page_id = $data;

$sql = "update {$dbName} set delete_flag = true where page_id = {$page_id}";

$dbh->query($sql);