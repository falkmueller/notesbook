<?php
declare(strict_types=1);

namespace Api\Web\Actions\Directory;

use Api\Domain\Library\DirectoryLibrary;
use Api\Web\Abstraction\Action;

class DeleteDirectoryAction extends Action
{
    private DirectoryLibrary $directoryLibrary;

    public function __construct(DirectoryLibrary $directoryLibrary)
    {
        $this->directoryLibrary =  $directoryLibrary;  
    }

    protected function action()
    {
        $id = $_GET["id"];
        $response =  $this->directoryLibrary->deleteDirectory($id);
        $this->responseJson($response);
    }
}