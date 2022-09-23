<?php
declare(strict_types=1);

namespace Api\Domain\Handler\CreateDirectory;

use Api\Domain\Models\Exceptions\DirectoryLevelNumberOverflowExpection;
use Api\Domain\Models\Exceptions\DirectoryLevelOverflowExpection;
use Exception;

class CreateDirectoryHandler 
{
    private string $baseDir;

    public function __construct(array $config)
    {
        $this->baseDir = rtrim($config["files_dir"], DIRECTORY_SEPARATOR);
    }

    public function handle(CreateDirectoryRequest $request)
    {
        $parentId = $request->parentId;

        try {
            $id = $this->buildId($parentId);
        } catch (DirectoryLevelOverflowExpection $th) {
            $this->addNewLevel();
            $id = $this->buildId($parentId.".0");
        } catch (DirectoryLevelNumberOverflowExpection $th) {
            $this->extendLevel($th->level);
            $id = $this->buildId($parentId);
        }
        
        $encodeTitle = urlencode($request->title);
        $folder = "{$id}_{$encodeTitle}";

        if(!mkdir($this->baseDir.DIRECTORY_SEPARATOR.$folder))
        {
            throw new Exception("can not create directory");
        }

        return true;
    }

    private function buildId($parentId)
    {
        $parentParts = explode(".", $parentId);
        if(empty($parentId)){
            $parentParts = explode(".", $this->getDefaultId());
        }
        $partsCount = count($parentParts);
        $newId = "";

        
        for($i = 0;$i < $partsCount; $i++)
        {
            if(intval($parentParts[$i]) > 0)
            {
                $newId .= "{$parentParts[$i]}.";
                if($i == ($partsCount - 1))
                {
                    throw new DirectoryLevelOverflowExpection();
                }
                continue;
            }

            if($i > 0 && intval($parentParts[$i-1]) == 0)
            {
                $newId .= "{$parentParts[$i]}.";
                continue;
            }

            $nextVal = $this->getNextPart($newId);
            $newId .= "{$nextVal}.";
        }

        $newId = trim($newId, ".");

        return $newId;
    }

    private function getNextPart($prefix){
        $files = scandir($this->baseDir); 
        rsort($files);

        foreach($files as $file) 
        {
            if($file == '.' || $file == '..') continue;
            if(!empty($prefix) && strpos( $file , $prefix) !== 0){
                continue;
            }

            $split = explode("_", $file, 2);
            $id = $split[0];
            $id = trim(substr($id, strlen($prefix)), ".");

            $parts = explode(".", $id);
            $part = $parts[0];
            
            $intval = intval($part);
            $intval++;

            $newpart = str_pad("{$intval}", strlen($part), "0", STR_PAD_LEFT);

            if(strlen($newpart) > strlen($part)){
                $level = count(explode(".", trim($prefix, ".")));
                if(empty($prefix)){
                    $level = 0;
                }
                throw new DirectoryLevelNumberOverflowExpection($level);
            }

            return $newpart;
        }

        return "1";
    }

    private function getDefaultId(){
        $files = scandir($this->baseDir); 

        foreach($files as $file) 
        {
            if($file == '.' || $file == '..') continue;
           
            $split = explode("_", $file, 2);
            $id = $split[0];
            return preg_replace('/[0-9]/', '0', $id);
        }

        return "0";
    }

    /**
     * example 0.0.0 => 0.0.0.0
     */
    private function addNewLevel()
    {
        $files = scandir($this->baseDir); 

        foreach($files as $file) 
        {
            if($file == '.' || $file == '..') continue;
            $split = explode("_", $file, 2);
            $id = $split[0];
            $title = $split[1];

            $newFile = "{$id}.0_{$title}";

            $success = rename($this->baseDir.DIRECTORY_SEPARATOR.$file,
            $this->baseDir.DIRECTORY_SEPARATOR.$newFile);

            if(!$success){
                throw new Exception("can not rename directory {$file}");
            }
        }
    }

    /**
     * extend the level ob the id 
     * example 0.0.0 by level 2 => 0.00.0
     */
    private function extendLevel(int $level)
    {
        $files = scandir($this->baseDir); 

        foreach($files as $file) 
        {
            if($file == '.' || $file == '..') continue;
            $split = explode("_", $file, 2);
            $id = $split[0];
            $title = $split[1];

            $idParts = explode(".", $id);

            $idParts[$level] = "0".$idParts[$level];

            $newId = implode(".", $idParts);
            $newFile = "{$newId}_{$title}";

            $success = rename($this->baseDir.DIRECTORY_SEPARATOR.$file,
            $this->baseDir.DIRECTORY_SEPARATOR.$newFile);

            if(!$success){
                throw new Exception("can not rename directory {$file}");
            }
        }
    }
}