# Random Quote Generator (multi-file)

## About
Small web app that fetches random quotes and:
- Shows a short preview (setup), reveals full quote after a delay
- Save to history (localStorage), restore by clicking a history item
- Copy quote, Dark mode toggle

## Run
Open `index.html` in a modern browser, or run `python -m http.server` and visit `http://localhost:8000`.

## Files
- index.html — markup
- css/styles.css — styling & theme
- js/api.js — network calls
- js/history.js — localStorage history
- js/ui.js — DOM updates & helpers
- js/main.js — app initialization
