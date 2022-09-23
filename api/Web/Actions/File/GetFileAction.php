<?php
declare(strict_types=1);

namespace Api\Web\Actions\File;

use Api\Domain\Handler\GetFileHandler;
use Api\Web\Abstraction\Action;

class GetFileAction extends Action
{
    private GetFileHandler $handler;

    public function __construct(GetFileHandler $handler)
    {
        $this->handler =  $handler;  
    }

    protected function action()
    {
        $directoryId = $_GET["directory_id"];
        $filename = $_GET["file_name"];
        $file =  $this->handler->handle($directoryId, $filename);
        $this->responseFile($file);
    }
}