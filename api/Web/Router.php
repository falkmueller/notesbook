<?php
declare(strict_types=1);

use Api\Framework\Container;
use Api\Framework\Router;

return function (Container $container){
    $router = new Router($container);

    $router->add(Router::METHOD_GET, "/", Api\Web\Actions\Directory\ListDirectoryAction::class);
    $router->add(Router::METHOD_POST, "/directory", Api\Web\Actions\Directory\CreateDirectoryAction::class);
    $router->add(Router::METHOD_GET, "/directory", Api\Web\Actions\Directory\GetDirectoryAction::class);

    $router->add(Router::METHOD_GET, "/file", Api\Web\Actions\File\GetFileAction::class);
    $router->add(Router::METHOD_POST, "/file", Api\Web\Actions\File\AlterFileAction::class);  

    $router->add(Router::METHOD_GET, "/content/get-page-title", Api\Web\Actions\Content\GetPageTitle::class);

    return $router;
};