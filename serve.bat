@echo off
start http://127.0.0.1:8005/index.htm
@php -S 127.0.0.1:8005 -t "%cd%"
