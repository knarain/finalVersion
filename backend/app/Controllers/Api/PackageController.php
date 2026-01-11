<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Libraries\Utils;
use App\Models\PackageModel;

class PackageController extends BaseController
{
    protected $packageModel;

    public function __construct()
    {
        $this->packageModel = new PackageModel();
    }

    public function index()
    {
        try {
            $packages = $this->packageModel->where('is_active', 1)->findAll();
            return Utils::formatApiResponse(['data' => $packages], 'Packages fetched successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Error: ' . $e->getMessage(), 500);
        }
    }

    public function adminIndex()
    {
        try {
            $packages = $this->packageModel->findAll();
            return Utils::formatApiResponse(['data' => $packages], 'Packages fetched successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Error: ' . $e->getMessage(), 500);
        }
    }

    public function create()
    {
        try {
            $payload = $this->request->getJSON(true);

            if (empty($payload['category']) || empty($payload['name']) || empty($payload['price'])) {
                return Utils::formatApiResponse(null, 'category, name, and price are required', 400);
            }

            $data = [
                'category' => $payload['category'],
                'name' => $payload['name'],
                'price' => $payload['price'],
                'features' => json_encode($payload['features'] ?? []),
                'is_active' => $payload['is_active'] ?? 1,
            ];

            $this->packageModel->insert($data);
            return Utils::formatApiResponse(null, 'Package created successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Error: ' . $e->getMessage(), 500);
        }
    }

    public function update($id)
    {
        try {
            $payload = $this->request->getJSON(true);

            $package = $this->packageModel->find($id);
            if (!$package) {
                return Utils::formatApiResponse(null, 'Package not found', 404);
            }

            $data = [];
            if (isset($payload['category'])) $data['category'] = $payload['category'];
            if (isset($payload['name'])) $data['name'] = $payload['name'];
            if (isset($payload['price'])) $data['price'] = $payload['price'];
            if (isset($payload['features'])) $data['features'] = json_encode($payload['features']);
            if (isset($payload['is_active'])) $data['is_active'] = $payload['is_active'];

            $this->packageModel->update($id, $data);
            return Utils::formatApiResponse(null, 'Package updated successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Error: ' . $e->getMessage(), 500);
        }
    }

    public function delete($id)
    {
        try {
            $package = $this->packageModel->find($id);
            if (!$package) {
                return Utils::formatApiResponse(null, 'Package not found', 404);
            }

            $this->packageModel->delete($id);
            return Utils::formatApiResponse(null, 'Package deleted successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Error: ' . $e->getMessage(), 500);
        }
    }

    public function toggleStatus($id)
    {
        try {
            $package = $this->packageModel->find($id);
            if (!$package) {
                return Utils::formatApiResponse(null, 'Package not found', 404);
            }

            $newStatus = $package['is_active'] ? 0 : 1;
            $this->packageModel->update($id, ['is_active' => $newStatus]);
            return Utils::formatApiResponse(null, 'Package status updated successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Error: ' . $e->getMessage(), 500);
        }
    }
}
