<?php

namespace App\Helpers;

use App\Models\ActionLogModel;
use App\Libraries\Utils;

class ActionLogHelper
{
    /**
     * Log an action to action_logs table
     */
    public static function logAction(
        string $actionName,
        string $description,
        string $actionAppliedFor = 'Admin',
        ?int $referenceId = null,
        ?int $adminId = null
    ): bool {
        try {
            $request = service('request');
            $actionDate = date('Y-m-d H:i:s');
            $ipAddress = $request->getIPAddress();
            
            if (!$adminId) {
                $auth = Utils::getAuthenticatedUser();
                if ($auth instanceof \CodeIgniter\HTTP\Response) {
                    return false;
                }
                $adminId = $auth['id'] ?? null;
            }
            
            $model = new ActionLogModel();
            return $model->logAction(
                $actionName,
                $actionDate,
                $ipAddress,
                $adminId,
                $description,
                $actionAppliedFor,
                $referenceId
            );
        } catch (\Throwable $e) {
            log_message('error', 'Action log failed: ' . $e->getMessage());
            return false;
        }
    }
}
