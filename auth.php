<?php

use Api\Framework\JwtEncoder;

$container = require_once(__dir__."/api/bootstrap.php");
$config = $container->resolve("config");

function managePost(){
    global $config;
    $name = strtolower($_POST["name"]);
    $password = $_POST["password"];

    if(empty($config["authority"]["accounts"][$name])){
        sleep(1);
        return false;
    }

    if(hash("sha256", $password) !== $config["authority"]["accounts"][$name]){
        sleep(1);
        return false;
    }

    $jwtEncoder = new JwtEncoder($config["authority"]["private_key"]);

    $jwt = $jwtEncoder->stringify([
        "user" => $name,
        "exp" => time() + (60 * 60 * 24 * 365), 
    ]);

    $redirect = $_GET["redirect"];
    if(strpos($redirect, "?") === false){
        $redirect .= "?token={$jwt}";
    } else {
        $redirect .= "&token={$jwt}";
    }

    header('Location: '.$redirect);
    exit;
}

$success = true;

if(!empty($_POST["name"])){
    $success = managePost();
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Notesbook</title>
    <link rel="icon" type="image/x-icon" href="assets/images/favicon.ico">
    <link href="assets/dist/app.css" rel="stylesheet">
  </head>
  <body>
    <div class="container">
        <form method="POST">
            <?php if(!$success){ ?>
                Wrong credentials
            <?php } ?>

            <input type="text" name="name" placeholder="Username" />

            <input type="password" name="password" placeholder="Password" />

            <button type="submit">Login</button>
        </form>
    </div>

    <script src="assets/dist/vendor.js"></script>
    <script src="assets/dist/bundle.js"></script>
  </body>
</html>



