<?php 
if(isset($_GET['ssid'])) {
  require_once dirname(dirname(__DIR__)) . '/php/User.php';
  echo User::get_username($_GET['ssid']);
} else {
  http_response_code(404);
  require_once dirname(__DIR__) . '/404.php';
  die;
}
