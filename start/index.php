<?php

if($_POST['username'] && $_POST['score']) {
  echo "<!DOCTYPE html><html lang='en'><head> <script> const usr = '".$_POST['username']."'; const score = '".$_POST['score']."'; </script>";
  echo file_get_contents('replay.html');
} else {
  $config = require $_SERVER['DOCUMENT_ROOT'] . '/php/config.php';
  echo "<!DOCTYPE html><html lang='en'><head> <script> const maxStage = ".$config['MAX_STAGE']."; </script>";
  echo file_get_contents('play.html');
}

die();