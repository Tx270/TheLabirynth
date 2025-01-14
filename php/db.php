<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

$config = require $_SERVER['DOCUMENT_ROOT'] . '/php/config.php';

try {
    $host = $config['DB_HOST'];
    $dbname = $config['DB_NAME'];
    $user = $config['DB_USER'];
    $password = $config['DB_PASS'];

    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "DB connection error: " . $e->getMessage()]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $username = $_GET['username'] ?? 'default';
    $mode = $_GET['mode'] ?? 'user';
    $valid_modes = ['user', 'add', 'prox', 'top', 'topten'];
    $score = $_GET['score'] ?? null;

    if(
        ($mode === 'add' && (!is_numeric($score) || !(intval($score) == $score) || $score > 50000 || $score < -3000 || is_float($score))) 
        || !in_array($mode, $valid_modes) 
        || !preg_match("/^[A-Za-z0-9]+$/", $username) 
        || strlen($username) > 30) 
    {
        http_response_code(400);
        echo json_encode(["error" => "Wrong input data. ".$username]);
        exit;
    }

    try {
        $stmt = $pdo->prepare(file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/db/" . $mode . ".sql"));
        if ($mode === "add") {
            $stmt->bindParam(':score', $score, PDO::PARAM_INT);
        }
        if ($mode !== 'top' && $mode !== 'topten') {
            $stmt->bindParam(':username', $username, PDO::PARAM_STR);
        }

        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($results);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Mode: ".$mode." Username: ".$username." Score: ".$score."  Select error: " . $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Func is not supported."]);
