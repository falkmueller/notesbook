<?php
declare(strict_types=1);

namespace Api\Web\Actions\Directory;

use Api\Domain\Handler\GetContentTableHandler;
use Api\Web\Abstraction\Action;

class ListDirectoryAction extends Action
{
    private GetContentTableHandler $handler;

    public function __construct(GetContentTableHandler $handler)
    {
        $this->handler =  $handler;  
    }

    protected function action()
    {
        $response =  $this->handler->handle();
        $this->responseJson($response);
    }
}