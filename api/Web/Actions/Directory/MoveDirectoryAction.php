<?php
declare(strict_types=1);

namespace Api\Web\Actions\Directory;

use Api\Domain\Library\DirectoryLibrary;
use Api\Web\Abstraction\Action;

class MoveDirectoryAction extends Action
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
        $direction = intval($body["direction"]);
        $moveLevel = !!$body["moveLevel"];

        if($moveLevel){
            $response = $this->directoryLibrary->moveDirectoryLevel($directoryId, $direction);
        } else  {
            $response = $this->directoryLibrary->sortDirectory($directoryId, $direction);
        }
        
        $this->responseJson($response);
    }
}