<?php

if($_POST['username']) {
  echo "<!DOCTYPE html><html lang='en'><head> <script> const usr = '".$_POST['username']."'; </script>";
  echo file_get_contents('create.html');
} else {
  header('Location: /start/');
}

die();