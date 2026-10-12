# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # Field Supply

  A responsive demo storefront for considered clothing, footwear, accessories, and home goods. Built with React, TypeScript, Vite, and React Router.

  ## Getting started

  Requires Node.js and npm.

  ```bash
  npm install
  npm run dev
  ```

  Vite prints the local URL when the development server starts.

  ## Features

  - Browse a product catalog; search by name or description, filter by category, and sort by price or rating.
  - Open product details and add items to a persistent shopping bag.
  - Complete the demo checkout and review order history from the account page.
  - Responsive layouts for desktop and mobile.

  ## Routes

  - `/` — storefront, catalog, search, filters, and sorting
  - `/product/:id` — product details
  - `/cart` — shopping bag
  - `/checkout` — delivery form and demo order placement
  - `/account` — demo sign-in and order history

  ## Catalog and demo data

  The catalog requests products from DummyJSON and keeps a balanced sample from supported categories. If the request fails or returns too few supported products, the curated catalog in `src/data/products.ts` is used instead. Product photography and the page fonts are loaded from external image and font services.

  Cart contents, demo account name/email, and order history are stored in browser `localStorage`. The account form is not connected to an authentication service. Checkout does not process payments or save delivery addresses; it creates a local demo order. Do not use real credentials or payment information.

  ## Project commands

  ```bash
  npm run dev      # Start the Vite development server
  npm run build    # Type-check and create a production build
  npm run lint     # Run ESLint
  npm run preview  # Preview the production build locally
  ```
    ],
