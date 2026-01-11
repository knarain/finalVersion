<?php

namespace App\Filters;

use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Filters\FilterInterface;
use App\Models\RoleModulePermissionModel;
use App\Libraries\Utils;

class ApiPermissionFilter implements FilterInterface
{
    protected $rmpModel;
    protected $db;

    public function __construct()
    {
        $this->rmpModel = new RoleModulePermissionModel();
        $this->db = \Config\Database::connect();
    }

    public function before(RequestInterface $request, $arguments = null)
    {
        $path = $request->getPath();
        
        // Skip permission check for permission endpoints and dashboard
        if (strpos($path, 'api/permissions') === 0 || strpos($path, 'api/dashboard') === 0) {
            return null;
        }

        $roleId = $request->getHeaderLine('X-Role-ID');
        
        if (!$roleId) {
            return null;
        }

        $method = $request->getMethod();
        
        $routeModuleMap = [
            'api/admin/enquiries' => 2,
            'api/admin/albums' => 3,
            'api/admin/categories' => 4,
            'api/roles' => 5,
            'api/users' => 6,
            'api/admin/action-logs' => 7,
            'api/admin/settings' => 8,
        ];

        $moduleId = null;
        foreach ($routeModuleMap as $route => $id) {
            if (strpos($path, $route) === 0) {
                $moduleId = $id;
                break;
            }
        }

        if (!$moduleId) {
            return null;
        }

        $permission = match($method) {
            'GET' => 1,
            'POST' => 2,
            'PUT', 'PATCH' => 3,
            'DELETE' => 4,
            default => null
        };

        if (!$permission) {
            return null;
        }

        if (!$this->rmpModel->hasPermission($roleId, $moduleId, $permission)) {
            return response()
                ->setStatusCode(403)
                ->setJSON(Utils::formatApiResponse(null, 'You do not have permission', 403));
        }

        return null;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
    }
}
