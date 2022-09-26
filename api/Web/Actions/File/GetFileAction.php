<?php
declare(strict_types=1);

namespace Api\Web\Actions\File;

use Api\Domain\Library\FileLibrary;
use Api\Web\Abstraction\Action;

class GetFileAction extends Action
{
    private FileLibrary $fileLibrary;

    public function __construct(FileLibrary $fileLibrary)
    {
        $this->fileLibrary =  $fileLibrary;  
    }

    protected function action()
    {
        $directoryId = $_GET["directory_id"];
        $filename = $_GET["file_name"];
        try {
            $file = $this->fileLibrary ->getFilePath($directoryId, $filename);
            $this->responseFile($file);
        } catch (\Throwable $th) {
            http_response_code(404);
        }
    }
}