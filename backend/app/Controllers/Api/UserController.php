<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Libraries\Utils;
use App\Models\AdminModel;
use App\Models\RoleModel;
use App\Helpers\ActionLogHelper;
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

    public function index()
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Users', 'READ')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        try {
            $page = (int)($this->request->getVar('page') ?? 1);
            $perPage = (int)($this->request->getVar('per_page') ?? 10);
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

    public function create()
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Users', 'CREATE')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        try {
            $payload = $this->request->getJSON(true);

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

            $existing = $this->adminModel->where('username', $payload['username'])->first();
            if ($existing) {
                return Utils::formatApiResponse(
                    null,
                    'Username already exists',
                    ResponseInterface::HTTP_CONFLICT
                );
            }

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

            ActionLogHelper::logAction(
                'Created a User',
                "Admin created user: {$user['username']} with email: {$user['email']}",
                'Admin',
                $userId,
                $auth['id']
            );

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

    public function update($id)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Users', 'UPDATE')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        try {
            $user = $this->adminModel->find($id);
            if (!$user) {
                return Utils::formatApiResponse(null, 'User not found', ResponseInterface::HTTP_NOT_FOUND);
            }

            $payload = $this->request->getJSON(true);
            $data = [];

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
                
                ActionLogHelper::logAction(
                    'Updated a User',
                    "Admin updated user ID: {$id} with data: " . json_encode($data),
                    'Admin',
                    $id,
                    $auth['id']
                );
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

            if (!password_verify($payload['old_password'], $user['password_hash'])) {
                return Utils::formatApiResponse(
                    null,
                    'Old password is incorrect',
                    ResponseInterface::HTTP_UNAUTHORIZED
                );
            }

            if (strlen($payload['new_password']) < 8) {
                return Utils::formatApiResponse(
                    null,
                    'New password must be at least 8 characters',
                    ResponseInterface::HTTP_BAD_REQUEST
                );
            }

            $this->adminModel->update($id, [
                'password_hash' => password_hash($payload['new_password'], PASSWORD_BCRYPT)
            ]);

            $auth = Utils::getAuthenticatedUser();
            if (!($auth instanceof ResponseInterface)) {
                ActionLogHelper::logAction(
                    'Changed Password',
                    "User {$user['username']} changed their password",
                    'Admin',
                    $id,
                    $auth['id'] ?? null
                );
            }

            return Utils::formatApiResponse(null, 'Password changed successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error changing password: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    public function resetPassword($id)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Users', 'UPDATE')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

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

            if (strlen($payload['new_password']) < 6) {
                return Utils::formatApiResponse(
                    null,
                    'Password must be at least 6 characters',
                    ResponseInterface::HTTP_BAD_REQUEST
                );
            }

            $this->adminModel->update($id, [
                'password_hash' => password_hash($payload['new_password'], PASSWORD_BCRYPT),
                'watch_word' => $payload['new_password']
            ]);

            ActionLogHelper::logAction(
                'Reset User Password',
                "Admin reset password for user: {$user['username']}",
                'Admin',
                $id,
                $auth['id']
            );

            return Utils::formatApiResponse(null, 'Password reset successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error resetting password: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    public function assignRole($id)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Users', 'UPDATE')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

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

            ActionLogHelper::logAction(
                'Assigned Role to User',
                "Admin assigned role ID {$payload['role_id']} to user: {$user['username']}",
                'Admin',
                $id,
                $auth['id']
            );

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

    public function toggleStatus($id)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Users', 'UPDATE')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        try {
            $user = $this->adminModel->find($id);
            if (!$user) {
                return Utils::formatApiResponse(null, 'User not found', ResponseInterface::HTTP_NOT_FOUND);
            }

            $newStatus = $user['is_active'] ? 0 : 1;
            $this->adminModel->setActive($id, $newStatus);

            ActionLogHelper::logAction(
                'Toggled User Status',
                "Admin toggled user {$user['username']} status to: " . ($newStatus ? 'Active' : 'Inactive'),
                'Admin',
                $id,
                $auth['id']
            );

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

    public function delete($id)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        $roleId = $auth['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Users', 'DELETE')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        try {
            $user = $this->adminModel->find($id);
            if (!$user) {
                return Utils::formatApiResponse(null, 'User not found', ResponseInterface::HTTP_NOT_FOUND);
            }

            $this->adminModel->delete($id);

            ActionLogHelper::logAction(
                'Deleted a User',
                "Admin deleted user: {$user['username']} with email: {$user['email']}",
                'Admin',
                $id,
                $auth['id']
            );

            return Utils::formatApiResponse(null, 'User deleted successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error deleting user: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

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
