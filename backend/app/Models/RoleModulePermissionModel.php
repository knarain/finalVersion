<?php

namespace App\Models;

use CodeIgniter\Model;

class RoleModulePermissionModel extends Model
{
    protected $table = 'role_module_permissions';
    protected $primaryKey = 'id';
    protected $allowedFields = ['role_id', 'module_id', 'permission_id'];
    protected $useTimestamps = true;
    protected $returnType = 'array';

    /**
     * Get all permissions for a role in a specific module
     */
    public function getModulePermissions($roleId, $moduleId)
    {
        return $this
            ->select('role_module_permissions.*, permissions.name as permission_name, permissions.slug')
            ->join('permissions', 'permissions.id = role_module_permissions.permission_id')
            ->where([
                'role_module_permissions.role_id' => $roleId,
                'role_module_permissions.module_id' => $moduleId,
            ])
            ->findAll();
    }

    /**
     * Check if role has specific permission for module
     */
    public function hasPermission($roleId, $moduleId, $permissionId)
    {
        return $this->where([
            'role_id' => $roleId,
            'module_id' => $moduleId,
            'permission_id' => $permissionId,
        ])->countAllResults() > 0;
    }

    /**
     * Remove all permissions for a role in a module
     */
    public function removeModulePermissions($roleId, $moduleId)
    {
        return $this->where([
            'role_id' => $roleId,
            'module_id' => $moduleId,
        ])->delete();
    }

    /**
     * Add multiple permissions at once
     */
    public function addPermissions($roleId, $moduleId, $permissionIds = [])
    {
        $data = [];
        foreach ($permissionIds as $permissionId) {
            $data[] = [
                'role_id' => $roleId,
                'module_id' => $moduleId,
                'permission_id' => $permissionId,
            ];
        }

        if (!empty($data)) {
            return $this->insertBatch($data);
        }

        return false;
    }
}
