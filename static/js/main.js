// Main entry point for JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize markdown parser with options
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return code;
        },
        breaks: true,
        gfm: true
    });
}); 