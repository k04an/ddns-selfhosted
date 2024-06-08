# DDNS Self-hosted

```
====================================
=       STILL IN DEVELOPMENT       =
====================================
```

## General
Simple DDNS service that you can host on your server and use with your domains registered at different domain providers.

## What's under the hood?

Mainly Express.js and Redis as DB. All running on Node.js. That's it.

## Usage

All interactions with service are made using API

Admin can create user tokens. One token = one subdomain. Admin token must be provided in `.env` file.

User tokens can be used to send requests to update IP in alias record of subdomain that are related to provided token.

Alias record updating is done by `driver`. Driver provides method that accepts `ip` and `subdomain` and execute code to send requests to domain provider API to update alias record. Driver for [Reg.ru](https://reg.ru) is provided but you can implement whatever provider or logic you want.

## Configuration

All configuration is done in `.env` file.

```
THERE WILL BE CONFIG KEYS
```