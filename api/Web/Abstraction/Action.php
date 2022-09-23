<?php
declare(strict_types=1);

namespace Api\Web\Abstraction;

abstract class Action
{
    public function __invoke()
    {
        return $this->action();
    }

    abstract protected function action();

    protected function responseJson($data)
    {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data);
    }

    protected function responseFile($filePath)
    {
        $fp = fopen($filePath, 'rb');
        $contentType = @mime_content_type($filePath) ?? "application/octet-stream";

        header("Content-Type: {$contentType}");
        header("Content-Length: " . filesize($filePath));
        header('Content-Disposition: attachment; filename="'.basename($filePath).'"');

        fpassthru($fp);
    }

    protected function getParsedBody()
    {
        return json_decode(file_get_contents('php://input'), true);
    }
}