#!/usr/bin/env php
<?php
/**
 * Database Setup Script for Permission System
 * Run: php backend/setup_database.php
 */

// Set up paths
$pathConstant = DIRECTORY_SEPARATOR;
$root = dirname(__FILE__);

// Load environment
if (file_exists($root . '/.env')) {
    $lines = file($root . '/.env');
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') === false) {
            list($key, $val) = explode('=', $line, 2);
            putenv(trim($key) . '=' . trim($val));
        }
    }
}

// Database connection
$host = getenv('database.default.hostname') ?? 'localhost';
$db = getenv('database.default.database') ?? 'gallery';
$user = getenv('database.default.username') ?? 'root';
$pass = getenv('database.default.password') ?? '';

try {
    $mysqli = new mysqli($host, $user, $pass, $db);
    
    if ($mysqli->connect_error) {
        die("Connection failed: " . $mysqli->connect_error);
    }
    
    // Set charset
    $mysqli->set_charset("utf8mb4");
    
    echo "✓ Connected to database: $db\n\n";
    
    // Read and execute SQL file
    $sqlFile = $root . '/sql/create_permission_system_tables.sql';
    
    if (!file_exists($sqlFile)) {
        die("SQL file not found: $sqlFile\n");
    }
    
    echo "Reading SQL from: $sqlFile\n";
    $sql = file_get_contents($sqlFile);
    
    // Split queries by semicolon and execute
    $queries = array_filter(array_map('trim', explode(';', $sql)));
    
    $executed = 0;
    foreach ($queries as $query) {
        if (empty($query)) continue;
        
        if ($mysqli->query($query) === true) {
            $executed++;
            echo "✓ Executed: " . substr($query, 0, 50) . "...\n";
        } else {
            echo "✗ Error: " . $mysqli->error . "\n";
            echo "  Query: " . substr($query, 0, 100) . "...\n";
        }
    }
    
    echo "\n✓ Database setup complete! Executed $executed queries.\n";
    
    $mysqli->close();
    
} catch (Exception $e) {
    die("Error: " . $e->getMessage() . "\n");
}
?>
