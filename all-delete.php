<!-- 開発用のMemoアプリのレコードを全クリアするファイル -->
<?php
include("common.php");

/*-------------------------------------------
    メイン処理
--------------------------------------------*/
$page_id = $data;

$sql = "delete from {$dbName}";

$dbh->query($sql);