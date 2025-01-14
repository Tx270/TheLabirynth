<?php

if(isset($_POST['username'])) {
  echo "<!DOCTYPE html><html lang='en'><head> <script> const usr = '".$_POST['username']."'; </script>";
  echo file_get_contents('join.html');
} else {
  header('Location: /start/');
}

die();