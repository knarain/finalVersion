<?php
require_once __DIR__ . '/../db.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once '../utils/response.php';
require_once '../utils/image_utils.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_error('Method not allowed', 405);
    exit;
}

try {
    $db = getDB();
    
    // Get form data
    $clientNames = $_POST['clientNames'] ?? null;
    $eventType = $_POST['eventType'] ?? null;
    $date = $_POST['date'] ?? null;
    $category = $_POST['category'] ?? null;
    $isLocked = isset($_POST['isLocked']) ? filter_var($_POST['isLocked'], FILTER_VALIDATE_BOOLEAN) : false;
    $password = $_POST['password'] ?? null;

    // Validate required fields
    if (!$clientNames || !$eventType || !$date || !$category) {
        send_error('Missing required fields');
        exit;
    }

    // Handle cover image upload
    $coverImage = null;
    if (isset($_FILES['coverImage']) && $_FILES['coverImage']['error'] === UPLOAD_ERR_OK) {
        $upload_result = handle_image_upload($_FILES['coverImage'], '../uploads/covers/');
        if (!$upload_result['success']) {
            send_error($upload_result['error']);
            exit;
        }
        $coverImage = $upload_result['filename'];
    }

    // Start transaction
    $db->beginTransaction();

    try {
        // Create the album
        $stmt = $db->prepare("
            INSERT INTO albums (
                client_names, 
                event_type, 
                date, 
                category, 
                cover_image, 
                is_locked, 
                password,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ");

        if (!$stmt->execute([
            $clientNames,
            $eventType,
            $date,
            $category,
            $coverImage,
            $isLocked ? 1 : 0,
            $isLocked && $password ? password_hash($password, PASSWORD_DEFAULT) : null
        ])) {
            throw new Exception('Failed to create album: ' . implode(', ', $stmt->errorInfo()));
        }

        $albumId = $db->lastInsertId();

        // Create the album's directory
        $albumDir = "../uploads/albums/{$albumId}";
        if (!mkdir($albumDir, 0755, true)) {
            throw new Exception('Failed to create album directory');
        }

        // Commit transaction
        $db->commit();

        // Return success response with the new album data
        $album = [
            'id' => $albumId,
            'clientNames' => $clientNames,
            'eventType' => $eventType,
            'date' => $date,
            'category' => $category,
            'coverImage' => $coverImage ? "/uploads/covers/{$coverImage}" : null,
            'isLocked' => $isLocked,
            'imageCount' => 0
        ];

        send_response(['album' => $album]);

    } catch (Exception $e) {
        // Rollback transaction on error
        $db->rollBack();
        
        // Delete uploaded cover image if exists
        if ($coverImage && file_exists("../uploads/covers/{$coverImage}")) {
            unlink("../uploads/covers/{$coverImage}");
        }

        // Delete album directory if exists
        if (isset($albumId) && is_dir("../uploads/albums/{$albumId}")) {
            rmdir("../uploads/albums/{$albumId}");
        }

        throw $e;
    }

} catch (Exception $e) {
    send_error('Failed to create album: ' . $e->getMessage());
}
