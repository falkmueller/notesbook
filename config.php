<?php
declare(strict_types=1);

$defaults = [
    "files_dir" => __dir__.'/files',
    "authority" => [
        "url" => "auth.php",
        "private_key" => "5713ca2b-b0e7-4e8a-975d-7aa1eaf21e6b",
        "accounts" => [
            "test" => "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"// sha256("test")
        ]
    ],
];

if(!file_exists("config.local.php")){
    return $defaults;
}

return array_merge($defaults, require("config.local.php"));