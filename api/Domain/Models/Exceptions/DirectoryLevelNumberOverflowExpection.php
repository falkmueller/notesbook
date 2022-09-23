<?php
declare(strict_types=1);

namespace Api\Domain\Models\Exceptions;

use Exception;

class DirectoryLevelNumberOverflowExpection extends Exception
{
    public int $level;

    public function __construct($level) {
        $this->level = $level;
        parent::__construct("", 0, null);
    }
}