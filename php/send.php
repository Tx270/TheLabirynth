<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['message']) || !isset($data['username']) || !isset($data['channel']) || !isset($data['event'])) {
    echo json_encode(['status' => 'error', 'message' => 'No message, username, channel or event']);
    die();
}

require $_SERVER['DOCUMENT_ROOT'] . '/vendor/autoload.php';

$options = array(
    'cluster' => 'eu',
    'useTLS' => true
);
$pusher = new Pusher\Pusher(
    '53aff91618915dd8f529',
    'f5043de5f28af7b3efcd',
    '1924141',
    $options
);

$pusher->trigger($data['channel'], $data['event'], ['message' => $data['message'], 'username' => $data['username']]);

echo json_encode(['status' => 'ok', 'message' => $data['message']]);