<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\EnquiryModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Email\Email;

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
     * Store a new enquiry and send email
     */
    public function store()
    {
        $model = new EnquiryModel();
        $data  = $this->request->getJSON(true);

        if (!$data) {
            return $this->response
                        ->setJSON(['status' => 'error', 'message' => 'Invalid data'])
                        ->setStatusCode(ResponseInterface::HTTP_BAD_REQUEST);
        }

        log_message('info', 'Enquiry data: ' . print_r($data, true));

        // Insert enquiry into database
        $inserted = $model->insert([
            'name'       => $data['name'] ?? '',
            'email'      => $data['email'] ?? '',
            'phone'      => $data['phone'] ?? '',
            'eventType'  => $data['eventType'] ?? '',
            'eventDate'  => $data['eventDate'] ?? null,
            'message'    => $data['message'] ?? '',
        ]);

        if (!$inserted) {
            return $this->response
                        ->setJSON(['status' => 'error', 'message' => 'Failed to submit enquiry'])
                        ->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR);
        }

        // Send email notification
        $this->sendEnquiryEmail($data);

        return $this->response->setJSON([
            'status'  => 'success',
            'message' => 'Enquiry submitted successfully'
        ]);
    }

    /**
     * Send enquiry email
     */
    private function sendEnquiryEmail(array $data)
    {
        $email = \Config\Services::email();

        // Configure email (you can also set this in app/Config/Email.php)
        $email->setFrom('no-reply@yourdomain.com', 'RSPhotography');  // change to your email
        $email->setTo('rsphotography@gmail.com');                     // admin or studio email
        $email->setReplyTo($data['email'] ?? '', $data['name'] ?? '');

        $subject = 'New Enquiry Received - RSPhotography';
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

        if (!$email->send()) {
            log_message('error', 'Failed to send enquiry email: ' . print_r($email->printDebugger(['headers']), true));
        } else {
            log_message('info', 'Enquiry email sent successfully.');
        }
    }
}
