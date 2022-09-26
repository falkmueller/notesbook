# Notesbook

simple web application to manage links, notes and files in a book like style.

[screenhot](./assets/images/screenshot1.png)

## Keykords

notes, bookmaks manager, oranizer, wiki

## Vendor

- [vue js](https://vuejs.org/)
- [axios ajax handler](https://github.com/axios/axios)
- [marked markdown library](https://github.com/markedjs/marked)
- [simplemde markdown editor](https://github.com/sparksuite/simplemde-markdown-editor)

## installation
- checkout repository
- default credentials:
    - username: test
    - password: test
- to change the credentials:
    - create file ```config.local.php```
    - content ```
        <?php
        declare(strict_types=1);

        return [
            "authority" => [
                "url" => "auth.php",
                "private_key" => "5713ca2b-b0e7-4e8a-975d-7aa1eaf21e6b", /*add ramdom string*/
                "accounts" => [
                    "test" => "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
                    /* "USERNAME" => hash('sha256', "PASSWORD") */
                ]
            ],
        ];
    ```

## Languages

- currently availabe in german (de, default) and english (en)
- change over url: ```#/?ln=en```