<?php

namespace App\Helpers;

use Config\Email;

class EmailHelper
{
    public static function sendTaskStatusNotification($taskId, $taskName, $oldStatus, $newStatus, $updatedBy)
    {
        try {
            $email = service('email');
            $emailConfig = new Email();

            // Get all active admins with admin role (role_id = 1)
            $adminModel = new \App\Models\AdminModel();
            $admins = $adminModel
                ->where('is_active', 1)
                ->where('role_id', 1)
                ->findAll();

            if (empty($admins)) {
                return false;
            }

            $subject = "Task Status Updated: {$taskName}";
            $message = view('email_templates/task_status_update', [
                'taskId' => $taskId,
                'taskName' => $taskName,
                'oldStatus' => $oldStatus,
                'newStatus' => $newStatus,
                'updatedBy' => $updatedBy,
            ]);

            $email->setFrom($emailConfig->fromEmail, $emailConfig->fromName);
            $email->setSubject($subject);
            $email->setMessage($message);

            foreach ($admins as $admin) {
                $email->setTo($admin['email']);
                if (!$email->send()) {
                    log_message('error', 'Failed to send task status email to ' . $admin['email']);
                }
            }

            return true;
        } catch (\Exception $e) {
            log_message('error', 'Email error: ' . $e->getMessage());
            return false;
        }
    }
}
