<?php

namespace App\Libraries;

use App\Models\AdminModel;
use App\Models\RoleModel;
use App\Models\RoleModulePermissionModel;

class PermissionHelper
{
    protected RoleModel $roleModel;
    protected RoleModulePermissionModel $rmpModel;
    protected AdminModel $adminModel;

    public function __construct()
    {
        $this->roleModel = new RoleModel();
        $this->rmpModel = new RoleModulePermissionModel();
        $this->adminModel = new AdminModel();
    }

    /**
     * Check if an admin user has permission to access a module with a specific action
     * 
     * @param int $adminId
     * @param int $moduleId
     * @param int $permissionId
     * @return bool
     */
    public function hasPermission($adminId, $moduleId, $permissionId)
    {
        // Get admin with role
        $admin = $this->adminModel->find($adminId);
        if (!$admin || !$admin['is_active']) {
            return false;
        }

        $roleId = $admin['role_id'];
        if (!$roleId) {
            return false;
        }

        // Get role and check if active
        $role = $this->roleModel->find($roleId);
        if (!$role || !$role['is_active']) {
            return false;
        }

        // Check permission
        return $this->rmpModel->hasPermission($roleId, $moduleId, $permissionId);
    }

    /**
     * Get all modules accessible by a user
     * 
     * @param int $adminId
     * @return array
     */
    public function getAccessibleModules($adminId)
    {
        $admin = $this->adminModel->find($adminId);
        if (!$admin || !$admin['is_active']) {
            return [];
        }

        if (!$admin['role_id']) {
            return [];
        }

        return $this->rmpModel->db->table('role_module_permissions')
            ->distinct()
            ->select('modules.*')
            ->join('modules', 'modules.id = role_module_permissions.module_id')
            ->where('role_module_permissions.role_id', $admin['role_id'])
            ->orderBy('modules.parent_id', 'ASC')
            ->orderBy('modules.order', 'ASC')
            ->get()
            ->getResultArray();
    }

    /**
     * Get all permissions for a user in a specific module
     * 
     * @param int $adminId
     * @param int $moduleId
     * @return array
     */
    public function getModulePermissions($adminId, $moduleId)
    {
        $admin = $this->adminModel->find($adminId);
        if (!$admin || !$admin['is_active'] || !$admin['role_id']) {
            return [];
        }

        return $this->rmpModel->getModulePermissions($admin['role_id'], $moduleId);
    }

    /**
     * Get role information with permissions
     * 
     * @param int $roleId
     * @return array|null
     */
    public function getRoleWithPermissions($roleId)
    {
        return $this->roleModel->getRoleWithPermissions($roleId);
    }

    /**
     * Check if user has any of the given permissions
     * 
     * @param int $adminId
     * @param int $moduleId
     * @param array $permissionIds
     * @return bool
     */
    public function hasAnyPermission($adminId, $moduleId, $permissionIds = [])
    {
        foreach ($permissionIds as $permissionId) {
            if ($this->hasPermission($adminId, $moduleId, $permissionId)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if user has all given permissions
     * 
     * @param int $adminId
     * @param int $moduleId
     * @param array $permissionIds
     * @return bool
     */
    public function hasAllPermissions($adminId, $moduleId, $permissionIds = [])
    {
        foreach ($permissionIds as $permissionId) {
            if (!$this->hasPermission($adminId, $moduleId, $permissionId)) {
                return false;
            }
        }
        return true;
    }
}
