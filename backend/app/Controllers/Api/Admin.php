<?php


namespace App\Controllers\Api;
use App\Controllers\BaseController;
use App\Models\AdminModel;
use App\Libraries\Utils;
use CodeIgniter\HTTP\ResponseInterface;
use Defuse\Crypto\Crypto;
use Defuse\Crypto\Key;

class Admin extends BaseController
{
    protected AdminModel $adminModel;

    public function __construct()
    {
        $this->adminModel = new AdminModel();
    }

    /**
     * Admin login
     * POST /api/admin/login
     * Body: { "username": "...", "password": "..." }
     */
    // public function login()
    // {
    //     $json = $this->request->getJSON(true);
    //     $username = $json['username'] ?? null;
    //     $password = $json['password'] ?? null;

    //     if (! $username || ! $password) {
    //         return Utils::formatApiResponse(
    //             null,
    //             'Username and password are required',
    //             ResponseInterface::HTTP_BAD_REQUEST
    //         );
    //     }

    //     $admin = $this->adminModel
    //         ->where('username', $username)
    //         ->first();

    //     if (! $admin || ! password_verify($password, $admin['password_hash'])) {
    //         return Utils::formatApiResponse(
    //             null,
    //             'Invalid credentials',
    //             ResponseInterface::HTTP_UNAUTHORIZED
    //         );
    //     }

    //     /** 🔐 Generate Fernet token */
    //     try {
    //         $key = Key::loadFromAsciiSafeString('def0000043592e7bc56f00ca4643a1e6a1d4b0cde5dabe89c84d7c4cba1894f2041cc2f3ffbe4f63b5b63b96f38bbdcf1230a4d002b951cb0ea51261822b40110d9847c9');

    //         $payload = json_encode([
    //             'id'       => $admin['id'],
    //             'username' => $admin['username'],
    //             'type'     => 'admin',
    //             'iat'      => time(),
    //         ]);

    //         $token = Crypto::encrypt($payload, $key);

    //     } catch (\Throwable $e) {
    //         return Utils::formatApiResponse(
    //             null,
    //             'Token generation failed',
    //             ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
    //         );
    //     }

    //     return Utils::formatApiResponse(
    //         [
    //             'token' => $token,
    //             'admin' => [
    //                 'id'       => $admin['id'],
    //                 'username' => $admin['username'],
    //             ],
    //         ],
    //         'Login successful',
    //         ResponseInterface::HTTP_OK
    //     );
    // }
    public function captcha()
    {
        return Utils::generateCaptcha();
    }

    /**
     * Debug endpoint - check if admin exists (remove in production)
     */
    public function checkAdmin($username)
    {
        $admin = $this->adminModel->where('username', $username)->first();
        
        if (!$admin) {
            return Utils::formatApiResponse(null, 'Admin not found', 404);
        }

        return Utils::formatApiResponse([
            'id' => $admin['id'],
            'username' => $admin['username'],
            'email' => $admin['email'] ?? null,
            'two_factor_enabled' => $admin['two_factor_enabled'] ?? false,
            'password_hash_exists' => !empty($admin['password_hash']),
        ], 'Admin found');
    }

    public function login()
    {
        $json = $this->request->getJSON(true);

        $username = $json['username'] ?? null;
        $password = $json['password'] ?? null;
        $captchaId = $json['captcha_id'] ?? null;
        $captchaText = $json['captcha_text'] ?? null;
        $twoFactorCode = $json['2fa_code'] ?? null;

        // When already past 2FA, only need 2FA code (no need to re-check username/password/captcha)
        $onlyVerifying2FA = !empty($twoFactorCode) && empty($username);

        if (!$onlyVerifying2FA && (! $username || ! $password || ! $captchaId || ! $captchaText)) {
            return Utils::formatApiResponse(null, 'Missing fields', 400);
        }

        // 🔒 Rate limit
        $rate = Utils::checkRateLimit();
        if ($rate !== true) {
            return Utils::formatApiResponse(null, $rate, 429);
        }

        // Only verify CAPTCHA if not just verifying 2FA
        if (!$onlyVerifying2FA) {
            // 🧠 CAPTCHA
            $captcha = Utils::verifyCaptcha($captchaId, $captchaText);
            if ($captcha !== true) {
                Utils::recordFailedLogin();
                return Utils::formatApiResponse(null, $captcha, 400);
            }

            $admin = $this->adminModel->where('username', $username)->first();
            if (! $admin || ! password_verify($password, $admin['password_hash'])) {
                Utils::recordFailedLogin();
                $ip = service('request')->getIPAddress();
                $attempts = $this->getAttemptsLeft($ip);
                return Utils::formatApiResponse(
                    ['attempts_left' => $attempts],
                    'Invalid credentials',
                    401
                );
            }

            Utils::resetLoginAttempts();

            // 🔐 2FA enabled?
            if ($admin['two_factor_enabled'] ?? false) {
                if (! $twoFactorCode) {
                    Utils::send2FACode($admin['id'], $admin['email']);
                    return Utils::formatApiResponse(
                        ['requires_2fa' => true, 'admin_id' => $admin['id']],
                        '2FA code sent',
                        200
                    );
                }
            }
        } else {
            // Verifying 2FA only - need admin_id from session/request
            $adminId = $json['admin_id'] ?? null;
            if (!$adminId) {
                return Utils::formatApiResponse(null, 'Admin ID required for 2FA verification', 400);
            }
            $admin = $this->adminModel->find($adminId);
            if (!$admin) {
                return Utils::formatApiResponse(null, 'Admin not found', 404);
            }
        }

        // Verify 2FA if code provided
        if ($twoFactorCode) {
            $verify = Utils::verify2FA($admin['id'], $twoFactorCode);
            if ($verify !== true) {
                Utils::recordFailedLogin(); // Record the failed 2FA attempt
                $ip = service('request')->getIPAddress();
                $attempts = $this->getAttemptsLeft($ip);
                return Utils::formatApiResponse(
                    ['attempts_left' => $attempts],
                    $verify,
                    400
                );
            }
        }

        // 🔑 Token
        try {
            $key = \Defuse\Crypto\Key::loadFromAsciiSafeString('def0000043592e7bc56f00ca4643a1e6a1d4b0cde5dabe89c84d7c4cba1894f2041cc2f3ffbe4f63b5b63b96f38bbdcf1230a4d002b951cb0ea51261822b40110d9847c9');
            $token = \Defuse\Crypto\Crypto::encrypt(
                json_encode([
                    'id'       => $admin['id'],
                    'username' => $admin['username'],
                    'type'     => 'admin',
                    'iat'      => time()
                ]),
                $key
            );
        } catch (\Throwable $e) {
            return Utils::formatApiResponse(
                null,
                'Token generation failed',
                500
            );
        }

        // Set token in HTTP-only cookie
        $response = service('response');
        $response->setCookie([
            'name'     => 'adminToken',
            'value'    => $token,
            'expire'   => time() + (7 * 24 * 60 * 60), // 7 days
            'path'     => '/',
            'domain'   => '',
            'secure'   => false, // Set to true if using HTTPS
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        return Utils::formatApiResponse(
            [
                'token' => $token,
                'admin' => [
                    'id'       => $admin['id'],
                    'username' => $admin['username'],
                ]
            ],
            'Login successful',
            200
        );
    }

    /**
     * Example: protected admin endpoint
     * GET /api/admin/profile
     * Header: Authorization: Bearer <token>
     */
    public function profile()
    {
        $admin = Utils::getAuthenticatedUser();

        // If auth fails, Utils already returned a Response
        if ($admin instanceof \CodeIgniter\HTTP\Response) {
            return $admin;
        }

        return Utils::formatApiResponse(
            $admin,
            'Admin profile fetched successfully',
            ResponseInterface::HTTP_OK
        );
    }

        public function changePassword()
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? '') !== 'admin') {
            return Utils::formatApiResponse(null, 'Admin access required', 403);
        }

        $payload = $this->request->getJSON(true);
        if (!$payload) {
            return Utils::formatApiResponse(null, 'Invalid JSON payload', 400);
        }

        $currentPassword = $payload['currentPassword'] ?? null;
        $newPassword = $payload['newPassword'] ?? null;

        if (!$currentPassword || !$newPassword) {
            return Utils::formatApiResponse(null, 'Current password and new password are required', 400);
        }

        if (strlen($newPassword) < 6) {
            return Utils::formatApiResponse(null, 'New password must be at least 6 characters', 400);
        }

        $admin = $this->adminModel->find($auth['id']);
        if (!$admin || !password_verify($currentPassword, $admin['password_hash'])) {
            return Utils::formatApiResponse(null, 'Current password is incorrect', 401);
        }

        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

        $updateData = [
            'password_hash' => $hashedPassword,
            'watch_word' => $newPassword
        ];

        if (!$this->adminModel->update($auth['id'], $updateData)) {
            return Utils::formatApiResponse(null, 'Password update failed', 500);
        }

        return Utils::formatApiResponse(
            null,
            'Password changed successfully'
        );
    }

    /**
     * Get admin profile with settings
     * GET /api/admin/profile-settings
     * Header: Authorization: Bearer <token>
     */
    public function profileSettings()
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? '') !== 'admin') {
            return Utils::formatApiResponse(null, 'Admin access required', 403);
        }

        $admin = $this->adminModel->find($auth['id']);
        if (!$admin) {
            return Utils::formatApiResponse(null, 'Admin not found', 404);
        }

        return Utils::formatApiResponse(
            [
                'id' => (int) $admin['id'],
                'username' => $admin['username'],
                'email' => $admin['email'] ?? null,
                'two_factor_enabled' => (bool) ($admin['two_factor_enabled'] ?? false),
                'created_at' => $admin['created_at'] ?? null,
                'updated_at' => $admin['updated_at'] ?? null,
            ],
            'Profile settings fetched successfully'
        );
    }

    /**
     * Update admin profile
     * PUT /api/admin/profile-update
     * Header: Authorization: Bearer <token>
     */
    public function profileUpdate()
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? '') !== 'admin') {
            return Utils::formatApiResponse(null, 'Admin access required', 403);
        }

        $payload = $this->request->getJSON(true);
        if (!$payload) {
            return Utils::formatApiResponse(null, 'Invalid JSON payload', 400);
        }

        $email = trim($payload['email'] ?? '');

        if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return Utils::formatApiResponse(null, 'Invalid email format', 400);
        }

        $updateData = [];
        if ($email) {
            $updateData['email'] = $email;
        }

        if (!empty($updateData)) {
            if (!$this->adminModel->update($auth['id'], $updateData)) {
                return Utils::formatApiResponse(null, 'Profile update failed', 500);
            }
        }

        $admin = $this->adminModel->find($auth['id']);

        return Utils::formatApiResponse(
            [
                'id' => (int) $admin['id'],
                'username' => $admin['username'],
                'email' => $admin['email'] ?? null,
                'two_factor_enabled' => (bool) ($admin['two_factor_enabled'] ?? false),
            ],
            'Profile updated successfully'
        );
    }

    /**
     * Enable 2FA
     * POST /api/admin/2fa/enable
     * Header: Authorization: Bearer <token>
     */
    public function enable2FA()
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? '') !== 'admin') {
            return Utils::formatApiResponse(null, 'Admin access required', 403);
        }

        $updateData = [
            'two_factor_enabled' => true,
        ];

        if (!$this->adminModel->update($auth['id'], $updateData)) {
            return Utils::formatApiResponse(null, '2FA enable failed', 500);
        }

        return Utils::formatApiResponse(
            [
                'two_factor_enabled' => true,
            ],
            '2FA enabled successfully'
        );
    }

    /**
     * Get remaining login attempts
     */
    private function getAttemptsLeft($ip)
    {
        $model = new \App\Models\LoginAttemptModel();
        $row = $model->where('ip_address', $ip)->first();
        if (!$row) return 5; // Max 5 attempts
        return max(0, 5 - $row['attempts']);
    }

    /**
     * Disable 2FA
     * POST /api/admin/2fa/disable
     * Header: Authorization: Bearer <token>
     */
    public function disable2FA()
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? '') !== 'admin') {
            return Utils::formatApiResponse(null, 'Admin access required', 403);
        }

        $updateData = [
            'two_factor_enabled' => false,
        ];

        if (!$this->adminModel->update($auth['id'], $updateData)) {
            return Utils::formatApiResponse(null, '2FA disable failed', 500);
        }

        return Utils::formatApiResponse(
            [
                'two_factor_enabled' => false,
            ],
            '2FA disabled successfully'
        );
    }
}
