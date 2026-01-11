<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Libraries\Utils;
use App\Models\{RoleModel, ModuleModel, PermissionModel, RoleModulePermissionModel};

class PermissionController extends BaseController
{
    protected $roleModel;
    protected $moduleModel;
    protected $permissionModel;
    protected $rmpModel;
    protected $db;

    public function __construct()
    {
        $this->roleModel = new RoleModel();
        $this->moduleModel = new ModuleModel();
        $this->permissionModel = new PermissionModel();
        $this->rmpModel = new RoleModulePermissionModel();
        $this->db = \Config\Database::connect();
    }

    public function getMenuStructure($roleId)
    {
        try {
            $role = $this->roleModel->find($roleId);
            if (!$role) {
                return Utils::formatApiResponse(null, 'Role not found', 404);
            }

            $parentModules = [];
            
            // Always add Dashboard (module_id=1) first
            $dashboard = $this->db->table('modules')->where('id', 1)->get()->getRow(0, 'array');
            if ($dashboard) {
                $parentModules[1] = [
                    'role_id' => (string)$roleId,
                    'module_info' => [
                        'id' => 1,
                        'name' => $dashboard['name'],
                        'is_sub_module' => false,
                        'permissions' => [],
                        'icon' => $dashboard['icon'] ?? '',
                        'url' => $dashboard['url'] ?? ''
                    ],
                    'sub_module_info' => []
                ];
            }

            // Get all modules with permissions for this role (excluding Dashboard)
            $modules = $this->db->table('modules m')
                ->select('m.id, m.name, m.slug, m.parent_id, m.is_sub_module, m.icon, m.url, m.order, GROUP_CONCAT(rmp.permission_id) as permissions')
                ->join('role_module_permissions rmp', 'rmp.module_id = m.id AND rmp.role_id = ' . $roleId, 'inner')
                ->where('m.id !=', 1)
                ->groupBy('m.id')
                ->orderBy('m.parent_id', 'ASC')
                ->orderBy('m.order', 'ASC')
                ->get()
                ->getResultArray();

            // Get parent module IDs that have sub-modules with permissions
            $parentIds = [];
            foreach ($modules as $module) {
                if (!empty($module['parent_id'])) {
                    $parentIds[] = $module['parent_id'];
                }
            }
            
            // Fetch parent modules
            if (!empty($parentIds)) {
                $parents = $this->db->table('modules')
                    ->whereIn('id', $parentIds)
                    ->get()
                    ->getResultArray();
                
                foreach ($parents as $parent) {
                    $parentModules[$parent['id']] = [
                        'role_id' => (string)$roleId,
                        'module_info' => [
                            'id' => (int)$parent['id'],
                            'name' => $parent['name'],
                            'is_sub_module' => (bool)$parent['is_sub_module'],
                            'permissions' => [],
                            'icon' => $parent['icon'] ?? '',
                            'url' => $parent['url'] ?? ''
                        ],
                        'sub_module_info' => []
                    ];
                }
            }
            
            // Add modules with permissions
            foreach ($modules as $module) {
                $permissions = !empty($module['permissions']) ? array_map('intval', explode(',', $module['permissions'])) : [];
                
                if (empty($module['parent_id'])) {
                    $parentModules[$module['id']] = [
                        'role_id' => (string)$roleId,
                        'module_info' => [
                            'id' => (int)$module['id'],
                            'name' => $module['name'],
                            'is_sub_module' => (bool)$module['is_sub_module'],
                            'permissions' => $permissions,
                            'icon' => $module['icon'] ?? '',
                            'url' => $module['url'] ?? ''
                        ],
                        'sub_module_info' => []
                    ];
                } else {
                    $subModuleData = [
                        'id' => (int)$module['id'],
                        'name' => $module['name'],
                        'is_sub_module' => true,
                        'permissions' => $permissions,
                        'icon' => $module['icon'] ?? '',
                        'url' => $module['url'] ?? ''
                    ];
                    
                    if (isset($parentModules[$module['parent_id']])) {
                        $parentModules[$module['parent_id']]['sub_module_info'][] = $subModuleData;
                    }
                }
            }
            
            return Utils::formatApiResponse(array_values($parentModules), 'Menu structure fetched successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Error: ' . $e->getMessage(), 500);
        }
    }

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
            return Utils::formatApiResponse(null, 'Error: ' . $e->getMessage(), 500);
        }
    }

    public function getRolePermissions($roleId)
    {
        try {
            $role = $this->roleModel->find($roleId);
            if (!$role) {
                return Utils::formatApiResponse(null, 'Role not found', 404);
            }

            // Get all modules (excluding Dashboard), with their permissions for this role
            $modules = $this->db->table('modules m')
                ->select('m.id, m.name, m.parent_id, m.is_sub_module, GROUP_CONCAT(rmp.permission_id) as permissions')
                ->join('role_module_permissions rmp', 'rmp.module_id = m.id AND rmp.role_id = ' . $roleId, 'left')
                ->where('m.id !=', 1)
                ->groupBy('m.id')
                ->orderBy('m.parent_id', 'ASC')
                ->orderBy('m.id', 'ASC')
                ->get()
                ->getResultArray();

            $formattedModules = [];
            foreach ($modules as $module) {
                $formattedModules[] = [
                    'id' => (int)$module['id'],
                    'name' => $module['name'],
                    'parent_id' => $module['parent_id'] ? (int)$module['parent_id'] : null,
                    'is_sub_module' => (bool)$module['is_sub_module'],
                    'permissions' => !empty($module['permissions']) ? array_map('intval', explode(',', $module['permissions'])) : []
                ];
            }

            return Utils::formatApiResponse([
                'role' => $role,
                'modules' => $formattedModules
            ], 'Role permissions fetched');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Error: ' . $e->getMessage(), 500);
        }
    }

    public function assign()
    {
        try {
            $payload = $this->request->getJSON(true);

            if (empty($payload['role_id']) || empty($payload['module_id'])) {
                return Utils::formatApiResponse(null, 'role_id and module_id are required', 400);
            }

            $roleId = $payload['role_id'];
            $moduleId = $payload['module_id'];
            $permissionIds = $payload['permission_ids'] ?? [];

            if (!$this->roleModel->find($roleId)) {
                return Utils::formatApiResponse(null, 'Role not found', 404);
            }

            if (!$this->moduleModel->find($moduleId)) {
                return Utils::formatApiResponse(null, 'Module not found', 404);
            }

            $this->rmpModel->removeModulePermissions($roleId, $moduleId);

            if (!empty($permissionIds)) {
                $this->rmpModel->addPermissions($roleId, $moduleId, $permissionIds);
            }

            return Utils::formatApiResponse(null, 'Permissions assigned successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Error: ' . $e->getMessage(), 500);
        }
    }

    public function assignBulk()
    {
        try {
            $payload = $this->request->getJSON(true);

            if (empty($payload['role_id']) || empty($payload['assignments'])) {
                return Utils::formatApiResponse(null, 'role_id and assignments are required', 400);
            }

            $roleId = $payload['role_id'];
            $assignments = $payload['assignments'];

            if (!$this->roleModel->find($roleId)) {
                return Utils::formatApiResponse(null, 'Role not found', 404);
            }

            foreach ($assignments as $assignment) {
                $moduleId = $assignment['module_id'] ?? null;
                $permissionIds = $assignment['permission_ids'] ?? [];

                if (!$moduleId) continue;
                if (!$this->moduleModel->find($moduleId)) continue;
                
                // Remove existing permissions for this module
                $this->rmpModel->removeModulePermissions($roleId, $moduleId);
                
                // Add new permissions
                if (!empty($permissionIds)) {
                    $this->rmpModel->addPermissions($roleId, $moduleId, $permissionIds);
                }
            }

            return Utils::formatApiResponse(null, 'Bulk permissions assigned successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Error: ' . $e->getMessage(), 500);
        }
    }

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
            return Utils::formatApiResponse(null, 'Error: ' . $e->getMessage(), 500);
        }
    }

    public function checkPermission()
    {
        try {
            $payload = $this->request->getJSON(true);

            if (empty($payload['role_id']) || empty($payload['module_id']) || empty($payload['permission_id'])) {
                return Utils::formatApiResponse(null, 'role_id, module_id, and permission_id are required', 400);
            }

            $hasPermission = $this->rmpModel->hasPermission(
                $payload['role_id'],
                $payload['module_id'],
                $payload['permission_id']
            );

            return Utils::formatApiResponse(['has_permission' => $hasPermission], 'Permission check completed');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Error: ' . $e->getMessage(), 500);
        }
    }
}
