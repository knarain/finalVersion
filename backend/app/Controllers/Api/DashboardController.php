<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Libraries\Utils;
use CodeIgniter\HTTP\ResponseInterface;

class DashboardController extends BaseController
{
    protected $db;

    public function __construct()
    {
        $this->db = \Config\Database::connect();
    }

    /**
     * GET: Dashboard analytics
     * GET /api/dashboard/analytics
     */
    public function analytics()
    {
        try {
            $totalUsers = $this->db->table('admins')->countAllResults();
            $totalRoles = $this->db->table('roles')->countAllResults();
            $totalAlbums = $this->db->table('albums')->countAllResults();
            $totalEnquiries = $this->db->table('enquiries')->countAllResults();
            $activeUsers = $this->db->table('admins')->where('is_active', 1)->countAllResults();
            $lockedAlbums = $this->db->table('albums')->where('is_locked', 1)->countAllResults();

            return Utils::formatApiResponse([
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'total_roles' => $totalRoles,
                'total_albums' => $totalAlbums,
                'locked_albums' => $lockedAlbums,
                'total_enquiries' => $totalEnquiries
            ], 'Dashboard analytics fetched successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(
                null,
                'Error fetching analytics: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
