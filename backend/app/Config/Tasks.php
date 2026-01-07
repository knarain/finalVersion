<?php

namespace App\Config;

use CodeIgniter\Config\BaseConfig;
use CodeIgniter\Tasks\Config\Tasks as BaseTasks;

class Tasks extends BaseTasks
{
    public function init()
    {
        $this->command('cleanup:tokens')->everyMinute(15);
    }
}