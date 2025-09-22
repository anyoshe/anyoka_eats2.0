Design System Overview

Tokens and base
- Global tokens: see src/styles/tokens.css (colors, spacing, typography, radii, shadows, z-index, containers, motion)
- Base layer: see src/styles/base.css (reset, typography, buttons, inputs, card, utilities)
- Primary font: Winky Sans
- Brand colors: --color-orange (primary), --color-green (emphasis), --color-white (background)

How to style components
- Prefer CSS Modules per component to avoid global bleed
- Use token vars instead of hardcoded values (e.g., var(--color-orange), var(--space-4), var(--radius-md))
- For layout, use utilities from base.css: .container, .stack, .cluster, .grid
- Buttons: add class .btn with variants (.btn--primary, .btn--emphasis, .btn--subtle) or mirror the patterns used in modules

Responsive guidelines
- Mobile-first; use fluid type via tokens and grids using repeat(auto-fit, minmax(...))
- Breakpoints generally: 320, 375, 425, 768, 1024, 1440, 1920, 2560

Accessibility and performance
- Focus states use outline; ensure interactive elements have aria-labels where text is not present
- Lazy-load images and keep modals dismissible via overlay

Shared shell
- Header: components/AppHeader.* (shown on routes except Landing)
- Footer: components/AppFooter.* (rendered globally below routes)

Adding new components
1) Create ComponentName.module.css
2) Use tokens and base utilities
3) Keep selectors scoped and avoid global resets
4) Validate contrast and keyboard/focus interactions

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
