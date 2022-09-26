<?php
declare(strict_types=1);

namespace Api\Framework;

use Closure;

class Router 
{
    const METHOD_GET = "GET";
    const METHOD_POST = "POST";
    const METHOD_DELETE = "DELETE";
    const METHOD_PATCH = "PATCH";
    private array $routes;
    private Container $container;

    private array $middleware; 

    public function __construct(Container $container)
    {
        $this->container = $container;
        $this->routes = [
            self::METHOD_GET => [],
            self::METHOD_POST => [],
            self::METHOD_DELETE => [],
            self::METHOD_PATCH => [],
        ];

        $this->middleware = [];
    }

    public function addMiddleware($middleware)
    {
        $this->middleware[] = $middleware;
    }

    public function add(string $method, string $path, $callable){
        $method = strtoupper($method);
        $this->routes[$method][$path] = $callable;
    }

    public function getMethod()
    {
        return strtoupper($_SERVER['REQUEST_METHOD']);
    }

    public function getBasePath()
    {
        $scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
        $uri = (string) parse_url('http://a' . $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);

        if (stripos($uri, $_SERVER['SCRIPT_NAME']) === 0) {
            return $_SERVER['SCRIPT_NAME'];
        }
        if ($scriptDir !== '/' && stripos($uri, $scriptDir) === 0) {
            return $scriptDir;
        }
        return '';
    }

    public function getPath()
    {
        $parsed_url = parse_url($_SERVER['REQUEST_URI']);

        if(isset($parsed_url['path']))
        {
            $path = $parsed_url['path'];
        }
        else
        {
            $path = '/';
        }

        return $path;
    }

    public function run()
    {
        $requestMethod = $this->getMethod();
        $requestPath = $this->getPath();

        $basePath = $this->getBasePath();
        
        foreach($this->routes[$requestMethod] as $routePath => $callable)
        {
            if("{$basePath}{$routePath}" != $requestPath){
                continue;
            }

           $this->callMiddlewareStack($callable);

            return;
        }

        header("HTTP/1.0 404 Not Found");
        echo "NOT FOUND";
    }

    private function callMiddlewareStack($callable){
        $this->middleware[] = new RouteExecutionMiddleware($this->container);

        $action = fn($input) => $input;
        foreach (array_reverse($this->middleware) as $middleware) {
            if(!is_callable($middleware))
            {
                $middleware = $this->container->resolve($middleware);
            }

            $action = fn($input) => $middleware($input, $action);
        }
        $action($callable);
    }
}