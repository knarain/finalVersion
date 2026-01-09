<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run()
    {
        // Seed Permissions (Standard CRUD operations)
        $permissions = [
            ['name' => 'Create', 'slug' => 'create', 'description' => 'Can create new records'],
            ['name' => 'Read', 'slug' => 'read', 'description' => 'Can view records'],
            ['name' => 'Update', 'slug' => 'update', 'description' => 'Can update records'],
            ['name' => 'Delete', 'slug' => 'delete', 'description' => 'Can delete records'],
        ];

        foreach ($permissions as $permission) {
            $exists = $this->db->table('permissions')
                ->where('slug', $permission['slug'])
                ->countAllResults() > 0;
            
            if (!$exists) {
                $this->db->table('permissions')->insert($permission);
            }
        }

        // Seed Modules (Main Modules)
        $modules = [
            [
                'name' => 'Dashboard',
                'slug' => 'dashboard',
                'parent_id' => null,
                'is_sub_module' => 0,
                'icon' => 'dashboard',
                'order' => 1,
            ],
            [
                'name' => 'Users',
                'slug' => 'users',
                'parent_id' => null,
                'is_sub_module' => 0,
                'icon' => 'users',
                'order' => 2,
            ],
            [
                'name' => 'Roles & Permissions',
                'slug' => 'roles-permissions',
                'parent_id' => null,
                'is_sub_module' => 0,
                'icon' => 'lock',
                'order' => 3,
            ],
            [
                'name' => 'Albums',
                'slug' => 'albums',
                'parent_id' => null,
                'is_sub_module' => 0,
                'icon' => 'image',
                'order' => 4,
            ],
            [
                'name' => 'Categories',
                'slug' => 'categories',
                'parent_id' => null,
                'is_sub_module' => 0,
                'icon' => 'folder',
                'order' => 5,
            ],
            [
                'name' => 'Enquiries',
                'slug' => 'enquiries',
                'parent_id' => null,
                'is_sub_module' => 0,
                'icon' => 'mail',
                'order' => 6,
            ],
            [
                'name' => 'Settings',
                'slug' => 'settings',
                'parent_id' => null,
                'is_sub_module' => 0,
                'icon' => 'settings',
                'order' => 7,
            ],
        ];

        foreach ($modules as $module) {
            $exists = $this->db->table('modules')
                ->where('slug', $module['slug'])
                ->countAllResults() > 0;
            
            if (!$exists) {
                $this->db->table('modules')->insert($module);
            }
        }

        // Seed default role with all permissions
        $superAdminExists = $this->db->table('roles')
            ->where('name', 'Super Admin')
            ->countAllResults() > 0;

        if (!$superAdminExists) {
            $this->db->table('roles')->insert([
                'name' => 'Super Admin',
                'description' => 'Full access to all features',
                'is_active' => 1,
            ]);

            $roleId = $this->db->insertID();

            // Get all modules and permissions
            $modules = $this->db->table('modules')->get()->getResultArray();
            $permissions = $this->db->table('permissions')->get()->getResultArray();

            // Assign all permissions to all modules for Super Admin
            foreach ($modules as $module) {
                foreach ($permissions as $permission) {
                    $this->db->table('role_module_permissions')->insert([
                        'role_id' => $roleId,
                        'module_id' => $module['id'],
                        'permission_id' => $permission['id'],
                    ]);
                }
            }
        }
    }
}
