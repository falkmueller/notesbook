<?php
declare(strict_types=1);

namespace Api\Web\Actions\Directory;

use Api\Domain\Handler\GetContentTableHandler;
use Api\Domain\Handler\GetDirectoryHandler;
use Api\Web\Abstraction\Action;

class GetDirectoryAction extends Action
{
    private GetDirectoryHandler $handler;

    public function __construct(GetDirectoryHandler $handler)
    {
        $this->handler =  $handler;  
    }

    protected function action()
    {
        $id = $_GET["id"];
        $response =  $this->handler->handle($id);
        $this->responseJson($response);
    }
}