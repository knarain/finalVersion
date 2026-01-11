<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Libraries\Utils;
use App\Models\TaskModel;
use App\Helpers\EmailHelper;
use App\Helpers\ActionLogHelper;

class TaskController extends BaseController
{
    protected $taskModel;

    public function __construct()
    {
        $this->taskModel = new TaskModel();
    }

    public function index()
    {
        try {
            $tasks = $this->taskModel->orderBy('date', 'DESC')->findAll();
            return Utils::formatApiResponse(['data' => $tasks], 'Tasks fetched successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Error: ' . $e->getMessage(), 500);
        }
    }

    public function create()
    {
        try {
            $payload = $this->request->getJSON(true);

            if (empty($payload['date']) || empty($payload['task'])) {
                return Utils::formatApiResponse(null, 'date and task are required', 400);
            }

            $data = [
                'date' => $payload['date'],
                'task' => $payload['task'],
                'status' => $payload['status'] ?? 'Pending',
                'status_updated_by' => $payload['status_updated_by'] ?? null,
            ];

            $this->taskModel->insert($data);
            $taskId = $this->taskModel->insertID();

            ActionLogHelper::logAction(
                'Task Created',
                'Task "' . $payload['task'] . '" created',
                'Task',
                $taskId
            );

            return Utils::formatApiResponse(null, 'Task created successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Error: ' . $e->getMessage(), 500);
        }
    }

    public function update($id)
    {
        try {
            $payload = $this->request->getJSON(true);

            $task = $this->taskModel->find($id);
            if (!$task) {
                return Utils::formatApiResponse(null, 'Task not found', 404);
            }

            $data = [];
            if (isset($payload['date'])) $data['date'] = $payload['date'];
            if (isset($payload['task'])) $data['task'] = $payload['task'];
            if (isset($payload['status'])) $data['status'] = $payload['status'];
            if (isset($payload['status_updated_by'])) $data['status_updated_by'] = $payload['status_updated_by'];

            if (isset($payload['status']) && $payload['status'] !== $task['status']) {
                EmailHelper::sendTaskStatusNotification(
                    $id,
                    $task['task'],
                    $task['status'],
                    $payload['status'],
                    $payload['status_updated_by'] ?? 'System'
                );

                ActionLogHelper::logAction(
                    'Task Status Changed',
                    'Task status changed from "' . $task['status'] . '" to "' . $payload['status'] . '"',
                    'Task',
                    $id
                );
            }

            $this->taskModel->update($id, $data);
            return Utils::formatApiResponse(null, 'Task updated successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Error: ' . $e->getMessage(), 500);
        }
    }

    public function delete($id)
    {
        try {
            $task = $this->taskModel->find($id);
            if (!$task) {
                return Utils::formatApiResponse(null, 'Task not found', 404);
            }

            ActionLogHelper::logAction(
                'Task Deleted',
                'Task "' . $task['task'] . '" deleted',
                'Task',
                $id
            );

            $this->taskModel->delete($id);
            return Utils::formatApiResponse(null, 'Task deleted successfully');
        } catch (\Exception $e) {
            return Utils::formatApiResponse(null, 'Error: ' . $e->getMessage(), 500);
        }
    }
}
