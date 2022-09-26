<?php
declare(strict_types=1);

use Api\Domain\Library\DirectoryLibrary;
use Api\Domain\Library\FileLibrary;
use Api\Framework\Container;

return function (Container $container){
    $container->add(Api\Web\Actions\Directory\ListDirectoryAction::class)->addArguments([DirectoryLibrary::class]);
    $container->add(Api\Web\Actions\Directory\CreateDirectoryAction::class)->addArguments([DirectoryLibrary::class]);
    $container->add(Api\Web\Actions\Directory\GetDirectoryAction::class)->addArguments([DirectoryLibrary::class]);
    $container->add(Api\Web\Actions\Directory\DeleteDirectoryAction::class)->addArguments([DirectoryLibrary::class]);
    $container->add(Api\Web\Actions\Directory\UpdateDirectoryAction::class)->addArguments([DirectoryLibrary::class]);
    $container->add(Api\Web\Actions\Directory\MoveDirectoryAction::class)->addArguments([DirectoryLibrary::class]);

    $container->add(Api\Web\Actions\File\GetFileAction::class)->addArguments([FileLibrary::class]);
    $container->add(Api\Web\Actions\File\AlterFileAction::class)->addArguments([FileLibrary::class]);

    $container->add(Api\Web\Middleware\RouterAuthMiddleware::class)->addArguments(["config"]);
    ;
};