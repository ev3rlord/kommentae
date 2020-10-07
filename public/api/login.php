<?php 
if(isset($_POST['username']) && isset($_POST['password'])) {
  require_once dirname(dirname(__DIR__)) . '/php/User.php';
  echo User::login($_POST['username'], $_POST['password']);
} else {
  http_response_code(404);
  require_once dirname(__DIR__) . '/404.php';
  die;
}
