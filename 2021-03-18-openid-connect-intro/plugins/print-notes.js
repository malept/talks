/**
 * Print Notes
 *
 * Show speaker notes below the slide for printing purposes.
 *
 * Copyright 2021 Mark Lee (@malept on GitHub)
 * Released under the Apache 2.0 license.
 */
 (function (document, window) {
   if (window.location.search.substring(1).split('&').includes('show-notes=1')) {
     document.body.classList.add('with-notes');
     const style = document.createElement('style');
     style.innerText = `
.step .notes {
  border: 1px solid #333;
  display: block;
  font-size: smaller;
  font-style: italic;
  margin-top: 10px;
  padding: 10px;
}
.step notes p:last-child {
  margin-bottom: 0;
}
   `.trim();
     document.head.appendChild(style);
   }
})(document, window);