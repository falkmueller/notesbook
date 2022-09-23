<?php
declare(strict_types=1);

use Api\Domain\Handler\AlterFile\AlterFileHandler;
use Api\Domain\Handler\CreateDirectory\CreateDirectoryHandler;
use Api\Domain\Handler\GetContentTableHandler;
use Api\Domain\Handler\GetDirectoryHandler;
use Api\Domain\Handler\GetFileHandler;
use Api\Framework\Container;

return function (Container $container){
    $container->add(Api\Web\Actions\Directory\ListDirectoryAction::class)->addArguments([GetContentTableHandler::class]);
    $container->add(Api\Web\Actions\Directory\CreateDirectoryAction::class)->addArguments([CreateDirectoryHandler::class]);
    $container->add(Api\Web\Actions\Directory\GetDirectoryAction::class)->addArguments([GetDirectoryHandler::class]);

    $container->add(Api\Web\Actions\File\GetFileAction::class)->addArguments([GetFileHandler::class]);
    $container->add(Api\Web\Actions\File\AlterFileAction::class)->addArguments([AlterFileHandler::class]);
};