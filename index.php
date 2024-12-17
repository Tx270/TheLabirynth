<?php

if($_POST['username']) {
  echo "<!DOCTYPE html><html lang='en'><head>";
  echo "<script> const usr = '".$_POST['username']."'; </script>";
  echo file_get_contents('game.html');
} else {
  header('Location: start/');
}

die();