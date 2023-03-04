@echo off

REM Copyright (C) 2022 Nurudin Imsirovic
REM Build script for /img/title/

set quiet=^>nul 2^>^&1

echo.[build: /img/title] Started at: %date% %time%

echo.Building base...
call magick convert base.png -scale 128 base-128.png %quiet%
call magick convert base.png -scale 256 base-256.png %quiet%
call magick convert base.png -scale 384 base-384.png %quiet%
call magick convert base.png -scale 512 base-512.png %quiet%

echo.Building base-white...
call magick convert base-white.png -scale 128 base-white-128.png %quiet%
call magick convert base-white.png -scale 256 base-white-256.png %quiet%
call magick convert base-white.png -scale 384 base-white-384.png %quiet%
call magick convert base-white.png -scale 512 base-white-512.png %quiet%

echo.Building base-black...
call magick convert base-black.png -scale 128 base-black-128.png %quiet%
call magick convert base-black.png -scale 256 base-black-256.png %quiet%
call magick convert base-black.png -scale 384 base-black-384.png %quiet%
call magick convert base-black.png -scale 512 base-black-512.png %quiet%

echo.Compressing base...
call pngout base-128.png %quiet%
call pngout base-256.png %quiet%
call pngout base-384.png %quiet%
call pngout base-512.png %quiet%

echo.Compressing base-white...
call pngout base-white-128.png %quiet%
call pngout base-white-256.png %quiet%
call pngout base-white-384.png %quiet%
call pngout base-white-512.png %quiet%

echo.Compressing base-black...
call pngout base-black-128.png %quiet%
call pngout base-black-256.png %quiet%
call pngout base-black-384.png %quiet%
call pngout base-black-512.png %quiet%

echo.[build: /img/title] Finished at: %date% %time%
