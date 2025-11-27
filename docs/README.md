# TrustVault Password Utils Landing Page

This directory contains the landing page for the TrustVault Password Utils project.

## Overview

The landing page is built with vanilla HTML, CSS, and JavaScript to ensure fast loading times and ease of maintenance. It showcases:

- **Featured Work**: Highlights the TrustVault Password Utils library and related projects
- **Key Features**: Displays the main features and benefits of the library
- **GitHub Sponsors CTA**: Encourages community support through GitHub Sponsors
- **Documentation Links**: Provides easy access to documentation and resources

## Structure

```
docs/
├── index.html     # Main landing page
├── styles.css     # Styling and responsive design
├── script.js      # Interactive features and animations
└── README.md      # This file
```

## Features

- **Responsive Design**: Mobile-first approach with breakpoints for all device sizes
- **Modern UI**: Dark theme with gradient accents and smooth animations
- **Accessibility**: Semantic HTML, ARIA labels, and keyboard navigation
- **Performance**: Optimized CSS, minimal JavaScript, no external dependencies
- **SEO**: Meta tags, Open Graph protocol, and semantic structure

## Deployment

This landing page is automatically deployed to GitHub Pages from the `docs/` directory.

### View Live

🌐 **[https://ian-p1nt0.github.io/password-kit/](https://ian-p1nt0.github.io/password-kit/)**

## Local Development

To preview the landing page locally:

```bash
# Simple HTTP server with Python
python -m http.server 8000 --directory docs

# Or with Node.js
npx http-server docs -p 8000

# Or with PHP
php -S localhost:8000 -t docs
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

## Customization

### Colors

The color scheme is defined in CSS variables in `styles.css`:

```css
:root {
    --primary-color: #4f46e5;
    --secondary-color: #06b6d4;
    --dark-bg: #0f172a;
    /* ... */
}
```

### Content

To update content:

1. **Project Information**: Edit the hero section in `index.html`
2. **Features**: Modify the `.features-grid` section
3. **Projects**: Update the `.project-showcase` section
4. **Sponsor Benefits**: Edit the `.sponsor-benefits` section

## Contributing

Contributions to improve the landing page are welcome! Please ensure:

- HTML is semantic and accessible
- CSS follows the existing naming convention
- JavaScript is vanilla (no framework dependencies)
- Design is responsive across all devices
- Changes maintain performance standards

## License

This landing page is part of the TrustVault Password Utils project and is licensed under Apache License 2.0.
