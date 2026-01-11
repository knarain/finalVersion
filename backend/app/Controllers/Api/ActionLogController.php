<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\ActionLogModel;
use App\Libraries\Utils;
use CodeIgniter\HTTP\ResponseInterface;

class ActionLogController extends BaseController
{
    protected ActionLogModel $actionLogModel;

    public function __construct()
    {
        $this->actionLogModel = new ActionLogModel();
    }

    /**
     * Get all action logs with pagination and search
     * GET /api/action-logs?page=1&limit=20&search=keyword
     */
    public function getLogs()
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? '') !== 'admin') {
            return Utils::formatApiResponse(null, 'Admin access required', 403);
        }

        $page = (int) ($this->request->getVar('page') ?? 1);
        $limit = (int) ($this->request->getVar('limit') ?? 20);
        $search = $this->request->getVar('search') ?? '';

        $result = Utils::getPaginationData(
            $this->actionLogModel,
            [],
            $page,
            $limit,
            ['action_date' => 'DESC'],
            $search,
            ['action_name', 'description', 'action_applied_for']
        );

        return Utils::formatApiResponse($result['data'], 'Action logs fetched successfully', 200);
    }

    /**
     * Get logs by admin with pagination and search
     * GET /api/action-logs/admin/:adminId?page=1&limit=20&search=keyword
     */
    public function getLogsByAdmin($adminId)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? '') !== 'admin') {
            return Utils::formatApiResponse(null, 'Admin access required', 403);
        }

        $page = (int) ($this->request->getVar('page') ?? 1);
        $limit = (int) ($this->request->getVar('limit') ?? 20);
        $search = $this->request->getVar('search') ?? '';

        $result = Utils::getPaginationData(
            $this->actionLogModel,
            ['action_by_admin' => $adminId],
            $page,
            $limit,
            ['action_date' => 'DESC'],
            $search,
            ['action_name', 'description']
        );

        return Utils::formatApiResponse($result['data'], 'Admin logs fetched successfully', 200);
    }

    /**
     * Get logs by action type with pagination and search
     * GET /api/action-logs/action/:actionName?page=1&limit=20&search=keyword
     */
    public function getLogsByAction($actionName)
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? '') !== 'admin') {
            return Utils::formatApiResponse(null, 'Admin access required', 403);
        }

        $page = (int) ($this->request->getVar('page') ?? 1);
        $limit = (int) ($this->request->getVar('limit') ?? 20);
        $search = $this->request->getVar('search') ?? '';

        $result = Utils::getPaginationData(
            $this->actionLogModel,
            ['action_name' => $actionName],
            $page,
            $limit,
            ['action_date' => 'DESC'],
            $search,
            ['description']
        );

        return Utils::formatApiResponse($result['data'], 'Action logs fetched successfully', 200);
    }

    /**
     * Get logs by date range with pagination and search
     * GET /api/action-logs/date-range?start=2024-01-01&end=2024-12-31&page=1&limit=20&search=keyword
     */
    public function getLogsByDateRange()
    {
        $auth = Utils::getAuthenticatedUser();
        if ($auth instanceof ResponseInterface) {
            return $auth;
        }

        if (($auth['auth_type'] ?? '') !== 'admin') {
            return Utils::formatApiResponse(null, 'Admin access required', 403);
        }

        $startDate = $this->request->getVar('start');
        $endDate = $this->request->getVar('end');
        $search = $this->request->getVar('search') ?? '';

        if (!$startDate || !$endDate) {
            return Utils::formatApiResponse(null, 'Start and end dates are required', 400);
        }

        $page = (int) ($this->request->getVar('page') ?? 1);
        $limit = (int) ($this->request->getVar('limit') ?? 20);

        $result = Utils::getPaginationData(
            $this->actionLogModel,
            [],
            $page,
            $limit,
            ['action_date' => 'DESC'],
            $search,
            ['action_name', 'description'],
            null,
            $startDate,
            $endDate,
            'action_date'
        );

        return Utils::formatApiResponse($result['data'], 'Date range logs fetched successfully', 200);
    }
}
