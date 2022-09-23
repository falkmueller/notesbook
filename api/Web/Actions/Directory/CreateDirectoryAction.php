<?php
declare(strict_types=1);

namespace Api\Web\Actions\Directory;

use Api\Domain\Handler\CreateDirectory\CreateDirectoryHandler;
use Api\Domain\Handler\CreateDirectory\CreateDirectoryRequest;
use Api\Web\Abstraction\Action;

class CreateDirectoryAction extends Action
{
    private CreateDirectoryHandler $handler;

    public function __construct(CreateDirectoryHandler $handler)
    {
        $this->handler =  $handler;  
    }

    protected function action()
    {
        $body = $this->getParsedBody();
        $domainRequest = new CreateDirectoryRequest();
        $domainRequest->title = $body["title"];
        $domainRequest->parentId = $body["parent_id"];
        
        $response = $this->handler->handle($domainRequest);
        $this->responseJson($response);
    }
}