<?php

if($_POST['username']) {
  $config = require $_SERVER['DOCUMENT_ROOT'] . '/php/config.php';
  echo "<!DOCTYPE html><html lang='en'><head> <script> const usr = '".$_POST['username']."'; const maxStage = ".$config['MAX_STAGE']."; </script>";
  if($_POST['channelName']) {
    echo "<script> const channelName = '".$_POST['channelName']."'; var multiplayer = true; </script>";
  }
  echo file_get_contents('game.html');
} else {
  header('Location: start/');
}

die();