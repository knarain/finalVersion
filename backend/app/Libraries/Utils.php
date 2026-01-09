<?php

namespace App\Libraries;

use Defuse\Crypto\Crypto;
use Defuse\Crypto\Key;
use CodeIgniter\Model;
use App\Models\CaptchaModel;

class Utils
{
    /* =====================================================
     * Standard API Response
     * ===================================================== */
    public static function formatApiResponse(
        $data = null,
        string $message = '',
        int $statusCode = 200
    ) {
        return service('response')
            ->setStatusCode($statusCode)
            ->setJSON([
                'results'    => $data,
                'message'    => $message,
                'error_code' => $statusCode,
            ]);
    }

    /* =====================================================
     * Authenticated User (Admin / User via Fernet)
     * ===================================================== */
    public static function getAuthenticatedUser($request = null, $tokenModel = null, array $filters = [])
    {
        // If tokenModel is provided, use album-specific token validation
        if ($tokenModel !== null) {
            $request = $request ?: service('request');
            $authHeader = $request->getHeaderLine('Authorization');
            
            if (!$authHeader) {
                return null;
            }
            
            $token = str_starts_with($authHeader, 'Bearer ') 
                ? substr($authHeader, 7) 
                : $authHeader;
            
            $conditions = array_merge(['token' => $token], $filters);
            $conditions['expires_at >'] = date('Y-m-d H:i:s');
            
            $tokenData = $tokenModel->where($conditions)->first();
            
            return $tokenData;
        }
        
        // Original admin/user token validation (NO EXPIRY CLEANUP)
        $request = service('request');
        $authHeader = $request->getHeaderLine('Authorization');

        if (! $authHeader) {
            return self::formatApiResponse(
                null,
                'Missing token',
                401
            );
        }

        // Bearer token support
        $token = str_starts_with($authHeader, 'Bearer ')
            ? substr($authHeader, 7)
            : $authHeader;

        try {
            $key = \Defuse\Crypto\Key::loadFromAsciiSafeString('def0000043592e7bc56f00ca4643a1e6a1d4b0cde5dabe89c84d7c4cba1894f2041cc2f3ffbe4f63b5b63b96f38bbdcf1230a4d002b951cb0ea51261822b40110d9847c9');

            $decrypted = \Defuse\Crypto\Crypto::decrypt($token, $key);
            $data = json_decode($decrypted, true);

            if (! isset($data['id'], $data['type'])) {
                throw new \Exception('Invalid token payload');
            }

            // ✅ ADMIN TOKEN (NO EXPIRY)
            if ($data['type'] === 'admin') {
                $model = new \App\Models\AdminModel();
                $admin = $model
                    ->where('id', $data['id'])
                    ->where('username', $data['username'] ?? null)
                    ->first();

                if (! $admin) {
                    return self::formatApiResponse(
                        null,
                        'Admin not found',
                        401
                    );
                }

                $admin['auth_type'] = 'admin';
                return $admin;
            }

            // ✅ USER TOKEN (NO EXPIRY)
            if ($data['type'] === 'user') {
                $model = new \App\Models\UserModel();
                $user = $model
                    ->where('id', $data['id'])
                    ->where('email', $data['email'] ?? null)
                    ->first();

                if (! $user) {
                    return self::formatApiResponse(
                        null,
                        'User not found',
                        401
                    );
                }

                $user['auth_type'] = 'user';
                return $user;
            }

            throw new \Exception('Unknown token type');

        } catch (\Throwable $e) {
            return self::formatApiResponse(
                null,
                'Invalid token: ' . $e->getMessage(),
                401
            );
        }
    }

    /* =====================================================
     * Pagination Utility (Reusable)
     * ===================================================== */
    public static function getPaginationData(
        Model $model,
        array $filters = [],
        int $pageNumber = 1,
        int $pageSize = 10,
        array $orderBy = [],
        ?string $keyword = null,
        array $keywordFields = [],
        ?string $singleDate = null,
        ?string $startDate = null,
        ?string $endDate = null,
        ?string $dateField = null,
        array $excludeIds = [],
        array $exclude = [],
        array $joinConditions = [],
        ?int $limit = null
    ): array {
        try {
            $builder = $model->builder();

            /* ---------- DATE FILTERS ---------- */
            if ($singleDate && $dateField) {
                $builder->where("DATE($dateField)", $singleDate);
            }

            if ($startDate && $endDate && $dateField) {
                $builder->where("$dateField >=", $startDate)
                        ->where("$dateField <=", $endDate);
            }

            /* ---------- BASIC FILTERS ---------- */
            foreach ($filters as $field => $value) {
                $builder->where($field, $value);
            }

            foreach ($exclude as $field => $value) {
                $builder->where("$field !=", $value);
            }

            if ($excludeIds) {
                $builder->whereNotIn('id', $excludeIds);
            }

            /* ---------- JOINS ---------- */
            foreach ($joinConditions as $join) {
                $builder->join(
                    $join['table'],
                    $join['condition'],
                    $join['type'] ?? 'left'
                );
            }

            /* ---------- KEYWORD SEARCH ---------- */
            if ($keyword && $keywordFields) {
                $builder->groupStart();
                foreach ($keywordFields as $field) {
                    $builder->orLike($field, $keyword);
                }
                $builder->groupEnd();
            }

            /* ---------- ORDER BY ---------- */
            foreach ($orderBy as $field => $dir) {
                $builder->orderBy($field, $dir);
            }

            /* ---------- LIMIT ---------- */
            if ($limit !== null) {
                $builder->limit($limit);
            }

            /* ---------- PAGINATION ---------- */
            $offset = ($pageNumber - 1) * $pageSize;
            $totalItems = $builder->countAllResults(false);

            $data = $builder
                ->limit($pageSize, $offset)
                ->get()
                ->getResultArray();

            return [
                'data' => $data,
                'pagination' => [
                    'page_number' => $pageNumber,
                    'page_size' => $pageSize,
                    'total_pages' => (int) ceil($totalItems / $pageSize),
                    'total_items' => $totalItems,
                ],
            ];

        } catch (\Throwable $e) {
            return [
                'data' => [],
                'pagination' => [
                    'page_number' => $pageNumber,
                    'page_size' => $pageSize,
                    'total_pages' => 0,
                    'total_items' => 0,
                ],
                'error' => $e->getMessage(),
            ];
        }
    }


  public static function decodeBase64(string $base64): array
    {
        if (!preg_match('/^data:image\/(\w+);base64,/', $base64, $matches)) {
            throw new \Exception('Invalid base64 image format');
        }

        $extension = strtolower($matches[1]);
        $data = substr($base64, strpos($base64, ',') + 1);

        $binary = base64_decode($data);
        if ($binary === false) {
            throw new \Exception('Base64 decode failed');
        }

        return [$binary, $extension];
    }

    /* ===============================
     * COMPRESS IMAGE
     * =============================== */
    public static function compressImage($image, int $quality = 70)
    {
        if (!$image) return null;

        imagepalettetotruecolor($image);
        imagealphablending($image, true);
        imagesavealpha($image, true);

        return $image;
    }

    /* ===============================
     * CONVERT TO WEBP
     * =============================== */
    public static function convertToWebp(string $binary, string $ext, string $destination): void
    {
        $image = imagecreatefromstring($binary);
        if (!$image) {
            throw new \Exception('Failed to create image from binary data');
        }

        // Resize if too large (for speed and size)
        $width = imagesx($image);
        $height = imagesy($image);
        $maxWidth = 1200;
        $maxHeight = 800;

        if ($width > $maxWidth || $height > $maxHeight) {
            $ratio = min($maxWidth / $width, $maxHeight / $height);
            $newWidth = (int)($width * $ratio);
            $newHeight = (int)($height * $ratio);

            $resized = imagecreatetruecolor($newWidth, $newHeight);
            imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            imagedestroy($image);
            $image = $resized;
        }

        $image = self::compressImage($image);

        // Start with lower quality for smaller files
        $quality = 60;
        if (!imagewebp($image, $destination, $quality)) {
            imagedestroy($image);
            throw new \Exception('WebP conversion failed');
        }

        // Check file size and adjust if needed
        $maxSize = 500 * 1024; // 500KB
        while (file_exists($destination) && filesize($destination) > $maxSize && $quality > 20) {
            $quality -= 10;
            imagewebp($image, $destination, $quality);
        }

        imagedestroy($image);
    }

    /* ===============================
     * PROCESS ONE OR MULTIPLE BASE64 IMAGES (FAST)
     * =============================== */
    public static function processBase64Images(
        array $base64Images,
        string $savePath,
        int $maxImages = 10
    ): array {
        if (count($base64Images) > $maxImages) {
            throw new \Exception("Maximum $maxImages images allowed");
        }

        if (!is_dir($savePath)) {
            mkdir($savePath, 0777, true);
        }

        $savedFiles = [];

        foreach ($base64Images as $index => $base64) {
            // Handle both formats: with and without data:image prefix
            if (strpos($base64, 'data:image') === 0) {
                [$binary, $ext] = self::decodeBase64($base64);
            } else {
                // Direct base64 without prefix
                $binary = base64_decode($base64);
                if ($binary === false) {
                    continue;
                }
                $ext = 'jpeg'; // Default to jpeg
            }

            $fileName = uniqid('img_', true) . '.webp';
            $destination = rtrim($savePath, '/') . '/' . $fileName;

            try {
                self::convertToWebp($binary, $ext, $destination);
                $savedFiles[] = $fileName;
            } catch (\Exception $e) {
                // Skip failed images, continue with others
                continue;
            }
        }

        return $savedFiles;
    }

    /* =====================================================
     * Send Email with Template Support
     * ===================================================== */
    public static function sendEmail(
        string $to,
        string $subject,
        string $body,
        ?string $template = null,
        array $templateData = [],
        ?string $attachment = null
    ): bool {
        try {
            $email = service('email');
            
            $email->setFrom('contactus@rashmiphotography.com', 'Rashmi Photography');
            $email->setTo($to);
            $email->setSubject($subject);
            
            if ($template) {
                $templatePath = APPPATH . 'Views/email_templates/' . $template . '.php';
                if (file_exists($templatePath)) {
                    $body = view('email_templates/' . $template, $templateData);
                } else {
                    log_message('error', 'Email template not found: ' . $templatePath);
                    return false;
                }
            }
            
            $email->setMessage($body);
            
            if ($attachment && file_exists($attachment)) {
                $email->attach($attachment);
            }
            
            $result = $email->send();
            if (!$result) {
                log_message('error', 'Email send failed: ' . $email->printDebugger());
            }
            return $result;
        } catch (\Throwable $e) {
            log_message('error', 'Email send exception: ' . $e->getMessage());
            return false;
        }
    }

    

    public static function generateCaptcha()
    {
        $captchaId = uniqid('cap_', true);
        $captchaText = strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 5));
        
        // Store in database instead of session for better CORS support
        $model = new \App\Models\CaptchaModel();
        $model->insert([
            'captcha_id' => $captchaId,
            'text' => $captchaText,
            'ip_address' => service('request')->getIPAddress(),
            'created_at' => date('Y-m-d H:i:s'),
            'expires_at' => date('Y-m-d H:i:s', time() + 300) // 5 minutes
        ]);
        
        // Don't return the actual CAPTCHA text, just the ID
        return self::formatApiResponse([
            'captcha_id' => $captchaId,
            'captcha_image' => self::generateCaptchaImage($captchaText)
        ], 'Captcha generated successfully');
    }

    /**
     * Generate a simple CAPTCHA image as SVG
     */
    public static function generateCaptchaImage($text)
    {
        $width = 150;
        $height = 60;
        
        // Create SVG
        $svg = "<svg width='{$width}' height='{$height}' xmlns='http://www.w3.org/2000/svg'>";
        
        // Background
        $svg .= "<rect width='{$width}' height='{$height}' fill='#f0f0f0'/>";
        
        // Add noise lines
        for ($i = 0; $i < 3; $i++) {
            $x1 = rand(0, $width);
            $y1 = rand(0, $height);
            $x2 = rand(0, $width);
            $y2 = rand(0, $height);
            $svg .= "<line x1='{$x1}' y1='{$y1}' x2='{$x2}' y2='{$y2}' stroke='#cccccc' stroke-width='1'/>";
        }
        
        // Add text with random styling
        $letters = str_split($text);
        $x = 12;
        foreach ($letters as $letter) {
            $rotation = rand(-10, 10);
            $y = rand(20, 40);
            $svg .= "<text x='{$x}' y='{$y}' font-size='22' font-weight='bold' fill='#333333' transform='rotate({$rotation} {$x} {$y})' font-family='Arial, sans-serif'>{$letter}</text>";
            $x += 24;
        }
        
        // Add more noise dots
        for ($i = 0; $i < 10; $i++) {
            $cx = rand(0, $width);
            $cy = rand(0, $height);
            $svg .= "<circle cx='{$cx}' cy='{$cy}' r='1' fill='#999999' opacity='0.5'/>";
        }
        
        $svg .= "</svg>";
        
        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }

    public static function verifyCaptcha($captchaId, $captchaText)
    {
        $model = new \App\Models\CaptchaModel();
        $ip = service('request')->getIPAddress();
        
        // Find captcha by ID and IP address
        $captcha = $model
            ->where('captcha_id', $captchaId)
            ->where('ip_address', $ip)
            ->where('expires_at >=', date('Y-m-d H:i:s'))
            ->first();
        
        if (!$captcha) {
            return 'Invalid captcha ID';
        }
        
        // Verify the captcha text
        if (strtoupper($captchaText) !== $captcha['text']) {
            // Delete the captcha so it can't be reused
            $model->delete($captcha['id']);
            return 'Invalid or expired captcha';
        }
        
        // Delete the captcha after successful verification (one-time use)
        $model->delete($captcha['id']);
        
        return true;
    }

    public static function checkRateLimit()
    {
        $ip = service('request')->getIPAddress();
        $model = new \App\Models\LoginAttemptModel();

        $row = $model->where('ip_address', $ip)->first();

        if ($row && $row['locked_until'] && strtotime($row['locked_until']) > time()) {
            return 'Too many attempts. Try again later.';
        }

        return true;
    }

    public static function recordFailedLogin()
    {
        $ip = service('request')->getIPAddress();
        $model = new \App\Models\LoginAttemptModel();

        $row = $model->where('ip_address', $ip)->first();
        $now = date('Y-m-d H:i:s');

        if (! $row) {
            $model->insert([
                'ip_address' => $ip,
                'attempts'   => 1,
                'created_at'=> $now,
                'updated_at'=> $now
            ]);
            return;
        }

        $attempts = $row['attempts'] + 1;
        $lock = null;

        if ($attempts >= 5) {
            $lock = date('Y-m-d H:i:s', time() + 900); // 15 min
        }

        $model->update($row['id'], [
            'attempts'     => $attempts,
            'locked_until' => $lock,
            'updated_at'   => $now
        ]);
    }

    public static function resetLoginAttempts()
    {
        $ip = service('request')->getIPAddress();
        (new \App\Models\LoginAttemptModel())->where('ip_address', $ip)->delete();
    }

public static function send2FACode(int $userId, string $email)
{
    $code = random_int(100000, 999999);
    $model = new \App\Models\TwoFactorCodeModel();

    $model->where('user_id', $userId)->delete();

    $model->insert([
        'user_id'   => $userId,
        'code'      => $code,
        'expires_at'=> date('Y-m-d H:i:s', time() + 600),
        'created_at'=> date('Y-m-d H:i:s')
    ]);

    service('email')
        ->setTo($email)
        ->setSubject('Your 2FA Code')
        ->setMessage("Your verification code is: {$code}")
        ->send();
}

    public static function verify2FA(int $userId, string $code)
    {
        $model = new \App\Models\TwoFactorCodeModel();
        $row = $model->where('user_id', $userId)->first();

        if (! $row) return '2FA code not found';
        if (strtotime($row['expires_at']) < time()) return '2FA expired';
        if ($row['code'] !== $code) return 'Invalid 2FA code';

        $model->delete($row['id']);
        return true;
    }
    
    public static function checkPermission(
        int $roleId,
        string $moduleSlug,
        string $permission
    ): bool {
        $db = \Config\Database::connect();

        return (bool) $db->table('role_module_permissions rmp')
            ->join('modules m', 'm.id = rmp.module_id')
            ->join('permissions p', 'p.id = rmp.permission_id')
            ->where([
                'rmp.role_id' => $roleId,
                'm.slug' => $moduleSlug,
                'p.name' => $permission
            ])
            ->countAllResults();
    }

}
