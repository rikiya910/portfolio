<?php
include("common.php");

/*-------------------------------------------
    メイン処理
--------------------------------------------*/
// $data = "test,,19,530,2023-08-10 11:35:53";
$ary = explode(",", $data);
$title = array_shift($ary);
$text = array_shift($ary);
$page_id = array_shift($ary);
$unique_id = array_shift($ary);
$time = array_shift($ary);

$sql = "insert into {$dbName} (title,text,page_id,delete_flag,unique_id,time)values('{$title}','{$text}',{$page_id},false,{$unique_id},'{$time}')";
console_log($sql);

$dbh->query($sql);