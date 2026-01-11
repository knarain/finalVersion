<?php

namespace App\Models;

use CodeIgniter\Model;

class ModuleModel extends Model
{
    protected $table = 'modules';
    protected $primaryKey = 'id';

    protected $allowedFields = [
        'name',
        'slug',
        'parent_id',
        'is_sub_module',
        'icon',
        'url',
        'order',
    ];

    protected $useTimestamps = true;

    protected $returnType = 'array';

    public function getMainModules()
    {
        return $this->where('parent_id', null)
                    ->orderBy('order', 'ASC')
                    ->orderBy('id', 'ASC')
                    ->findAll();
    }

    public function getSubModules(int $moduleId)
    {
        return $this->where('parent_id', $moduleId)
                    ->orderBy('order', 'ASC')
                    ->orderBy('id', 'ASC')
                    ->findAll();
    }

    public function getMenuTree(): array
    {
        $modules = $this->findAll();
        $tree = [];

        foreach ($modules as $module) {
            if ($module['parent_id'] === null) {
                $module['sub_modules'] = [];
                $tree[$module['id']] = $module;
            }
        }

        foreach ($modules as $module) {
            if ($module['parent_id'] !== null && isset($tree[$module['parent_id']])) {
                $tree[$module['parent_id']]['sub_modules'][] = $module;
            }
        }

        return array_values($tree);
    }

    public function getBySlug($slug)
    {
        return $this->where('slug', $slug)->first();
    }

    public function getAccessibleModules($roleId)
    {
        return $this->db->table('modules')
            ->distinct()
            ->join('role_module_permissions', 'role_module_permissions.module_id = modules.id', 'inner')
            ->where('role_module_permissions.role_id', $roleId)
            ->select('modules.*')
            ->orderBy('modules.parent_id', 'ASC')
            ->orderBy('modules.order', 'ASC')
            ->findAll();
    }
}
