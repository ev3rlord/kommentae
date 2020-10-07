<?php
  class DB {
    private static function connect() {
      $hostname = 'localhost';
      $dbname = 'kommentae';
      $username = 'root';
      $password = '';

      $dsn = 'mysql:host=' . $hostname . '; dbname=' . $dbname;
      $pdo = new PDO($dsn, $username, $password);
      $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
      $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      return $pdo;
    }

    public static function query($sql, $params = [], $bool = false) {
      $statement = self::connect()->prepare($sql);
      $statement->execute($params);

      if(!$bool && preg_match('/^SELECT/i', $sql)) return $statement->fetch(PDO::FETCH_OBJ);
      if($bool) return $statement->fetchAll(PDO::FETCH_OBJ);
    }
  }
