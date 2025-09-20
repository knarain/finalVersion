<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\EnquiryModel;
use CodeIgniter\HTTP\ResponseInterface;

class Enquiries extends BaseController
{
    /**
     * Get all enquiries
     */
    public function index()
    {
        $model = new EnquiryModel();
        $enquiries = $model->orderBy('created_at', 'DESC')->findAll();

        return $this->response->setJSON([
            'status' => 'success',
            'data'   => $enquiries
        ]);
    }

    /**
     * Store a new enquiry
     */
    public function store()
    {
        $model = new EnquiryModel();

        // Get JSON input as associative array
        $data = $this->request->getJSON(true);

        if (!$data) {
            return $this->response
                        ->setJSON(['status' => 'error', 'message' => 'Invalid data'])
                        ->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST);
        }

        // Log incoming data for debugging
        log_message('info', 'Enquiry data: ' . print_r($data, true));

        // Insert data into database
        $inserted = $model->insert([
            'name'       => $data['name'] ?? '',
            'email'      => $data['email'] ?? '',
            'phone'      => $data['phone'] ?? '',
            'eventType'  => $data['eventType'] ?? '',
            'eventDate'  => $data['eventDate'] ?? null,
            'message'    => $data['message'] ?? '',
        ]);

        if (!$inserted) {
            // Failed to insert
            return $this->response
                        ->setJSON(['status' => 'error', 'message' => 'Failed to submit enquiry'])
                        ->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->response->setJSON([
            'status'  => 'success',
            'message' => 'Enquiry submitted successfully'
        ]);
    }
}
