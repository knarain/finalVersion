<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Libraries\Utils;
use App\Models\{
    RoleModel,
    ModuleModel,
    PermissionModel,
    RoleModulePermissionModel
};
use CodeIgniter\HTTP\ResponseInterface;

class PermissionController extends BaseController
{
    protected RoleModel $roleModel;
    protected ModuleModel $moduleModel;
    protected PermissionModel $permissionModel;
    protected RoleModulePermissionModel $rmpModel;

    public function __construct()
    {
        $this->roleModel = new RoleModel();
        $this->moduleModel = new ModuleModel();
        $this->permissionModel = new PermissionModel();
        $this->rmpModel = new RoleModulePermissionModel();
    }

    /**
     * GET: Get all roles, modules, and permissions with assignments
     * GET /api/permissions
     */
    public function index()
    {
        try {
            $roles = $this->roleModel->findAll();
            $modules = $this->moduleModel->getMenuTree();
            $permissions = $this->permissionModel->findAll();

            $map = [];
            foreach ($this->rmpModel->findAll() as $row) {
                if (!isset($map[$row['role_id']])) {
                    $map[$row['role_id']] = [];
                }
                if (!isset($map[$row['role_id']][$row['module_id']])) {
                    $map[$row['role_id']][$row['module_id']] = [];
                }
                $map[$row['role_id']][$row['module_id']][] = $row['permission_id'];
            }

            return Utils::formatApiResponse([
                'roles' => $roles,
                'modules' => $modules,
                'permissions' => $permissions,
                'assigned' => $map
            ], 'Permissions fetched successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error fetching permissions: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * GET: Get permissions for a specific role
     * GET /api/permissions/role/{role_id}
     */
    public function getRolePermissions($roleId)
    {
        try {
            $role = $this->roleModel->find($roleId);
            if (!$role) {
                return Utils::formatApiResponse(null, 'Role not found', ResponseInterface::HTTP_NOT_FOUND);
            }

            $permissions = $this->rmpModel->getModulePermissions($roleId, null);
            $modules = $this->moduleModel->getAccessibleModules($roleId);

            return Utils::formatApiResponse([
                'role' => $role,
                'permissions' => $permissions,
                'modules' => $modules
            ], 'Role permissions fetched');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Error: ' . $e->getMessage(), ResponseInterface::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * POST: Assign permissions to a role for a module
     * POST /api/permissions/assign
     * Body: { "role_id": int, "module_id": int, "permission_ids": [int] }
     */
    public function assign()
    {
        try {
            $payload = $this->request->getJSON(true);

            if (empty($payload['role_id']) || empty($payload['module_id'])) {
                return Utils::formatApiResponse(
                    null,
                    'role_id and module_id are required',
                    ResponseInterface::HTTP_BAD_REQUEST
                );
            }

            $roleId = $payload['role_id'];
            $moduleId = $payload['module_id'];
            $permissionIds = $payload['permission_ids'] ?? [];

            // Verify role exists
            if (!$this->roleModel->find($roleId)) {
                return Utils::formatApiResponse(null, 'Role not found', ResponseInterface::HTTP_NOT_FOUND);
            }

            // Verify module exists
            if (!$this->moduleModel->find($moduleId)) {
                return Utils::formatApiResponse(null, 'Module not found', ResponseInterface::HTTP_NOT_FOUND);
            }

            // Remove old permissions for this module
            $this->rmpModel->removeModulePermissions($roleId, $moduleId);

            // Add new permissions if provided
            if (!empty($permissionIds)) {
                $this->rmpModel->addPermissions($roleId, $moduleId, $permissionIds);
            }

            return Utils::formatApiResponse(
                null,
                'Permissions assigned successfully to role'
            );
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error assigning permissions: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * POST: Bulk assign permissions to role for multiple modules
     * POST /api/permissions/assign-bulk
     * Body: { "role_id": int, "assignments": [{"module_id": int, "permission_ids": [int]}] }
     */
    public function assignBulk()
    {
        try {
            $payload = $this->request->getJSON(true);

            if (empty($payload['role_id']) || empty($payload['assignments'])) {
                return Utils::formatApiResponse(
                    null,
                    'role_id and assignments array are required',
                    ResponseInterface::HTTP_BAD_REQUEST
                );
            }

            $roleId = $payload['role_id'];
            $assignments = $payload['assignments'];

            // Verify role exists
            if (!$this->roleModel->find($roleId)) {
                return Utils::formatApiResponse(null, 'Role not found', ResponseInterface::HTTP_NOT_FOUND);
            }

            // Clear all existing permissions for this role
            $this->db->table('role_module_permissions')->where('role_id', $roleId)->delete();

            // Add new permissions
            foreach ($assignments as $assignment) {
                $moduleId = $assignment['module_id'] ?? null;
                $permissionIds = $assignment['permission_ids'] ?? [];

                if (!$moduleId) continue;

                if (!$this->moduleModel->find($moduleId)) {
                    continue;
                }

                if (!empty($permissionIds)) {
                    $this->rmpModel->addPermissions($roleId, $moduleId, $permissionIds);
                }
            }

            return Utils::formatApiResponse(null, 'Bulk permissions assigned successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error in bulk assignment: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * DELETE: Remove specific permission from role
     * DELETE /api/permissions/{role_id}/{module_id}/{permission_id}
     */
    public function removePermission($roleId, $moduleId, $permissionId)
    {
        try {
            $this->rmpModel->where([
                'role_id' => $roleId,
                'module_id' => $moduleId,
                'permission_id' => $permissionId
            ])->delete();

            return Utils::formatApiResponse(null, 'Permission removed successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error removing permission: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * POST: Check if user has permission
     * POST /api/permissions/check
     * Body: { "user_id": int, "module_id": int, "permission_id": int }
     */
    public function checkPermission()
    {
        try {
            $payload = $this->request->getJSON(true);

            if (empty($payload['role_id']) || empty($payload['module_id']) || empty($payload['permission_id'])) {
                return Utils::formatApiResponse(
                    null,
                    'role_id, module_id, and permission_id are required',
                    ResponseInterface::HTTP_BAD_REQUEST
                );
            }

            $hasPermission = $this->rmpModel->hasPermission(
                $payload['role_id'],
                $payload['module_id'],
                $payload['permission_id']
            );

            return Utils::formatApiResponse([
                'has_permission' => $hasPermission
            ], 'Permission check completed');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error checking permission: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
