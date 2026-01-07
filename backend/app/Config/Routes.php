<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->group('api', ['namespace' => 'App\Controllers\Api'], function($routes) {
    $routes->get('enquiries', 'Enquiries::index');   // list all
    $routes->post('enquiries', 'Enquiries::store');  // create new
});



$routes->group('api', ['namespace' => 'App\Controllers\Api'], function($routes){
    $routes->get('admin/captcha', 'Admin::captcha'); // Generate captcha
    $routes->post('admin/login', 'Admin::login');
    $routes->post('admin/add-admin', 'Admin::addAdmin');
    $routes->put('admin/change-password', 'Admin::changePassword');
    $routes->get('admin/profile-settings', 'Admin::profileSettings'); // Get admin profile settings
    $routes->put('admin/profile-update', 'Admin::profileUpdate'); // Update admin profile
    $routes->post('admin/2fa/enable', 'Admin::enable2FA'); // Enable 2FA
    $routes->post('admin/2fa/disable', 'Admin::disable2FA'); // Disable 2FA
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



