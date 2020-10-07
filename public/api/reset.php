<?php 
if(isset($_POST['email'])) {
  require_once dirname(dirname(__DIR__)) . '/php/User.php';
  echo User::reset($_POST['email']);
} else {
  http_response_code(404);
  require_once dirname(__DIR__) . '/404.php';
  die;
}
