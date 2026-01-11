<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\EnquiryModel;
use App\Libraries\Utils;
use CodeIgniter\HTTP\ResponseInterface;

class Enquiries extends BaseController
{
    /**
     * Get all enquiries (admin only)
     */
    public function index()
    {
        $user = Utils::getAuthenticatedUser();

        if ($user instanceof \CodeIgniter\HTTP\Response) {
            return $user;
        }

        $roleId = $user['role_id'] ?? null;
        if (!$roleId || !Utils::checkPermission($roleId, 'Enquiries', 'READ')) {
            return Utils::formatApiResponse(null, 'You do not have permission', 403);
        }

        $model = new EnquiryModel();
        $enquiries = $model
            ->orderBy('created_at', 'DESC')
            ->findAll();

        return Utils::formatApiResponse(
            $enquiries,
            'Enquiries fetched successfully',
            200
        );
    }

    /**
     * Store a new enquiry (public)
     */
    public function store()
    {
        $model = new EnquiryModel();
        $data  = $this->request->getJSON(true);

        if (! $data) {
            return Utils::formatApiResponse(
                null,
                'Invalid data',
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        log_message('info', 'Enquiry data: ' . print_r($data, true));

        $insertData = [
            'name'       => $data['name'] ?? '',
            'email'      => $data['email'] ?? '',
            'phone'      => $data['phone'] ?? '',
            'eventType'  => $data['eventType'] ?? '',
            'eventDate'  => $data['eventDate'] ?? null,
            'message'    => $data['message'] ?? '',
        ];

        try {
            $inserted = $model->insert($insertData, false);
            
            if (! $inserted) {
                log_message('error', 'Failed to insert enquiry. Model errors: ' . print_r($model->errors(), true));
                $dbError = $model->db->error();
                log_message('error', 'Database error: ' . ($dbError ?? 'Unknown'));
                return Utils::formatApiResponse(
                    null,
                    'Failed to submit enquiry',
                    ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
                );
            }
        } catch (\Throwable $e) {
            log_message('error', 'Insert exception: ' . $e->getMessage());
            return Utils::formatApiResponse(
                null,
                'Failed to submit enquiry: ' . $e->getMessage(),
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }

        try {
            $this->sendEnquiryEmail($data);
        } catch (\Throwable $e) {
            log_message('error', 'Email error: ' . $e->getMessage());
        }

        return Utils::formatApiResponse(
            null,
            'Enquiry submitted successfully',
            ResponseInterface::HTTP_CREATED
        );
    }

    /**
     * Send enquiry email
     */
    private function sendEnquiryEmail(array $data): void
    {
        $email = \Config\Services::email();

        $email->setFrom(
            'contactus@rashmiphotography.com',
            'RashmiPhotography'
        );

        $email->setTo('sumithbandela@gmail.com');
        $email->setReplyTo(
            $data['email'] ?? '',
            $data['name'] ?? ''
        );

        $subject = 'New Enquiry Received - RashmiPhotography';

        $message = "
            <h2>New Enquiry Details</h2>
            <p><strong>Name:</strong> {$data['name']}</p>
            <p><strong>Email:</strong> {$data['email']}</p>
            <p><strong>Phone:</strong> {$data['phone']}</p>
            <p><strong>Event Type:</strong> {$data['eventType']}</p>
            <p><strong>Event Date:</strong> {$data['eventDate']}</p>
            <p><strong>Message:</strong><br>{$data['message']}</p>
        ";

        $email->setSubject($subject);
        $email->setMessage($message);
        $email->setMailType('html');

        if (! $email->send()) {
            log_message(
                'error',
                'Failed to send enquiry email: ' .
                print_r($email->printDebugger(['headers']), true)
            );
        } else {
            log_message('info', 'Enquiry email sent successfully.');
        }
    }
}
