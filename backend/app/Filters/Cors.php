<?php namespace App\Filters;

use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Filters\FilterInterface;

class Cors implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        // Get the origin from the request
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        // List of allowed origins
        $allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:8000',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:8000',
            'http://192.168.29.19:3000',
            'http://192.168.29.19:8000',
        ];
        
        // Check if origin is allowed
        if (in_array($origin, $allowedOrigins)) {
            header("Access-Control-Allow-Origin: " . $origin);
            header("Access-Control-Allow-Credentials: true");
        }
        
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE, PATCH");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Max-Age: 7200");
        header("Access-Control-Expose-Headers: Set-Cookie");

        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            // Return early for preflight request
            http_response_code(200);
            exit(0);
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        return $response;
    }
}
