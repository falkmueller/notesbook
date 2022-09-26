<?php
declare(strict_types=1);

namespace Api\Domain\Library;

use Exception;

class FileLibrary
{
    private DirectoryLibrary $directoryLibrary;

    public function __construct(DirectoryLibrary $directoryLibrary)
    {
        $this->directoryLibrary = $directoryLibrary;
    }

    public function getFilePath(string $directoryid, string $fileName)
    {
        $path = $this->directoryLibrary->getPathById($directoryid);
        $filePath = $path.DIRECTORY_SEPARATOR.$this->clearFileName($fileName);

        if(!file_exists($filePath))
        {
            throw new Exception("file {$filePath} not found");
        }

        return $filePath;
    }

    public function alterFile(string $directoryid, string $fileName, $stream)
    {
        $path = $this->directoryLibrary->getPathById($directoryid);
        $filePath = $path.DIRECTORY_SEPARATOR.$this->clearFileName($fileName);

        if(file_exists($filePath))
        {
            rename($filePath, dirname($filePath).DIRECTORY_SEPARATOR.date("Y-m-d_His")."_".basename($filePath));
        }

        if(!file_put_contents($filePath, $stream))
        {
            return false;
        }

        return true;
    }

    private function clearFileName($fileName)
    {
        return str_replace(["..", "/", "\\"], "_", $fileName);
    }
}