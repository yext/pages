# Stying

# Overview

Out of the box Yext sites use [Tailwind](https://tailwindcss.com/) for styling. You can find the tailwind configuration inside of `tailwind.config.cjs`. Postcss is used to process the tailwind and you can find the configuration in `postcss.config.cjs`.

Be sure to import `index.css` file into your templates and static pages. To use tailwind you can either add rules in the `index.css` file or just adding utility classnames to the `JSX` directly. 

# Alternative to Tailwind

You can easily use any CSS framework that is compatible with `postcss`. Simply update the postcss config file.