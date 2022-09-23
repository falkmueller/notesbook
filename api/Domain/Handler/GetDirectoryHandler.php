<?php
declare(strict_types=1);

namespace Api\Domain\Handler;

use Api\Domain\Models\DirectoryModel;
use Exception;

class GetDirectoryHandler 
{
    private string $baseDir;

    public function __construct(array $config)
    {
        $this->baseDir = rtrim($config["files_dir"], DIRECTORY_SEPARATOR);
    }

    public function handle($id) : DirectoryModel
    {
        $dir = new DirectoryModel();

        $files = glob("{$this->baseDir}/{$id}_*");

        if(empty($files)){
            throw new Exception("directory not found");
        }

        $file = basename($files[0]);

        $filenameParts = explode("_", $file, 2);
        $dir->id = $filenameParts[0];
        $dir->title = $filenameParts[1]; 
        
        return $dir;
    }

}