# n8n Liferay Node

[Liferay](https://www.liferay.com/) node for the [n8n](https://n8n.io/) workflow automation tool

## Features

- Authentication via _OAuth2_ or _Basic Auth_
- Easily interact with _Custom Liferay Objects_ in the GUI
- All endpoints from _REST Applications_ available via Autocomplete

All operations and parameters of the Headless APIs are made available via the OpenAPI definitions available from Liferays Headless APIs.

## Prerequisites

- n8n
- Liferay DXP 7.4+

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n documentation.

## Authentication

### Basic Auth

Authentication via Basic Auth is available by default in Liferay. The user you're authenticating with needs to have the appropriate permissions for the API actions you want to perform.

### OAuth 2

In Liferay, set up a new [OAuth 2 Application](https://learn.liferay.com/w/dxp/integration/headless-apis/using-liferay-as-a-headless-platform/using-oauth2/creating-oauth2-applications) under **_Control Panel - Security - OAuth 2 Administration_**. Keep the default settings, but only enable **Client Credentials** for the Allowed Authorization Types and choose the User the client will impersonate.  
After saving the application, open the **Scopes** tab and enable the following in addition to the Scopes needed for your use case:

- Liferay.Headless.Discovery.OpenAPI - Read data on your behalf (required to list all available OpenAPI definitions and endpoints)
- Liferay.Object.Admin.REST - Read data on your behalf (required to list your Object Definitions and available actions)

Go back to the **Credentials** tab and copy the **Client ID** and **Client Secret** into the n8n OAuth2 Credential and set _Access Token URL_ to **_{{LiferayHostname}}/o/oauth2/token_**, replacing **_{{LiferayHostname}}_** with the hostname of your Liferay instance.

## Usage

### Headless API Endpoint

All Headless API operations are listed (similar to Liferays API Explorer) and can be selected using autocomplete fields:

1. Select the _REST Application (i.e. headless-admin-user/v1.0)_
2. Select the _endpoint (i.e. /v1.0/my-user-account)_
3. Select the _method name (i.e. GET)_
4. Enter additional values in the fields below if needed

### Object Operation

While you can perform operations of Liferay Objects using the Headless API endpoints above, this offers a cleaner, filtered view of the available operations without having to choose the method separately:

1. Select the _Object Defintion Name (i.e. SampleObject)_
2. Select the _Operation Name (i.e. getSampleObjectsPage)_
3. Enter additional values in the fields below if needed

Using the **Execute step** button on top you can test if the request is successful and the expected data is returned.

## Video

Watch the [YouTube video](https://www.youtube.com/watch?v=oInsLKQxGIo) for a n8n intro and overview of the _Liferay Node_.

## Screenshots

![n8n Screenshots](/img/screenshots.png?raw=true)
