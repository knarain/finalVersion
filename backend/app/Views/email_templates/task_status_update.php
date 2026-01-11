<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Status Updated</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2c3e50; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; color: white; }
        .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
        .status-box { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff; }
        .status-old { color: #dc3545; font-weight: bold; }
        .status-new { color: #28a745; font-weight: bold; }
        .footer { background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Task Status Updated</h1>
        </div>
        
        <div class="content">
            <p>Hello Admin,</p>
            
            <p>A task status has been updated. Here are the details:</p>
            
            <div class="status-box">
                <h3>Task Details:</h3>
                <p><strong>Task ID:</strong> #<?= htmlspecialchars($taskId) ?></p>
                <p><strong>Task Name:</strong> <?= htmlspecialchars($taskName) ?></p>
                <p><strong>Previous Status:</strong> <span class="status-old"><?= htmlspecialchars($oldStatus) ?></span></p>
                <p><strong>New Status:</strong> <span class="status-new"><?= htmlspecialchars($newStatus) ?></span></p>
                <p><strong>Updated By:</strong> <?= htmlspecialchars($updatedBy) ?></p>
            </div>
            
            <p>Please log in to the admin panel to view more details about this task.</p>
            
            <p>Best regards,<br>
            <strong>System Notification</strong></p>
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; <?= date('Y') ?> Photography Studio. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
