<?php 
if(isset($_POST['logout'])) {
  require_once dirname(dirname(__DIR__)) . '/php/User.php';
  echo User::logout();
} else {
  http_response_code(404);
  require_once dirname(__DIR__) . '/404.php';
  die;
}
