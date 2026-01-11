<?php

// Test database connection and data
$db = \Config\Database::connect();

echo "Testing database...\n";

// Check roles
$roles = $db->table('roles')->get()->getResultArray();
echo "Roles: " . count($roles) . "\n";
print_r($roles);

// Check modules
$modules = $db->table('modules')->get()->getResultArray();
echo "\nModules: " . count($modules) . "\n";
print_r($modules);

// Check permissions
$permissions = $db->table('permissions')->get()->getResultArray();
echo "\nPermissions: " . count($permissions) . "\n";
print_r($permissions);

// Check role_module_permissions
$rmp = $db->table('role_module_permissions')->where('role_id', 1)->get()->getResultArray();
echo "\nRole 1 Permissions: " . count($rmp) . "\n";
print_r($rmp);

// Test the menu query
echo "\n\nTesting menu query for role 1...\n";
$modules = $db->table('modules m')
    ->select('m.*, GROUP_CONCAT(rmp.permission_id) as permissions')
    ->join('role_module_permissions rmp', 'rmp.module_id = m.id', 'inner')
    ->where('rmp.role_id', 1)
    ->groupBy('m.id')
    ->orderBy('m.parent_id', 'ASC')
    ->orderBy('m.order', 'ASC')
    ->get()
    ->getResultArray();

echo "Menu modules: " . count($modules) . "\n";
print_r($modules);
