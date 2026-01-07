<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Album Access Credentials</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
        .credentials { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
        .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Album Access Granted</h1>
        </div>
        
        <div class="content">
            <p>Dear Valued Client,</p>
            
            <p>We're excited to share that your exclusive album access has been successfully created! You can now view and download your beautiful memories from our photography session.</p>
            
            <div class="credentials">
                <h3>📋 Your Access Details:</h3>
                <p><strong>Album:</strong> <?= htmlspecialchars($albumTitle ?? 'Your Photo Album') ?></p>
                <p><strong>Email:</strong> <?= htmlspecialchars($email) ?></p>
                <p><strong>Password:</strong> <code><?= htmlspecialchars($password) ?></code></p>
            </div>
            
            <p>🔐 <strong>Important Security Notes:</strong></p>
            <ul>
                <li>Please keep these credentials secure and confidential</li>
                <li>Do not share your login details with unauthorized persons</li>
                <li>Access is valid for the duration specified in your contract</li>
            </ul>
            
            <p>To access your album, please visit our client portal and use the credentials provided above.</p>
            
            <p>If you have any questions or need assistance accessing your photos, please don't hesitate to contact our support team.</p>
            
            <p>Thank you for choosing our photography services!</p>
            
            <p>Best regards,<br>
            <strong>Photography Team</strong><br>
            📧 support@example.com<br>
            📞 +1 (555) 123-4567</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; <?= date('Y') ?> Photography Studio. All rights reserved.</p>
        </div>
    </div>
</body>
</html>