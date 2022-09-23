<?php
declare(strict_types=1);

namespace Api\Domain\Handler\AlterFile;

class AlterFileRequest 
{
    public string $directoryId;
    public string $fielName;
    public $stream;
}