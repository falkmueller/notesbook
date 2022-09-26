<?php
declare(strict_types=1);

namespace Api\Framework;

class RouteExecutionMiddleware
{
    private Container $container;

    public function __construct(Container $container)
    {
        $this->container = $container;
    }
 
    public function __invoke($callable, callable $next)
    {
        try {
            if(is_callable($callable))
            {
                $callable();
            }
            else
            {
                $callableObject = $this->container->resolve($callable);
                $callableObject();
            }
            
            $next(null);
            
        } catch (\Throwable $th) {
            header("HTTP/1.0 500 Internal Server Error");
            if(in_array($_SERVER['REMOTE_ADDR'], array('127.0.0.1', "::1"))){
                echo $th;
            }
        }
    }
}