<?php
declare(strict_types=1);

namespace Api\Domain\Handler\CreateDirectory;

class CreateDirectoryRequest 
{
    public string $parentId;
    public string $title;
}