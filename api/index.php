<?php
declare(strict_types=1);

use Api\Framework\Autoloader;
use Api\Framework\Container;

//register autoloader
require_once(__dir__."/Framework/Autoloader.php");
Autoloader::register('Api\\', __DIR__ . '/');

//register dependencies
$container = new Container();
$container->add("config", function() { return require(__dir__."/config.php"); });
$dependencyRegistration = require_once(__dir__."/Web/Dependencies.php");
$dependencyRegistration($container);
$dependencyRegistration = require_once(__dir__."/Domain/Dependencies.php");
$dependencyRegistration($container);

//add routes
$routerFactory = require_once(__dir__."/Web/Router.php");
$router = $routerFactory($container);

//run
$router->run();