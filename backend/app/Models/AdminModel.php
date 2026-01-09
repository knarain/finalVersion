<?php namespace App\Models;

use CodeIgniter\Model;

class AdminModel extends Model {
    protected $table = 'admins';
    protected $primaryKey = 'id';
    protected $allowedFields = ['role_id', 'username', 'email', 'password_hash', 'watch_word', 'two_factor_enabled', 'is_active', 'created_at', 'updated_at'];
    protected $useTimestamps = true;
    protected $returnType = 'array';

    /**
     * Get admin with role information
     */
    public function getAdminWithRole($adminId)
    {
        return $this
            ->select('admins.*, roles.name as role_name, roles.description as role_description')
            ->join('roles', 'roles.id = admins.role_id', 'left')
            ->where('admins.id', $adminId)
            ->first();
    }

    /**
     * Get all active admins with role info
     */
    public function getActiveAdmins()
    {
        return $this
            ->select('admins.*, roles.name as role_name')
            ->join('roles', 'roles.id = admins.role_id', 'left')
            ->where('admins.is_active', 1)
            ->orderBy('admins.created_at', 'DESC')
            ->findAll();
    }

    /**
     * Get admin by username with role
     */
    public function getByUsernameWithRole($username)
    {
        return $this
            ->select('admins.*, roles.name as role_name, roles.id as role_id')
            ->join('roles', 'roles.id = admins.role_id', 'left')
            ->where('admins.username', $username)
            ->first();
    }

    /**
     * Assign role to admin
     */
    public function assignRole($adminId, $roleId)
    {
        return $this->update($adminId, ['role_id' => $roleId]);
    }

    /**
     * Activate/Deactivate admin
     */
    public function setActive($adminId, $isActive)
    {
        return $this->update($adminId, ['is_active' => $isActive ? 1 : 0]);
    }

    /**
     * Get all admins with pagination
     */
    public function getPaginatedAdmins($perPage = 10, $offset = 0)
    {
        return $this
            ->select('admins.*, roles.name as role_name')
            ->join('roles', 'roles.id = admins.role_id', 'left')
            ->orderBy('admins.created_at', 'DESC')
            ->limit($perPage, $offset)
            ->findAll();
    }

    /**
     * Get total admin count
     */
    public function getTotalAdmins()
    {
        return $this->countAllResults();
    }
}
