<?php
declare(strict_types=1);

namespace Api\Domain\Models;

class DirectoryModel
{
    public string $id;
    public string $parentId;
    public string $title;
    public array $childs;
}