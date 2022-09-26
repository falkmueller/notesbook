<?php
declare(strict_types=1);

namespace Api\Domain\Library;

use Exception;

class DirectoryLibrary
{
    private string $baseDir;
    CONST NUMBER_LENGTH = 3;

    public function __construct(array $config)
    {
        $this->baseDir = rtrim($config["files_dir"], DIRECTORY_SEPARATOR);
    }

    public function getDirectoryTree()
    {
       return $this->getDirectoryTreeRecursive($this->baseDir, "");
    }

    private function getDirectoryTreeRecursive($path, $parentId)
    {
        $children = glob("{$path}/*", GLOB_ONLYDIR);
        sort($children);
        $returnValue = [];

        foreach($children as $childPath)
        {
            $parts = explode("_", basename($childPath), 2);
            $title = urldecode($parts[1]);
            $id = $parentId ? "{$parentId}.{$parts[0]}" : $parts[0];
            $returnValue[] = [
                "id" => $id,
                "title" => $title,
                "children" => $this->getDirectoryTreeRecursive($childPath, $id)
            ];
        }

        return $returnValue;
    }

    public function getDirectoryTitle(string $directoryid)
    {
        $path = $this->getPathById($directoryid);
        $parts = explode("_", basename($path), 2);
        $title = urldecode($parts[1]);

        return $title;
    }

    public function moveDirectoryLevel(string $directoryid, $direction)
    {
        $path = $this->getPathById($directoryid);
        $parts = explode("_", basename($path), 2);
        $encodeTitle = $parts[1];
        $newParent = null;
        
        if($direction < 0)
        {
            $newParent = dirname($path, 2);
        }
        else {
            $siblings = $this->GetSibling($directoryid);
    
            $newParent = $siblings["prev"];
            if(!$newParent)
            {
                $newParent = $siblings["next"];
            }
        }

        if(!$newParent || strlen($newParent) < strlen($this->baseDir))
        {
            return false;
        }

        $newNumber = $this->GetNextNumber($newParent);
        $newDirectory =  $newParent.DIRECTORY_SEPARATOR."{$newNumber}_{$encodeTitle}";
        return @rename($path, $newDirectory);
    }

    public function sortDirectory(string $directoryid, $direction)
    {
        $path = $this->getPathById($directoryid);
        $directoryName = basename($path);
        $parentPath = dirname($path);
        $siblings = $this->GetSibling($directoryid);

        if($direction < 0)
        {
           $siblingPath = $siblings["prev"];
        } else 
        {
            $siblingPath = $siblings["next"];
        }
        
        if(!$siblingPath)
        {
            return false;
        }

        $parts = explode("_", $directoryName, 2);
        $directoryNumber = $parts[0];
        $directoryTitle = $parts[1];

        $siblingDirectoryname =  basename($siblingPath);
        $parts2 = explode("_", $siblingDirectoryname, 2);
        $siblingNumber = $parts2[0];
        $siblingTitle = $parts2[1];

        $success = @rename($path, $path.".temp");
        $success &= @rename($siblingPath, $parentPath.DIRECTORY_SEPARATOR."{$directoryNumber}_{$siblingTitle}");
        $success &= @rename($path.".temp", $parentPath.DIRECTORY_SEPARATOR."{$siblingNumber}_{$directoryTitle}");

        return $success;
    }

    private function GetSibling(string $directoryid)
    {
        $path = $this->getPathById($directoryid);
        $directoryName = basename($path);
        $parentPath = dirname($path);

        $children = glob("{$parentPath}/*", GLOB_ONLYDIR);
        sort($children);
        $sibling = [
            "prev" => null,
            "next" => null,
        ];

        $currentIdx = array_search($path, $children);

        if($currentIdx > 0)
        {
            $sibling["prev"] = $children[$currentIdx - 1];
        }
        
        if($currentIdx < (count($children) - 1))
        {
            $sibling["next"] = $children[$currentIdx + 1];
        }

        return $sibling;
    }

    public function deleteDirectory(string $id)
    {
        $path = $this->getPathById($id);
        return $this->deleteDirectoryRecursive($path);
    }

    private function deleteDirectoryRecursive($dir)
    { 
        $files = array_diff(scandir($dir), array('.','..')); 

        foreach ($files as $file)
        {
           if(is_dir("$dir/$file"))
           {
            $this->deleteDirectoryRecursive("$dir/$file");
           } 
           else 
           {
            @unlink("$dir/$file");
           }
        }
         
        return @rmdir($dir); 
    } 

    public function renameDirectory(string $id, $title)
    {
        $path = $this->getPathById($id);
        $parentDirectory = dirname($path);
        $encodeTitle = urlencode($title);
        $newDirectory = "{$parentDirectory}/{$id}_{$encodeTitle}";

        return @rename($path, $newDirectory);
    }

    public function createDirectory(string $parentId, $title)
    {
        $path = $this->getPathById($parentId);
        $number = $this->GetNextNumber($path);
        $encodeTitle = urlencode($title);
        $newDirectory = "{$path}/{$number}_{$encodeTitle}";

        if(@mkdir($newDirectory))
        {
            return $parentId ? "{$parentId}.{$number}" : $number;
        }

        return null;
    }

    private function GetNextNumber($parentPath)
    {
        $files = glob("{$parentPath}/*", GLOB_ONLYDIR);
        rsort($files);

        $lastId = 0;
        if(count($files) > 0){
            $lastfile = basename($files[0]);
            $parts = explode("_", $lastfile, 2);
            $lastId = intval($parts[0]);
        }

        $nextId = $lastId + 1;
        return str_pad("{$nextId}", self::NUMBER_LENGTH, "0", STR_PAD_LEFT);
    }

    public function getPathById($id)
    {
        $idParts = explode(".", $id);

        $path = $this->baseDir;

        foreach($idParts as $idPart){
            if(empty($idPart)){
                continue;
            }

            $files = glob("{$path}/{$idPart}_*", GLOB_ONLYDIR);
            $path = $files[0];
        }

        return $path;
    }
}