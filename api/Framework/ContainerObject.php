<?php
declare(strict_types=1);

namespace Api\Framework;

use Exception;

class ContainerObject
{
    private $callable;
    private array $arguments;
    private $object;

    public function __construct($callable)
    {
        $this->callable = $callable;
        $this->arguments = [];
    }

    public function addArguments(array $args)
    {
        $this->arguments = $args;
    }

    public function getObject(Container $container)
    {
        if(!$this->object)
        {
            $this->createObject($container);
        }

        return $this->object;
    }

    private function createObject(Container $container)
    {
        $args = [];
        foreach($this->arguments as $argId)
        {
            $args[] = $container->resolve($argId);
        }

        $callable = $this->callable;
       
        if(is_string($callable) && class_exists($callable))
        {
            $this->object = new $callable(...$args);
        }
        elseif(is_callable($callable))
        {
            $this->object = $callable(...$args);
        }
        else
        {
            throw new Exception("dependency is not a callable and not a existing class");
        }
    }
}