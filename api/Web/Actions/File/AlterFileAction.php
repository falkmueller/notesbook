<?php
declare(strict_types=1);

namespace Api\Web\Actions\File;

use Api\Domain\Library\FileLibrary;
use Api\Web\Abstraction\Action;

class AlterFileAction extends Action
{
    private FileLibrary $fileLibrary;

    public function __construct(FileLibrary $fileLibrary)
    {
        $this->fileLibrary =  $fileLibrary;  
    }

    protected function action()
    {
        $directoryId = $_GET["directory_id"];
        $fielName = $_GET["file_name"];
        $stream = file_get_contents('php://input');
        $success =  $this->fileLibrary->alterFile($directoryId, $fielName, $stream);
        $this->responseJson($success);
    }
}