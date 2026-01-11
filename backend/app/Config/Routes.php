<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */

// ========================================
// ADMIN AUTH ROUTES
// ========================================
$routes->group('api', ['namespace' => 'App\\Controllers\\Api'], function($routes) {
    $routes->post('admin/login', 'Admin::login');
    $routes->get('admin/captcha', 'Admin::captcha');
    $routes->put('admin/profile-update', 'Admin::profileUpdate');
    $routes->post('admin/2fa/enable', 'Admin::enable2FA');
    $routes->post('admin/2fa/disable', 'Admin::disable2FA');
    $routes->get('dashboard/analytics', 'DashboardController::analytics');
});

// ========================================
// PERMISSION MANAGEMENT ROUTES (NO FILTER)
// ========================================
$routes->group('api', ['namespace' => 'App\\Controllers\\Api'], function($routes) {
    $routes->post('permissions/assign', 'PermissionController::assign');
    $routes->post('permissions/assign-bulk', 'PermissionController::assignBulk');
    $routes->post('permissions/check', 'PermissionController::checkPermission');
    $routes->get('permissions', 'PermissionController::index');
    $routes->get('permissions/role/(:num)', 'PermissionController::getRolePermissions/$1');
    $routes->get('permissions/menu/(:num)', 'PermissionController::getMenuStructure/$1');
    $routes->delete('permissions/(:num)/(:num)/(:num)', 'PermissionController::removePermission/$1/$2/$3');
});

// ========================================
// ROLE MANAGEMENT ROUTES (NO FILTER - CHECKED IN CONTROLLER)
// ========================================
$routes->group('api', ['namespace' => 'App\\Controllers\\Api'], function($routes) {
    $routes->get('roles/status/active', 'RoleController::getActiveRoles');
    $routes->get('roles', 'RoleController::index');
    $routes->post('roles', 'RoleController::create');
    $routes->patch('roles/(:num)/toggle-status', 'RoleController::toggleStatus/$1');
    $routes->put('roles/(:num)', 'RoleController::update/$1');
    $routes->delete('roles/(:num)', 'RoleController::delete/$1');
    $routes->get('roles/(:num)', 'RoleController::show/$1');
});

// ========================================
// USER MANAGEMENT ROUTES (NO FILTER - CHECKED IN CONTROLLER)
// ========================================
$routes->group('api', ['namespace' => 'App\\Controllers\\Api'], function($routes) {
    $routes->get('users/status/active', 'UserController::getActiveUsers');
    $routes->get('users', 'UserController::index');
    $routes->post('users', 'UserController::create');
    $routes->post('users/(:num)/change-password', 'UserController::changePassword/$1');
    $routes->post('users/(:num)/reset-password', 'UserController::resetPassword/$1');
    $routes->patch('users/(:num)/assign-role', 'UserController::assignRole/$1');
    $routes->patch('users/(:num)/toggle-status', 'UserController::toggleStatus/$1');
    $routes->put('users/(:num)', 'UserController::update/$1');
    $routes->delete('users/(:num)', 'UserController::delete/$1');
    $routes->get('users/(:num)', 'UserController::show/$1');
});

// ========================================
// ADMIN CONTENT ROUTES (NO FILTER - CHECKED IN CONTROLLER)
// ========================================
$routes->group('api', ['namespace' => 'App\\Controllers\\Api'], function($routes) {
    $routes->get('admin/enquiries', 'Enquiries::index');
    $routes->post('admin/enquiries', 'Enquiries::store');
    $routes->get('admin/enquiries/(:num)', 'Enquiries::show/$1');
    $routes->put('admin/enquiries/(:num)', 'Enquiries::update/$1');
    $routes->delete('admin/enquiries/(:num)', 'Enquiries::delete/$1');
    
    $routes->get('admin/albums', 'AlbumsAdmin::index');
    $routes->get('admin/albums/(:num)', 'AlbumsAdmin::show/$1');
    $routes->post('admin/albums', 'AlbumsAdmin::create');
    $routes->put('admin/albums/(:num)', 'AlbumsAdmin::edit/$1');
    $routes->delete('admin/albums/(:num)', 'AlbumsAdmin::delete/$1');
    $routes->patch('admin/albums/(:num)/status', 'AlbumsAdmin::toggleStatus/$1');
    $routes->patch('admin/albums/(:num)/lock', 'AlbumsAdmin::toggleLock/$1');
    $routes->post('admin/albums/(:num)/images', 'AlbumsAdmin::uploadImages/$1');
    $routes->delete('admin/images/(:num)', 'AlbumsAdmin::deleteImage/$1');
    $routes->get('admin/albums/(:num)/images', 'AlbumsAdmin::images/$1');
    
    $routes->get('admin/categories', 'AlbumsAdmin::categories');
    $routes->post('admin/categories', 'AlbumsAdmin::storeCategory');
    $routes->delete('admin/categories/(:num)', 'AlbumsAdmin::deleteCategory/$1');
    
    $routes->post('admin/album-credentials', 'AlbumAuthController::addCredential');
    $routes->get('admin/album-credentials', 'AlbumAuthController::listCredentials');
    $routes->get('admin/album-credentials/(:num)', 'AlbumAuthController::listCredentials/$1');
    $routes->delete('admin/album-credentials/(:num)', 'AlbumAuthController::deleteCredential/$1');
    $routes->patch('admin/album-credentials/(:num)/status', 'AlbumAuthController::toggleCredentialStatus/$1');
});

// ========================================
// PUBLIC ROUTES (NO PERMISSION FILTER)
// ========================================
$routes->group('api', ['namespace' => 'App\\Controllers\\Api'], function($routes) {
    $routes->get('enquiries', 'Enquiries::index');
    $routes->post('enquiries', 'Enquiries::store');
    $routes->get('categories', 'AlbumsAdmin::categories');
    $routes->get('albums/category/(:num)', 'Albums::byCategory/$1');
    $routes->get('albums/code/(:alphanum)/images', 'Albums::imagesByCode/$1');
    $routes->post('albums/code/(:alphanum)/authenticate', 'Albums::authenticateByCode/$1');
    $routes->get('albums/(:num)/images', 'Api\\Albums::images/$1');
});

$routes->post('albums/(:num)/authenticate', 'AlbumAuthController::authenticate/$1');
$routes->get('albums/(:num)/verify-token', 'AlbumAuthController::verifyToken/$1');
$routes->get('/', 'Home::index');

$routes->group('api', ['namespace' => 'App\\Controllers'], function($routes) {
    $routes->get('user/albums/(:num)/images', 'AlbumsController::images/$1');
    $routes->post('user/albums/(:num)/authenticate', 'AlbumsController::authenticate/$1');
});
