<?php 
require_once __DIR__ . '/DB.php';
require_once __DIR__ . '/User.php';

class Comment extends DB {
  public static function submit($comment, $ssid) {
    $json = (object)[];
    $json->ready = false;

    $msg = htmlspecialchars($comment);

    $sql = 'SELECT username FROM login WHERE token=:token';
    if($ssid === $_COOKIE['ssid'] && self::query($sql, [':token' => hash('sha256', $ssid)])) {
      if(strlen($comment) > 0 && preg_match('/[^\s\r\n]+/i', $comment)) {
        $username = self::query($sql, [':token' => hash('sha256', $ssid)])->username;
        $posted = time();
        $secret = bin2hex(random_bytes(12));
        $sql = 'INSERT INTO comments VALUES (null, :comment, :username, :reported, :posted, :secret)';
        self::query($sql, [
          ':comment' => $msg,
          ':username' => $username,
          ':reported' => 0,
          ':posted' => $posted,
          ':secret' => $secret
        ]);
        
        $sql = 'SELECT id FROM comments WHERE secret=:secret';
        $json->id = self::query($sql, [':secret' => $secret])->id;
        $json->username = $username;
        $json->comment = $msg;
        $json->secret = $secret;
        $json->posted = $posted;
        $json->ready = true;
      }
    } else $json->location = json_decode(User::logout())->location;
    return json_encode($json);
  }

  public static function get_comments($comment, $ssid) {
    $json = (object)[];
    $json->ready = false;
    
    $sql = 'SELECT id FROM login WHERE token=:token';
    if($ssid === $_COOKIE['ssid'] && self::query($sql, [':token' => hash('sha256', $ssid)])) {
      $sql = 'SELECT * FROM comments';
      $json->data = self::query($sql, [], true);
      $json->ready = true;
    }

    return json_encode($json);
  }

  public static function get_comment($id) {
    $json = (object)[];
    $json->ready = false;
    
    $sql = 'SELECT * FROM comments WHERE id > :id';
    if(self::query($sql, [':id' > $id])) {
      $json->data = self::query($sql, [
        ':id' => $id
      ], true);
      $json->ready = true;
    }

    return json_encode($json);

  }
}