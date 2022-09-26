<?php
declare(strict_types=1);

namespace Api\Web\Actions\Directory;

use Api\Domain\Library\DirectoryLibrary;
use Api\Web\Abstraction\Action;

class UpdateDirectoryAction extends Action
{
    private DirectoryLibrary $directoryLibrary;

    public function __construct(DirectoryLibrary $directoryLibrary)
    {
        $this->directoryLibrary =  $directoryLibrary;  
    }

    protected function action()
    {
        $body = $this->getParsedBody();
        $directoryId = $body["id"];
        $title = $body["title"];
        
        $response = $this->directoryLibrary->renameDirectory($directoryId, $title);
        $this->responseJson($response);
    }
}