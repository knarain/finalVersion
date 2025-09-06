<?php
require_once __DIR__ . '/config.php';

// Disable PHP's error display, we'll handle errors ourselves
error_reporting(0);
ini_set('display_errors', 0);

function getDB() {
    static $db = null;
    if ($db === null) {
        try {
            $db = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                )
            );
        } catch (PDOException $e) {
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'Database connection failed',
                'error' => $e->getMessage()
            ]);
            exit;
        }
    }
    return $db;
}

// Create database if it doesn't exist
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST,
        DB_USER,
        DB_PASS
    );
    $pdo->exec("CREATE DATABASE IF NOT EXISTS " . DB_NAME);
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Database creation failed',
        'error' => $e->getMessage()
    ]);
    exit;
}
?>
