<?php
declare(strict_types=1);

namespace Api\Framework;

class Autoloader
{
    public static function register(string $prefix, string $path)
    {
        spl_autoload_register(function ($class) use($prefix, $path) {
            $len = strlen($prefix);
            if (strncmp($prefix, $class, $len) !== 0) {
                return;
            }
        
            $relative_class = substr($class, $len);
            $file = $path . str_replace('\\', '/', $relative_class) . '.php';
        
            if (file_exists($file)) {
                require $file;
            }
        });
    }
}