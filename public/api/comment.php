<?php 
require_once dirname(dirname(__DIR__)) . '/php/Comment.php';

if(isset($_POST['ssid']) && isset($_POST['comment'])) {
  echo Comment::submit($_POST['comment'], $_POST['ssid']);
} else if(isset($_GET['comments']) && isset($_GET['ssid'])) {
  echo Comment::get_comments($_GET['comments'], $_GET['ssid']);
} else if(isset($_GET['id'])) {
  echo Comment::get_comment($_GET['id']);
} else {
  http_response_code(404);
  require_once dirname(__DIR__) . '/404.php';
  die;
}
