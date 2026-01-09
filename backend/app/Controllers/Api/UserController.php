<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Libraries\Utils;
use App\Models\AdminModel;
use App\Models\RoleModel;
use CodeIgniter\HTTP\ResponseInterface;

class UserController extends BaseController
{
    protected AdminModel $adminModel;
    protected RoleModel $roleModel;

    public function __construct()
    {
        $this->adminModel = new AdminModel();
        $this->roleModel = new RoleModel();
    }

    /**
     * GET: List all admin users with pagination
     * GET /api/users?page=1&per_page=10
     */
    public function index()
    {
        try {
            $page = $this->request->getVar('page') ?? 1;
            $perPage = $this->request->getVar('per_page') ?? 10;
            $offset = ($page - 1) * $perPage;

            $users = $this->adminModel->getPaginatedAdmins($perPage, $offset);
            $total = $this->adminModel->getTotalAdmins();

            return Utils::formatApiResponse([
                'users' => $users,
                'pagination' => [
                    'page' => (int)$page,
                    'per_page' => (int)$perPage,
                    'total' => $total,
                    'total_pages' => ceil($total / $perPage)
                ]
            ], 'Users fetched successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error fetching users: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * GET: Get single user by ID
     * GET /api/users/{id}
     */
    public function show($id)
    {
        try {
            $user = $this->adminModel->getAdminWithRole($id);
            if (!$user) {
                return Utils::formatApiResponse(null, 'User not found', ResponseInterface::HTTP_NOT_FOUND);
            }

            return Utils::formatApiResponse($user, 'User fetched successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error fetching user: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * POST: Create new admin user
     * POST /api/users
     * Body: { "username": "string", "email": "string", "password": "string", "role_id": int }
     */
    public function create()
    {
        try {
            $payload = $this->request->getJSON(true);

            // Validation
            if (empty($payload['username']) || empty($payload['password'])) {
                return Utils::formatApiResponse(
                    null,
                    'Username and password are required',
                    ResponseInterface::HTTP_BAD_REQUEST
                );
            }

            if (!empty($payload['role_id'])) {
                if (!$this->roleModel->find($payload['role_id'])) {
                    return Utils::formatApiResponse(
                        null,
                        'Role does not exist',
                        ResponseInterface::HTTP_BAD_REQUEST
                    );
                }
            }

            // Check if username already exists
            $existing = $this->adminModel->where('username', $payload['username'])->first();
            if ($existing) {
                return Utils::formatApiResponse(
                    null,
                    'Username already exists',
                    ResponseInterface::HTTP_CONFLICT
                );
            }

            // Check if email already exists (if provided)
            if (!empty($payload['email'])) {
                $existingEmail = $this->adminModel->where('email', $payload['email'])->first();
                if ($existingEmail) {
                    return Utils::formatApiResponse(
                        null,
                        'Email already exists',
                        ResponseInterface::HTTP_CONFLICT
                    );
                }
            }

            $data = [
                'username' => trim($payload['username']),
                'email' => $payload['email'] ?? null,
                'password_hash' => password_hash($payload['password'], PASSWORD_BCRYPT),
                'role_id' => $payload['role_id'] ?? null,
                'is_active' => 1,
                'two_factor_enabled' => 0
            ];

            $userId = $this->adminModel->insert($data);

            $user = $this->adminModel->getAdminWithRole($userId);

            return Utils::formatApiResponse(
                $user,
                'User created successfully',
                ResponseInterface::HTTP_CREATED
            );
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error creating user: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * PUT: Update user details (except password)
     * PUT /api/users/{id}
     * Body: { "email": "string", "role_id": int }
     */
    public function update($id)
    {
        try {
            $user = $this->adminModel->find($id);
            if (!$user) {
                return Utils::formatApiResponse(null, 'User not found', ResponseInterface::HTTP_NOT_FOUND);
            }

            $payload = $this->request->getJSON(true);

            $data = [];

            // Update email if provided and different
            if (!empty($payload['email']) && $payload['email'] !== $user['email']) {
                $existingEmail = $this->adminModel->where('email', $payload['email'])->first();
                if ($existingEmail) {
                    return Utils::formatApiResponse(
                        null,
                        'Email already in use by another user',
                        ResponseInterface::HTTP_CONFLICT
                    );
                }
                $data['email'] = $payload['email'];
            }

            // Update role if provided
            if (isset($payload['role_id'])) {
                if ($payload['role_id'] !== null && !$this->roleModel->find($payload['role_id'])) {
                    return Utils::formatApiResponse(
                        null,
                        'Role does not exist',
                        ResponseInterface::HTTP_BAD_REQUEST
                    );
                }
                $data['role_id'] = $payload['role_id'];
            }

            if (!empty($data)) {
                $this->adminModel->update($id, $data);
            }

            return Utils::formatApiResponse(
                $this->adminModel->getAdminWithRole($id),
                'User updated successfully'
            );
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error updating user: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * POST: Change user password
     * POST /api/users/{id}/change-password
     * Body: { "old_password": "string", "new_password": "string" }
     */
    public function changePassword($id)
    {
        try {
            $user = $this->adminModel->find($id);
            if (!$user) {
                return Utils::formatApiResponse(null, 'User not found', ResponseInterface::HTTP_NOT_FOUND);
            }

            $payload = $this->request->getJSON(true);

            if (empty($payload['old_password']) || empty($payload['new_password'])) {
                return Utils::formatApiResponse(
                    null,
                    'Old password and new password are required',
                    ResponseInterface::HTTP_BAD_REQUEST
                );
            }

            // Verify old password
            if (!password_verify($payload['old_password'], $user['password_hash'])) {
                return Utils::formatApiResponse(
                    null,
                    'Old password is incorrect',
                    ResponseInterface::HTTP_UNAUTHORIZED
                );
            }

            // Validate new password strength (at least 8 characters)
            if (strlen($payload['new_password']) < 8) {
                return Utils::formatApiResponse(
                    null,
                    'New password must be at least 8 characters',
                    ResponseInterface::HTTP_BAD_REQUEST
                );
            }

            // Update password
            $this->adminModel->update($id, [
                'password_hash' => password_hash($payload['new_password'], PASSWORD_BCRYPT)
            ]);

            return Utils::formatApiResponse(null, 'Password changed successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error changing password: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * POST: Reset user password (by admin)
     * POST /api/users/{id}/reset-password
     * Body: { "new_password": "string" }
     */
    public function resetPassword($id)
    {
        try {
            $user = $this->adminModel->find($id);
            if (!$user) {
                return Utils::formatApiResponse(null, 'User not found', ResponseInterface::HTTP_NOT_FOUND);
            }

            $payload = $this->request->getJSON(true);

            if (empty($payload['new_password'])) {
                return Utils::formatApiResponse(
                    null,
                    'New password is required',
                    ResponseInterface::HTTP_BAD_REQUEST
                );
            }

            // Validate password strength
            if (strlen($payload['new_password']) < 8) {
                return Utils::formatApiResponse(
                    null,
                    'Password must be at least 8 characters',
                    ResponseInterface::HTTP_BAD_REQUEST
                );
            }

            // Update password
            $this->adminModel->update($id, [
                'password_hash' => password_hash($payload['new_password'], PASSWORD_BCRYPT)
            ]);

            return Utils::formatApiResponse(null, 'Password reset successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error resetting password: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * PATCH: Assign role to user
     * PATCH /api/users/{id}/assign-role
     * Body: { "role_id": int }
     */
    public function assignRole($id)
    {
        try {
            $user = $this->adminModel->find($id);
            if (!$user) {
                return Utils::formatApiResponse(null, 'User not found', ResponseInterface::HTTP_NOT_FOUND);
            }

            $payload = $this->request->getJSON(true);

            if (empty($payload['role_id'])) {
                return Utils::formatApiResponse(
                    null,
                    'role_id is required',
                    ResponseInterface::HTTP_BAD_REQUEST
                );
            }

            if (!$this->roleModel->find($payload['role_id'])) {
                return Utils::formatApiResponse(
                    null,
                    'Role does not exist',
                    ResponseInterface::HTTP_NOT_FOUND
                );
            }

            $this->adminModel->assignRole($id, $payload['role_id']);

            return Utils::formatApiResponse(
                $this->adminModel->getAdminWithRole($id),
                'Role assigned successfully'
            );
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error assigning role: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * PATCH: Toggle user active status
     * PATCH /api/users/{id}/toggle-status
     */
    public function toggleStatus($id)
    {
        try {
            $user = $this->adminModel->find($id);
            if (!$user) {
                return Utils::formatApiResponse(null, 'User not found', ResponseInterface::HTTP_NOT_FOUND);
            }

            $newStatus = $user['is_active'] ? 0 : 1;
            $this->adminModel->setActive($id, $newStatus);

            return Utils::formatApiResponse(
                ['id' => $id, 'is_active' => $newStatus],
                'User status updated successfully'
            );
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error updating status: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * DELETE: Delete user
     * DELETE /api/users/{id}
     */
    public function delete($id)
    {
        try {
            $user = $this->adminModel->find($id);
            if (!$user) {
                return Utils::formatApiResponse(null, 'User not found', ResponseInterface::HTTP_NOT_FOUND);
            }

            // Prevent deletion of super admin (optional check)
            // if ($user['id'] === 1) {
            //     return Utils::formatApiResponse(null, 'Cannot delete super admin', 403);
            // }

            $this->adminModel->delete($id);

            return Utils::formatApiResponse(null, 'User deleted successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error deleting user: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * GET: Get all active users
     * GET /api/users/status/active
     */
    public function getActiveUsers()
    {
        try {
            $users = $this->adminModel->getActiveAdmins();
            return Utils::formatApiResponse($users, 'Active users fetched successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error fetching active users: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
