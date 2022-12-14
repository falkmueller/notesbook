<?php
declare(strict_types=1);

namespace Api\Web\Actions\Directory;

use Api\Domain\Library\DirectoryLibrary;
use Api\Web\Abstraction\Action;

class CreateDirectoryAction extends Action
{
    private DirectoryLibrary $directoryLibrary;

    public function __construct(DirectoryLibrary $directoryLibrary)
    {
        $this->directoryLibrary =  $directoryLibrary;  
    }

    protected function action()
    {
        $body = $this->getParsedBody();
        $title = $body["title"];
        $parentId = $body["parent_id"];
        
        $response =  $this->directoryLibrary->createDirectory($parentId, $title);
        $this->responseJson($response);
    }
}