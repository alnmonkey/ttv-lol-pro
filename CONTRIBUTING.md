# Contributing

Thank you for your interest in contributing to TTV LOL PRO! The extension is written in [TypeScript](https://www.typescriptlang.org/) and uses the [`webextension-polyfill`](https://www.npmjs.com/package/webextension-polyfill) npm package. The build process is handled by [Parcel](https://parceljs.org/) via its [`@parcel/config-webextension`](https://www.npmjs.com/package/@parcel/config-webextension) plugin.

## Requirements

- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) _(Bundled with Node.js)_

## Setup

### Installation

To install the dependencies, run the following command:

```sh
npm ci
```

### Environment Variables

Copy the `.env.development.example` file and rename it to `.env.development.local`. Then, fill in the optional environment variables as needed:

- `DEV_OPTIMIZED_PROXIES`: Comma-separated list of proxy servers to prepend to the default 'Proxy ad requests only' list during development.
- `DEV_NORMAL_PROXIES`: Comma-separated list of proxy servers to append to the default 'Proxy all requests' list during development.
- `BETA`: Number indicating the beta version of the extension. If set, the extension will include the beta version in its name (e.g., "TTV LOL PRO Beta 1").

## Development

To start the file watcher and build the extension in development mode, run the following command:

- For Firefox:

```sh
npm run dev:firefox
```

- For Chromium-based browsers:

```sh
npm run dev:chromium
```

## Type checking

To check for type errors, run the following command:

```sh
npm run type-check
```

## Linting

To check for linting errors, run the following command:

```sh
npm run lint
```

To automatically fix linting errors, run the following command:

```sh
npm run lint:fix
```

## Build

To build the extension for production, run the following command:

- For Firefox:

```sh
npm run build:firefox
```

- For Chromium-based browsers:

```sh
npm run build:chromium
```

## Pull requests

Before submitting a pull request, please ensure that:

- Your code follows the existing coding style and conventions.
- You have tested your changes thoroughly.
- You have updated the documentation as needed.

We appreciate your contributions and look forward to reviewing your pull requests!
