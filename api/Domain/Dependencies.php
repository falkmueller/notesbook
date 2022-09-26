<?php
declare(strict_types=1);

use Api\Domain\Handler;
use Api\Domain\Library\DirectoryLibrary;
use Api\Domain\Library\FileLibrary;
use Api\Framework\Container;

return function (Container $container){
    $container->add(DirectoryLibrary::class)->addArguments(["config"]);
    $container->add(FileLibrary::class)->addArguments([DirectoryLibrary::class]);
};