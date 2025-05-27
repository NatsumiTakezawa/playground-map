// tailwind.config.js
module.exports = {
  content: [
    "./app/views/**/*.{erb,html}",
    "./app/helpers/**/*.rb",
    "./app/javascript/**/*.js",
    "./app/assets/tailwind/**/*.css",
    "./app/assets/stylesheets/**/*.css",
    "./app/assets/javascripts/**/*.js",
    "./app/views/layouts/*.erb",
    "./app/views/shared/*.erb",
    "./app/views/onsens/*.erb",
    "./app/views/admin/onsens/*.erb",
    "./app/views/reviews/*.erb",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: "media", // or 'class'
};
