<?php

namespace App\Models;

use CodeIgniter\Model;

class RoleModel extends Model
{
    protected $table = 'roles';
    protected $primaryKey = 'id';
    protected $allowedFields = ['name', 'description', 'is_active'];
    protected $useTimestamps = true;
    protected $returnType = 'array';

    /**
     * Get all active roles
     */
    public function getActiveRoles()
    {
        return $this->where('is_active', 1)->findAll();
    }

    /**
     * Get role with all its module-permission assignments
     */
    public function getRoleWithPermissions($roleId)
    {
        return $this
            ->select('roles.*, GROUP_CONCAT(DISTINCT modules.id) as module_ids')
            ->join('role_module_permissions', 'role_module_permissions.role_id = roles.id', 'left')
            ->join('modules', 'modules.id = role_module_permissions.module_id', 'left')
            ->where('roles.id', $roleId)
            ->groupBy('roles.id')
            ->first();
    }

    /**
     * Get all permissions assigned to a role
     */
    public function getRolePermissions($roleId)
    {
        return $this->db->table('role_module_permissions')
            ->select('module_id, permission_id')
            ->where('role_id', $roleId)
            ->findAll();
    }

    /**
     * Check if role has permission for a module
     */
    public function hasModulePermission($roleId, $moduleId, $permissionId)
    {
        return $this->db->table('role_module_permissions')
            ->where([
                'role_id' => $roleId,
                'module_id' => $moduleId,
                'permission_id' => $permissionId,
            ])
            ->countAllResults() > 0;
    }
}
