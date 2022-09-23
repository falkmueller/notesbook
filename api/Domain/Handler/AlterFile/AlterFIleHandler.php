<?php
declare(strict_types=1);

namespace Api\Domain\Handler\AlterFile;

use Exception;

class AlterFileHandler 
{
    private string $baseDir;

    public function __construct(array $config)
    {
        $this->baseDir = rtrim($config["files_dir"], DIRECTORY_SEPARATOR);
    }

    public function handle(AlterFileRequest $request)
    {
        $filename = urlencode($request->fielName);
        $directory = $this->getDirectory($request->directoryId);
        $path = "{$directory}{DIRECTORY_SEPARATOR}{$filename}";

        if(!file_put_contents($path, $request->stream)){
            return false;
        }

        return true;
    }

    private function getDirectory(string $directoryId)
    {
        $files = glob("{$this->baseDir}/{$directoryId}_*");

        if(empty($files)){
            throw new Exception("directory not found");
        }

        return $files[0];
    }

}