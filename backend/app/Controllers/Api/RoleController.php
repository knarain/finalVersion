<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Libraries\Utils;
use App\Models\RoleModel;
use CodeIgniter\HTTP\ResponseInterface;

class RoleController extends BaseController
{
    protected RoleModel $roleModel;

    public function __construct()
    {
        $this->roleModel = new RoleModel();
    }

    /**
     * GET: Get all roles with their status
     * GET /api/roles
     */
    public function index()
    {
        try {
            $roles = $this->roleModel->findAll();
            return Utils::formatApiResponse($roles, 'Roles fetched successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error fetching roles: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * GET: Get single role by ID
     * GET /api/roles/{id}
     */
    public function show($id)
    {
        try {
            $role = $this->roleModel->find($id);
            if (!$role) {
                return Utils::formatApiResponse(null, 'Role not found', ResponseInterface::HTTP_NOT_FOUND);
            }

            return Utils::formatApiResponse($role, 'Role fetched successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error fetching role: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * POST: Create new role
     * POST /api/roles
     * Body: { "name": "string", "description": "string" }
     */
    public function create()
    {
        try {
            $payload = $this->request->getJSON(true);

            if (empty($payload['name'])) {
                return Utils::formatApiResponse(
                    null,
                    'Role name is required',
                    ResponseInterface::HTTP_BAD_REQUEST
                );
            }

            // Check if role already exists
            $existing = $this->roleModel->where('name', $payload['name'])->first();
            if ($existing) {
                return Utils::formatApiResponse(
                    null,
                    'Role with this name already exists',
                    ResponseInterface::HTTP_CONFLICT
                );
            }

            $data = [
                'name' => trim($payload['name']),
                'description' => $payload['description'] ?? null,
                'is_active' => 1
            ];

            $roleId = $this->roleModel->insert($data);

            return Utils::formatApiResponse(
                ['id' => $roleId, ...$data],
                'Role created successfully',
                ResponseInterface::HTTP_CREATED
            );
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error creating role: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * PUT: Update role
     * PUT /api/roles/{id}
     * Body: { "name": "string", "description": "string", "is_active": boolean }
     */
    public function update($id)
    {
        try {
            $role = $this->roleModel->find($id);
            if (!$role) {
                return Utils::formatApiResponse(null, 'Role not found', ResponseInterface::HTTP_NOT_FOUND);
            }

            $payload = $this->request->getJSON(true);

            // Check if new name already exists
            if (!empty($payload['name']) && $payload['name'] !== $role['name']) {
                $existing = $this->roleModel->where('name', $payload['name'])->first();
                if ($existing) {
                    return Utils::formatApiResponse(
                        null,
                        'Role with this name already exists',
                        ResponseInterface::HTTP_CONFLICT
                    );
                }
            }

            $data = [];
            if (!empty($payload['name'])) $data['name'] = trim($payload['name']);
            if (isset($payload['description'])) $data['description'] = $payload['description'];
            if (isset($payload['is_active'])) $data['is_active'] = $payload['is_active'] ? 1 : 0;

            $this->roleModel->update($id, $data);

            return Utils::formatApiResponse(
                $this->roleModel->find($id),
                'Role updated successfully'
            );
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error updating role: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * DELETE: Delete role
     * DELETE /api/roles/{id}
     */
    public function delete($id)
    {
        try {
            $role = $this->roleModel->find($id);
            if (!$role) {
                return Utils::formatApiResponse(null, 'Role not found', ResponseInterface::HTTP_NOT_FOUND);
            }

            // Check if any admin uses this role
            $adminCount = $this->db->table('admins')
                ->where('role_id', $id)
                ->countAllResults();

            if ($adminCount > 0) {
                return Utils::formatApiResponse(
                    null,
                    'Cannot delete role. ' . $adminCount . ' admin(s) are using this role.',
                    ResponseInterface::HTTP_CONFLICT
                );
            }

            $this->roleModel->delete($id);

            return Utils::formatApiResponse(null, 'Role deleted successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error deleting role: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * PATCH: Toggle role active status
     * PATCH /api/roles/{id}/toggle-status
     */
    public function toggleStatus($id)
    {
        try {
            $role = $this->roleModel->find($id);
            if (!$role) {
                return Utils::formatApiResponse(null, 'Role not found', ResponseInterface::HTTP_NOT_FOUND);
            }

            $newStatus = $role['is_active'] ? 0 : 1;
            $this->roleModel->update($id, ['is_active' => $newStatus]);

            return Utils::formatApiResponse(
                ['is_active' => $newStatus],
                'Role status updated successfully'
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
     * GET: Get active roles only
     * GET /api/roles/status/active
     */
    public function getActiveRoles()
    {
        try {
            $roles = $this->roleModel->getActiveRoles();
            return Utils::formatApiResponse($roles, 'Active roles fetched successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error fetching active roles: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
