<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */

// ========================================
// ADMIN AUTH ROUTES
// ========================================
$routes->group('api', ['namespace' => 'App\Controllers\Api'], function($routes) {
    $routes->post('admin/login', 'Admin::login');                            // Admin login
    $routes->get('admin/captcha', 'Admin::captcha');                         // Generate captcha
    $routes->put('admin/profile-update', 'Admin::profileUpdate');            // Update admin profile
    $routes->post('admin/2fa/enable', 'Admin::enable2FA');                   // Enable 2FA
    $routes->post('admin/2fa/disable', 'Admin::disable2FA');                 // Disable 2FA
});

// ========================================
// ROLE MANAGEMENT ROUTES
// ========================================
$routes->group('api', ['namespace' => 'App\Controllers\Api'], function($routes) {
    $routes->get('roles/status/active', 'RoleController::getActiveRoles');   // Get active roles only - MUST BE FIRST
    $routes->get('roles', 'RoleController::index');                          // Get all roles
    $routes->post('roles', 'RoleController::create');                        // Create role
    $routes->patch('roles/(:num)/toggle-status', 'RoleController::toggleStatus/$1'); // Toggle role status
    $routes->put('roles/(:num)', 'RoleController::update/$1');               // Update role
    $routes->delete('roles/(:num)', 'RoleController::delete/$1');            // Delete role
    $routes->get('roles/(:num)', 'RoleController::show/$1');                 // Get single role - MUST BE LAST
});

// ========================================
// USER MANAGEMENT ROUTES
// ========================================
$routes->group('api', ['namespace' => 'App\Controllers\Api'], function($routes) {
    $routes->get('users/status/active', 'UserController::getActiveUsers');   // Get active users - MUST BE FIRST
    $routes->get('users', 'UserController::index');                          // List users (paginated)
    $routes->post('users', 'UserController::create');                        // Create user
    $routes->post('users/(:num)/change-password', 'UserController::changePassword/$1'); // Change password
    $routes->post('users/(:num)/reset-password', 'UserController::resetPassword/$1');   // Reset password (admin)
    $routes->patch('users/(:num)/assign-role', 'UserController::assignRole/$1'); // Assign role
    $routes->patch('users/(:num)/toggle-status', 'UserController::toggleStatus/$1'); // Toggle user status
    $routes->put('users/(:num)', 'UserController::update/$1');               // Update user
    $routes->delete('users/(:num)', 'UserController::delete/$1');            // Delete user
    $routes->get('users/(:num)', 'UserController::show/$1');                 // Get single user - MUST BE LAST
});

// ========================================
// PERMISSION MANAGEMENT ROUTES
// ========================================
$routes->group('api', ['namespace' => 'App\Controllers\Api'], function($routes) {
    $routes->post('permissions/assign', 'PermissionController::assign');     // Assign permission to role
    $routes->post('permissions/assign-bulk', 'PermissionController::assignBulk'); // Bulk assign permissions
    $routes->post('permissions/check', 'PermissionController::checkPermission'); // Check if has permission
    $routes->get('permissions', 'PermissionController::index');              // Get all permissions with structure
    $routes->get('permissions/role/(:num)', 'PermissionController::getRolePermissions/$1'); // Get role permissions
    $routes->delete('permissions/(:num)/(:num)/(:num)', 'PermissionController::removePermission/$1/$2/$3'); // Remove permission
});

// ========================================
// EXISTING ROUTES
// ========================================
$routes->group('api', ['namespace' => 'App\Controllers\Api'], function($routes) {
    $routes->get('enquiries', 'Enquiries::index');   // list all
    $routes->post('enquiries', 'Enquiries::store');  // create new
    $routes->get('categories', 'AlbumsAdmin::categories'); // Public categories list
    $routes->post('categories', 'AlbumsAdmin::storeCategory'); // Admin add category
    $routes->delete('categories/(:num)', 'AlbumsAdmin::deleteCategory/$1'); // Admin delete category
    $routes->get('admin/albums', 'AlbumsAdmin::index'); // Admin list albums
    $routes->get('admin/albums/(:num)', 'AlbumsAdmin::show/$1'); // Admin get single album
    $routes->post('admin/albums', 'AlbumsAdmin::create');
    $routes->put('admin/albums/(:num)', 'AlbumsAdmin::edit/$1');
    $routes->delete('admin/albums/(:num)', 'AlbumsAdmin::delete/$1');
    $routes->patch('admin/albums/(:num)/status', 'AlbumsAdmin::toggleStatus/$1'); // Toggle active/inactive
    $routes->patch('admin/albums/(:num)/lock', 'AlbumsAdmin::toggleLock/$1'); // Toggle lock/unlock
    $routes->post('admin/albums/(:num)/images', 'AlbumsAdmin::uploadImages/$1');
    $routes->delete('admin/images/(:num)', 'AlbumsAdmin::deleteImage/$1');
    $routes->get('admin/albums/(:num)/images', 'AlbumsAdmin::images/$1'); // admin GET images route
    $routes->get('albums/(:num)/images', 'Api\Albums::images/$1');
});
$routes->group('api', ['namespace' => 'App\Controllers\Api'], function($routes) {
    $routes->get('albums/category/(:num)', 'Albums::byCategory/$1'); // Public albums by category
    $routes->get('albums/code/(:alphanum)/images', 'Albums::imagesByCode/$1'); // Public images by album code
    $routes->post('albums/code/(:alphanum)/authenticate', 'Albums::authenticateByCode/$1'); // Auth by album code
});

$routes->group('api', ['namespace' => 'App\Controllers'], function($routes) {
    $routes->post('admin/album-credentials', 'AlbumAuthController::addCredential'); // Admin adds credentials
    $routes->get('admin/album-credentials', 'AlbumAuthController::listCredentials'); // Admin lists credentials
    $routes->get('admin/album-credentials/(:num)', 'AlbumAuthController::listCredentials/$1'); // Admin lists credentials for specific album
    $routes->delete('admin/album-credentials/(:num)', 'AlbumAuthController::deleteCredential/$1'); // Admin deletes credential
    $routes->patch('admin/album-credentials/(:num)/status', 'AlbumAuthController::toggleCredentialStatus/$1'); // Admin toggles credential status
});
$routes->post('albums/(:num)/authenticate', 'AlbumAuthController::authenticate/$1'); // User album auth
$routes->get('albums/(:num)/verify-token', 'AlbumAuthController::verifyToken/$1'); // Verify token
$routes->get('/', 'Home::index');

$routes->group('api', ['namespace' => 'App\Controllers'], function($routes) {
    $routes->get('user/albums/(:num)/images', 'AlbumsController::images/$1');
    $routes->post('user/albums/(:num)/authenticate', 'AlbumsController::authenticate/$1');
});



