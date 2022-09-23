<?php
declare(strict_types=1);

namespace Api\Domain\Handler;

use Api\Domain\Models\DirectoryModel;
use Exception;

class GetContentTableHandler 
{
    private string $baseDir;

    public function __construct(array $config)
    {
        $this->baseDir = rtrim($config["files_dir"], DIRECTORY_SEPARATOR);
    }

    public function handle() : DirectoryModel
    {
        $root = new DirectoryModel();
        $root->path = "";
        $root->childs = [];

        $files = scandir($this->baseDir); 
        sort($files);

        $directoryList = [];
        $directoryList[""] = $root;

        foreach($files as $file) 
        {
            if($file == '.' || $file == '..' || $file == '.gitignore') continue;
            $directory = $this->getDirectoryByFilename($file);
            
            if(!isset($directoryList["{$directory->parentId}"]))
            {
                throw new Exception("parent {$directory->parentId} directory not exists");        
            }

            $directoryList["{$directory->parentId}"]->childs[] = $directory;
            $directoryList["{$directory->id}"] = $directory;
        }

        foreach($directoryList as $directory)
        {
            $this->sortChilds($directory);
        }

        return $root;
    }

    private function getDirectoryByFilename(string $file)
    {
        $split = explode("_", $file, 2);
        $id = $split[0];
        $title = urldecode($split[1]);
        $parentId = $this->getParentId($id);
        
        $directory = new DirectoryModel();
        $directory->title = $title;
        $directory->id = $id;
        $directory->parentId = $parentId;
        $directory->path = $file;
        $directory->childs = [];

        return $directory;
    }

    private function getParentId(string $id)
    {
        $parts = explode(".", $id);
        $partsCount = count($parts);
        $parentId = "";
        for($i = 0;$i < $partsCount; $i++)
        {
            $nextVal = !empty($parts[$i+1]) ? $parts[$i+1] : str_repeat("0", strlen($parts[$i]));
            if(intval($nextVal) > 0)
            {
                $parentId .= "{$parts[$i]}.";
                continue;
            }

            if($i == 0){
                break;
            }

            $parentId .= "{$nextVal}.";
        }

        $parentId = trim($parentId, ".");

        return $parentId;
    }

    private function sortChilds(DirectoryModel $directory)
    {
        usort($directory->childs, function($a, $b){
            return strcmp($a->id, $b->id);
        });
    }
}