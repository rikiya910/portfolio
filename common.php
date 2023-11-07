<?php
/*-------------------------------------------
    変数
--------------------------------------------*/
$dsn = 'pgsql:dbname=postgres host=localhost port=5432';
$user = 'postgres';
$password = 'postgres';
$dbName = 'test.memo';
$raw = file_get_contents('php://input'); // POSTされた生のデータを受け取る
$dbh = new PDO($dsn, $user, $password);
$data = json_decode($raw); // json形式をphp変数に変換

/*-------------------------------------------
    汎用関数
--------------------------------------------*/
function console_log($data)
{
    echo '<script>console.log(' . json_encode($data) . ')</script>';
}
?>