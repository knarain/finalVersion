<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Libraries\Utils;

class Debug extends BaseController
{
    public function checkDatabase()
    {
        try {
            $db = \Config\Database::connect();
            
            $roles = $db->table('roles')->get()->getResultArray();
            $modules = $db->table('modules')->get()->getResultArray();
            $permissions = $db->table('permissions')->get()->getResultArray();
            $rmp = $db->table('role_module_permissions')->get()->getResultArray();
            
            return Utils::formatApiResponse([
                'roles_count' => count($roles),
                'modules_count' => count($modules),
                'permissions_count' => count($permissions),
                'rmp_count' => count($rmp),
                'roles' => $roles,
                'modules' => $modules,
                'permissions' => $permissions,
                'rmp_sample' => array_slice($rmp, 0, 10)
            ], 'Database check');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Error: ' . $e->getMessage(), 500);
        }
    }
}
