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
    $routes->post('admin/login', 'Admin::login');
    $routes->post('admin/add-admin', 'Admin::addAdmin');
    $routes->post('admin/albums', 'AlbumsAdmin::create');
    $routes->post('admin/albums/(:num)/images', 'AlbumsAdmin::uploadImages/$1');
    $routes->get('admin/albums/(:num)/images', 'AlbumsAdmin::images/$1'); // admin GET images route
    $routes->get('albums/(:num)/images', 'Api\Albums::images/$1');
});
$routes->group('api', ['namespace' => 'App\Controllers\Api'], function($routes) {
    // Album list with category filter (GET)
    $routes->get('albums', 'Albums::index');
    // Fetch images for a specific album (GET)
    $routes->get('albums/(:num)/images', 'Albums::images/$1');
    // Authenticate to access a locked album (POST)
    $routes->post('albums/(:num)/authenticate', 'Albums::authenticate/$1');
});

$routes->post('admin/album-credentials', 'AlbumAuthController::addCredential'); // Admin adds credentials
$routes->post('albums/(:num)/authenticate', 'AlbumAuthController::authenticate/$1'); // User album auth
$routes->get('albums/(:num)/verify-token', 'AlbumAuthController::verifyToken/$1'); // Verify token

$routes->get('/', 'Home::index');



