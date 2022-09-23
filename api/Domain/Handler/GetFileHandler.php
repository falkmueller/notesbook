<?php
declare(strict_types=1);

namespace Api\Domain\Handler;

use Exception;

class GetFileHandler
{
    private string $baseDir;

    public function __construct(array $config)
    {
        $this->baseDir = rtrim($config["files_dir"], DIRECTORY_SEPARATOR);
    }

    public function handle(string $directoryId, string $fileName)
    {
        $filePath = $this->GetPath($directoryId).DIRECTORY_SEPARATOR.$this->clearFileName($fileName);

        if(!file_exists($filePath))
        {
            throw new Exception("file {$filePath} not found");
        }

        return $filePath;
    }

    private function clearFileName($fileName){
        return str_replace(["..", "/", "\\"], "_", $fileName);
    }

    private function GetPath(string $directoryId)
    {
        $files = glob("{$this->baseDir}/{$directoryId}_*");

        if(empty($files)){
            throw new Exception("directory not found");
        }

        return $files[0];
    }
}