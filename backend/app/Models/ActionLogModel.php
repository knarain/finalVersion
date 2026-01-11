<?php namespace App\Models;

use CodeIgniter\Model;

class ActionLogModel extends Model {
    protected $table = 'action_logs';
    protected $primaryKey = 'id';
    protected $allowedFields = ['action_name', 'action_date', 'ip_address', 'action_by_admin', 'description', 'action_applied_for', 'reference_id'];
    protected $useTimestamps = true;
    protected $returnType = 'array';

    public function builder($table = null)
    {
        $builder = parent::builder($table);
        return $builder
            ->select('action_logs.*, admins.username as admin_username')
            ->join('admins', 'admins.id = action_logs.action_by_admin', 'left');
    }

    /**
     * Log an action
     */
    public function logAction($actionName, $actionDate, $ipAddress, $actionByAdmin, $description, $actionAppliedFor, $referenceId = null)
    {
        return $this->insert([
            'action_name' => $actionName,
            'action_date' => $actionDate,
            'ip_address' => $ipAddress,
            'action_by_admin' => $actionByAdmin,
            'description' => $description,
            'action_applied_for' => $actionAppliedFor,
            'reference_id' => $referenceId
        ]);
    }
}
