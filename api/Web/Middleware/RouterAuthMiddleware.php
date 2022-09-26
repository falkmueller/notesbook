<?php
declare(strict_types=1);

namespace Api\Web\Middleware;

use Api\Framework\Container;
use Api\Framework\JwtEncoder;

class RouterAuthMiddleware
{
    private array $config;

    public function __construct(array $config)
    {
        $this->config = $config["authority"];
    }
 
    public function __invoke($callable, callable $next)
    {
        $token = $this->getBearerToken();
        if(!$token && !empty($_GET["token"]))
        {
            $token = $_GET["token"];
        }

        if(!$token){
            return $this->Set401();
        }

        $jwtEncoder = new JwtEncoder($this->config["private_key"]);
        
        try {
            $claims = $jwtEncoder->parse($token);
        } catch (\Throwable $th) {
            return $this->Set401();
        }
       
        return $next($callable);
    }

    protected function Set401(){
        header("HTTP/1.1 401 Unauthorized");
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(["redirect" => $this->config["url"]."?auth=1"]);
        return null;
    }

    /** 
     * Get hearder Authorization
     * */
    private function getAuthorizationHeader(){
        $headers = null;
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        }
        else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { //Nginx or fast CGI
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            // Server-side fix for bug in old Android versions (a nice side-effect of this fix means we don't care about capitalization for Authorization)
            $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
            //print_r($requestHeaders);
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }
        return $headers;
    }
    /**
     * get access token from header
     * */
    private function getBearerToken() {
        $headers = $this->getAuthorizationHeader();
        
        if (!empty($headers)) {
            if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
                return $matches[1];
            }
        }
        return null;
    }
}