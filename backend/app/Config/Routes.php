<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->group('api', ['namespace' => 'App\Controllers\Api'], function($routes) {
    $routes->get('albums', 'Albums::index');                    // list with pagination & category
    $routes->get('albums/(:num)/images', 'Albums::images/$1'); // get album images (token protected if locked)
    $routes->post('albums/(:num)/authenticate', 'Albums::authenticate/$1'); // authenticate album
});
