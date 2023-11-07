<?php
include('common.php');

/*-------------------------------------------
    メイン処理
--------------------------------------------*/
$sql = "select * from {$dbName} order by unique_id desc";
// console_log($sql);
$res = [];
foreach ($dbh->query($sql) as $row) {
    array_push($res, $row);
}
echo json_encode($res);
