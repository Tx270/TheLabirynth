<?php

if($_POST['username'] && $_POST['score']) {
  echo file_get_contents('replay.html');
  echo "<script> const usr = '".$_POST['username']."'; const score = '".$_POST['score']."' </script>";
} else {
  echo file_get_contents('play.html');
}

die();