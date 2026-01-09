<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use App\Libraries\PermissionHelper;
use App\Libraries\Utils;

class PermissionFilter implements FilterInterface
{
    protected PermissionHelper $permissionHelper;

    public function __construct()
    {
        $this->permissionHelper = new PermissionHelper();
    }

    /**
     * Checks if admin has required permission
     * Route must define 'module_id' and 'permission_id' in params
     */
    public function before(RequestInterface $request, $arguments = null)
    {
        // Skip if no arguments (module_id and permission_id) provided
        if (empty($arguments)) {
            return null;
        }

        // Get admin ID from token/session (should be set during login)
        $adminId = $request->getVar('admin_id') ?? session('admin_id');

        if (!$adminId) {
            return response()
                ->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED)
                ->setJSON(Utils::formatApiResponse(
                    null,
                    'Unauthorized access',
                    ResponseInterface::HTTP_UNAUTHORIZED
                ));
        }

        // Parse arguments: should be like ['module_id=1', 'permission_id=2']
        $moduleId = null;
        $permissionId = null;

        foreach ($arguments as $arg) {
            if (strpos($arg, 'module_id=') === 0) {
                $moduleId = (int)substr($arg, 10);
            }
            if (strpos($arg, 'permission_id=') === 0) {
                $permissionId = (int)substr($arg, 14);
            }
        }

        if (!$moduleId || !$permissionId) {
            return response()
                ->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST)
                ->setJSON(Utils::formatApiResponse(
                    null,
                    'Invalid permission parameters',
                    ResponseInterface::HTTP_BAD_REQUEST
                ));
        }

        // Check permission
        if (!$this->permissionHelper->hasPermission($adminId, $moduleId, $permissionId)) {
            return response()
                ->setStatusCode(ResponseInterface::HTTP_FORBIDDEN)
                ->setJSON(Utils::formatApiResponse(
                    null,
                    'Access forbidden. You do not have permission to perform this action.',
                    ResponseInterface::HTTP_FORBIDDEN
                ));
        }

        return null;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Nothing to do after
    }
}
