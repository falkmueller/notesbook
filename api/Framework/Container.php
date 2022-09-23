<?php
declare(strict_types=1);

namespace Api\Framework;

use Exception;

class Container 
{
    private array $definitions;

    public function __construct()
    {
        $this->definitions = [];
    }

    public function add(string $id, $concrete = null) : ContainerObject
    {
        $containerObject = new ContainerObject($concrete ?? $id);

        $this->definitions[$id] = $containerObject;

        return $containerObject;
    }

    public function has(string $id)
    {
        return isset($this->definitions[$id]);
    }

    public function resolve(string $id)
    {
        if(!$this->has($id))
        {
            try {
                return $this->autoResolve($id);
            } catch (\Throwable $th) {
                throw new Exception("Dependency {$id} is not registrated");
            }
        }

        return $this->definitions[$id]->getObject($this);
    }

    public function autoResolve(string $id)
    {
        $containerObject = new ContainerObject($id);
        $object = $containerObject->getObject($this);
        $this->definitions[$id] = $containerObject;

        return $object;
    }
}