<?php 
require_once __DIR__ . '/DB.php';

class User extends DB {
  public static $path = '/kommentae/public/';
  private static $username;
  private static $ssid;

  public static function get_username($ssid) {
    $json = (object)[];
    $json->ready = false;

    $sql = 'SELECT username FROM login WHERE token=:token';
    if(self::query($sql, [':token' => hash('sha256', $ssid)])) {
      $username = self::query($sql, [':token' => hash('sha256', $ssid)])->username;

      $json->username = $username;
      $json->ready = true;
    } else self::logout();

    return json_encode($json);
  }

  private static function create_token($username) {
    $token = bin2hex(random_bytes(32));
    $ctoken = bin2hex(random_bytes(32));
    $sql = 'INSERT INTO login VALUES (null, :token, :ctoken, :username, :date)';
    self::query($sql, [
      ':token' => hash('sha256', $token),
      ':ctoken' => hash('sha256', $ctoken),
      ':username' => strtolower($username),
      ':date' => time()
    ]);

    self::$ssid = $token;

    setcookie('ssid', $token, time() + (60 * 60 * 24 * 7), '/', null, false, true);
    setcookie('ssid-s', $ctoken, time() + (60 * 60 * 24 * 3), '/', null, false, true);
  }

  // Every page load -- invoke verify_token()
  public static function login_status() {
    if(@self::verify_token($_COOKIE['ssid'], $_COOKIE['ssid-s'])) return true;
    return false;
  }

  public static function verify_token($ssid, $ssid_s) {
    if(isset($ssid) && isset($ssid_s)) {
      if($_COOKIE['ssid'] === $ssid && $_COOKIE['ssid-s'] === $ssid_s) {
        $ctoken = bin2hex(random_bytes(32));

        $sql = 'SELECT id FROM login WHERE token=:token AND ctoken=:ctoken';
        if(self::query($sql, [':token' => hash('sha256', $ssid), ':ctoken' => hash('sha256', $ssid_s)])) {
          $sql = 'UPDATE login SET ctoken=:ctoken WHERE token=:token AND ctoken=:ssid_s';
          self::query($sql, [
            ':ctoken' => hash('sha256', $ctoken),
            ':token' => hash('sha256', $_COOKIE['ssid']),
            ':ssid_s' => hash('sha256', $ssid_s)
          ]);
          
          setcookie('ssid', $_COOKIE['ssid'], time() + (60 * 60 * 24 * 7), '/', null, false, true);
          setcookie('ssid-s', $ctoken, time() + (60 * 60 * 24 * 3), '/', null, false, true);
          
          self::$username = self::query('SELECT username FROM login WHERE token=:token', [':token' => hash('sha256', $ssid)])->username;
          return true;
        }
      }
    }

    self::logout();
    return false;
  }

  public static function login($username, $password) {
    $json = (object)[];
    $json->ready = false;

    if(empty($username) || empty($password))
      $json->warning = 'Username and/or password field cannot be empty.';
    else {
      $sql = 'SELECT username FROM users WHERE username=:username';
      if(self::query($sql, [':username' => $username])) {
        $sql = 'SELECT status FROM users WHERE username=:username';
        if(!self::query($sql, [':username' => $username])->status) {
          $sql = 'SELECT password FROM users WHERE username=:username';
          $hash = self::query($sql, [':username' => $username])->password;

          if(password_verify($password, $hash)) {
            self::create_token($username);
            $json->ssid = self::$ssid;
            $json->location = self::$path;
            $json->ready = true;
          } else $json->warning = 'Username and password do not match.';
        } else $json->warning = 'Unable to access a banned account.';
      } else $json->warning = 'Username and password do not match.';
    }

    return json_encode($json);
  }

  public static function register($username, $password, $email) {
    $json = (object)[];
    $json->ready = false;
    $json->warnings = [];

    $complete = [];
    // 1
    if(strlen($username) >= 1 && strlen($username) <= 20) {
      array_push($complete, true);
    } else array_push($json->warnings, 'Username must be at least 1 to 20 characters.');

    // 2
    $sql = 'SELECT username FROM users WHERE username=:username';
    if(!self::query($sql, [':username' => $username])) {
      array_push($complete, true);
    } else array_push($json->warnings, 'Username is already taken.');

    // 3
    if(preg_match('/^[\w]+$/i', $username) && preg_match('/[a-z]+/i', $username)) {
      array_push($complete, true);
    } else array_push($json->warnings, 'Username can only be letters(1 or more), numbers, and underscores.');

    // 4
    if(filter_var($email, FILTER_VALIDATE_EMAIL)) {
      array_push($complete, true);
    } else array_push($json->warnings, 'Email is invalid.');

    // 5
    $sql = 'SELECT email FROM users WHERE email=:email';
    if(!self::query($sql, [':email' => $email])) {
      array_push($complete, true);
    } else array_push($json->warnings, 'Email is already taken.');

    // 6
    if(strlen($password) >= 4 && strlen($password) <= 50) {
      array_push($complete, true);
    } else array_push($json->warnings, 'Password must be at least 4 to 50 characters.');

    if(count($complete) === 6) {
      $sql = 'INSERT INTO users VALUES (null, :username, :password, :email, :status, :reported, :moderator, :admin, :superuser, :verified, :date)';
      self::query($sql, [
        ':username' => $username,
        ':password' => password_hash($password, PASSWORD_DEFAULT),
        ':email' => $email,
        ':status' => 0,
        ':reported' => 0,
        ':moderator' => 0,
        ':admin' => 0,
        ':superuser' => 0,
        ':verified' => 0,
        ':date' => time()
      ]);

      self::create_token($username);
      $json->ssid = self::$ssid;
      $json->location = self::$path;
      $json->ready = true;
    }

    return json_encode($json);
  }

  public static function reset($email) {
    $json = (object)[];
    $json->ready = false;
    if(isset($email)) {
      if(filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $sql = 'SELECT id FROM users WHERE email=:email';
        if(self::query($sql, [':email' => $email])) {
          $password = bin2hex(random_bytes(12));
          $sql = 'UPDATE users SET password=:password WHERE email=:email';
          self::query($sql, [
            ':password' => password_hash($password, PASSWORD_DEFAULT),
            ':email' => $email
          ]);
          $json->ready = true;
          $json->warning = 'Your password has been reseted, please check your inbox.';
        } else {
          $json->warning = 'Email is not in our system.';
        }
      } else $json->warning = 'Email is invalid, please try again.';
    } else $json->warning = 'Failed to reset password, please try again.';

    return json_encode($json);
  }

  public static function logout() {
    $json = (object)[];
    $json->location = self::$path;
    $json->ready = true;

    if(isset($_COOKIE['ssid']) || isset($_COOKIE['ssid-s'])) {
      $sql = 'DELETE FROM login WHERE token=:token OR ctoken=:ctoken';
      @self::query($sql, [
        ':token' => hash('sha256', $_COOKIE['ssid']),
        ':ctoken' => hash('sha256', $_COOKIE['ssid-s'])
      ]);

      unset($_COOKIE['ssid']);
      unset($_COOKIE['ssid-s']);

      setcookie('ssid', '', time() - 3600, '/');
      setcookie('ssid-s', '', time() - 3600, '/');
    }

    return json_encode($json);
  }
}