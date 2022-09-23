<?php
declare(strict_types=1);

use Api\Domain\Handler;
use Api\Framework\Container;

return function (Container $container){
    $container->add(Handler\GetContentTableHandler::class)->addArguments(["config"]);
    $container->add(Handler\CreateDirectory\CreateDirectoryHandler::class)->addArguments(["config"]);
    $container->add(Handler\GetDirectoryHandler::class)->addArguments(["config"]);
    
    $container->add(Handler\GetFileHandler::class)->addArguments(["config"]);
    $container->add(Handler\AlterFile\AlterFileHandler::class)->addArguments(["config"]);
    
};