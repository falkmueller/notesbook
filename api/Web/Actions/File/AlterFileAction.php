<?php
declare(strict_types=1);

namespace Api\Web\Actions\File;

use Api\Domain\Handler\AlterFile\AlterFileHandler;
use Api\Domain\Handler\AlterFile\AlterFileRequest;
use Api\Web\Abstraction\Action;

class AlterFileAction extends Action
{
    private AlterFileHandler $handler;

    public function __construct(AlterFileHandler $handler)
    {
        $this->handler =  $handler;  
    }

    protected function action()
    {
        $request = new AlterFileRequest();
        $request->directoryId = $_GET["directory_id"];
        $request->fielName = $_GET["file_name"];
        $request->stream = file_get_contents('php://input');
        $success =  $this->handler->handle($request);
        $this->responseJson($success);
    }
}