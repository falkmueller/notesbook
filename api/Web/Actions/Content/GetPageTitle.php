<?php
declare(strict_types=1);

namespace Api\Web\Actions\Content;

use Api\Domain\Handler\GetFileHandler;
use Api\Web\Abstraction\Action;

class GetPageTitle extends Action
{

    protected function action()
    {
        $url = $_GET["url"];

        if(!$this->isValidUrl($url))
        {
            $this->responseJson("");
        }

        $title = $this->getPageTitle($url);
        
        $this->responseJson($title);
    }

    private function isValidUrl($url)
    {
        if (!preg_match('#^(?:https?|ftp)://#', $url, $m)){
            $url = 'http://' . $url;
        }
          
        return filter_var($url, FILTER_VALIDATE_URL);
    }

    private function getPageTitle(string $url)
    {

        $url = $_REQUEST["url"];
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36");
        $data = curl_exec($ch);
        curl_close($ch);
        $html = $data;
        
        preg_match('/<title>(.+)<\/title>/',$html,$matches);
        $title = $matches[1];
        
        return $title;
    }
}