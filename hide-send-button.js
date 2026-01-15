// Hide the Send button, prevent background scroll, and clean URL display when ?playground=open is in the URL
(function () {
    // Check if the URL contains playground=open
    function shouldHideButton() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('playground') === 'open';
    }

    // Function to disable/enable body scroll with multiple methods
    function toggleBodyScroll() {
        if (shouldHideButton()) {
            // Save current scroll position
            const scrollY = window.scrollY;

            // Disable body scroll with multiple approaches
            document.body.style.setProperty('overflow', 'hidden', 'important');
            document.body.style.setProperty('position', 'fixed', 'important');
            document.body.style.setProperty('top', `-${scrollY}px`, 'important');
            document.body.style.setProperty('width', '100%', 'important');
            document.documentElement.style.setProperty('overflow', 'hidden', 'important');

            // Prevent touch scroll and wheel events
            document.addEventListener('touchmove', preventScroll, { passive: false });
            document.addEventListener('wheel', preventScroll, { passive: false });
        } else {
            // Restore scroll position
            const scrollY = document.body.style.top;

            // Enable body scroll
            document.body.style.removeProperty('overflow');
            document.body.style.removeProperty('position');
            document.body.style.removeProperty('top');
            document.body.style.removeProperty('width');
            document.documentElement.style.removeProperty('overflow');

            // Restore scroll position
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }

            // Remove event listeners
            document.removeEventListener('touchmove', preventScroll);
            document.removeEventListener('wheel', preventScroll);
        }
    }

    // Prevent scroll event - allow scrolling only within playground containers
    function preventScroll(e) {
        // Check if the scroll is happening within the playground modal/container
        const playgroundSelectors = [
            '.grid.grid-cols-1.lg\\:grid-cols-5', // Main playground grid
            '[class*="grid"][class*="cols"]',      // Any grid container
            '[class*="space-y"]',                  // Space-y containers
            '[class*="overflow"]',                 // Overflow containers
            '.api-playground-input',
            '#api-playground-input',
            '[class*="playground"]',
            '[data-testid*="playground"]',
            '[class*="scrollbar"]',
            '[class*="overflow-auto"]',
            '[class*="overflow-y-auto"]'
        ];

        // Check if target or any parent matches playground selectors
        let element = e.target;
        while (element && element !== document.body) {
            for (const selector of playgroundSelectors) {
                try {
                    if (element.matches && element.matches(selector)) {
                        // Allow scrolling within this element if it's scrollable
                        const hasScroll = element.scrollHeight > element.clientHeight;
                        if (hasScroll) {
                            return; // Allow scroll
                        }
                    }
                } catch (err) {
                    // Invalid selector, skip
                }
            }
            element = element.parentElement;
        }

        // If we're here, prevent the scroll
        e.preventDefault();
        e.stopPropagation();
    }

    // Function to hide the Send button
    function hideSendButton() {
        if (!shouldHideButton()) return;

        // Find the button by class or data-testid
        const sendButtons = document.querySelectorAll('.tryit-button, [data-testid="try-it-button"]');

        sendButtons.forEach(button => {
            if (button.textContent.includes('Send')) {
                button.style.display = 'none';
            }
        });
    }

    // Function to rename the Try it button to Gerar
    function renameTryItButton() {
        const tryItButtons = document.querySelectorAll('.tryit-button, [data-testid="try-it-button"]');
        tryItButtons.forEach(button => {
            // Update span text if it exists
            const span = button.querySelector('span');
            if (span && span.textContent.trim() === 'Try it') {
                span.textContent = 'Gerar';
            } else if (!span && button.textContent.trim() === 'Try it') {
                button.textContent = 'Gerar';
            }

            // Update aria-label
            if (button.getAttribute('aria-label') === 'Try it') {
                button.setAttribute('aria-label', 'Gerar');
            }
        });
    }

    // Function to translate UI elements to Portuguese
    function translateUI() {
        // Target all possible "On this page" and "Search" occurrences
        const selectors = [
            'button span', // Mobile TOC button
            '.text-xs.font-semibold.uppercase.tracking-wide.text-gray-900.dark\\:text-white', // Desktop sidebar heading
            '.text-sm.font-semibold.text-gray-900.dark\\:text-white', // Alternative sidebar heading
            '.truncate', // General truncate class used in search bar
            '#search-bar-entry div', // Specific content inside search bar
            // Context menu translations
            '.text-sm.font-medium.text-gray-800.dark\\:text-gray-300', // Menu titles
            '.text-xs.text-gray-600.dark\\:text-gray-400' // Menu descriptions
        ];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                const text = el.textContent.trim();
                if (text === 'On this page') {
                    el.textContent = 'Nesta página';
                } else if (text === 'Search...') {
                    el.textContent = 'Buscar...';
                } else if (text === 'Copy page') {
                    el.textContent = 'Copiar';
                } else if (text === 'Copy page as Markdown for LLMs') {
                    el.textContent = 'Copiar como Markdown para LLMs';
                } else if (text === 'Open in ChatGPT') {
                    el.textContent = 'Abrir no ChatGPT';
                } else if (text.includes('Ask questions about this page')) {
                    el.textContent = 'Fazer perguntas sobre esta página';
                } else if (text === 'Open in Claude') {
                    el.textContent = 'Abrir no Claude';
                }
            });
        });

        // Also check buttons directly and inputs
        document.querySelectorAll('button, input').forEach(el => {
            const text = el.textContent.trim();
            if (text === 'On this page') {
                el.textContent = 'Nesta página';
            } else if (text === 'Copy page') {
                const span = el.querySelector('span');
                if (span) span.textContent = 'Copiar';
                else el.textContent = 'Copiar';
            }

            if (el.placeholder === 'Search...') {
                el.placeholder = 'Buscar...';
            }
            if (el.getAttribute('aria-label') === 'Open search') {
                el.setAttribute('aria-label', 'Abrir busca');
            }
            if (el.getAttribute('aria-label') === 'Copy page') {
                el.setAttribute('aria-label', 'Copiar');
            }
            if (el.getAttribute('aria-label') === 'More actions') {
                el.setAttribute('aria-label', 'Mais ações');
            }
        });
    }

    // Function to clean up URL display in header (remove https://)
    function cleanUrlDisplay() {
        // Target the specific header area - NOT the code blocks
        const selectors = [
            '.api-section-heading-title',
            '[class*="api"][class*="heading"]',
            '.text-base.font-medium', // From the HTML you provided
            '[class*="method-nav-pill"]'
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                // Skip if this is inside a code block
                if (el.closest('pre, code, .code-block, [class*="shiki"]')) {
                    return;
                }

                // Check text nodes
                const walker = document.createTreeWalker(
                    el,
                    NodeFilter.SHOW_TEXT,
                    {
                        acceptNode: function (node) {
                            // Skip code blocks
                            if (node.parentElement?.closest('pre, code, .code-block, [class*="shiki"]')) {
                                return NodeFilter.FILTER_REJECT;
                            }
                            return node.textContent && node.textContent.includes('https://')
                                ? NodeFilter.FILTER_ACCEPT
                                : NodeFilter.FILTER_REJECT;
                        }
                    }
                );

                let node;
                while (node = walker.nextNode()) {
                    // Only replace if not in code context
                    if (!node.parentElement?.closest('pre, code, .code-block, [class*="shiki"]')) {
                        node.textContent = node.textContent.replace(/https?:\/\//g, '');
                    }
                }
            });
        });
    }

    // Function to color only {railway_domain} text in purple
    function colorRailwayDomain() {
        // More specific targeting for the URL display element
        const selectors = [
            '.min-w-max.bg-transparent.text-sm.font-mono',
            '.min-w-max.font-mono',
            '[class*="min-w-max"]',
            '.text-sm.text-gray-600',
            '.dark\\:text-gray-400'
        ];

        // Try specific selectors first
        let found = false;
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                // Skip code blocks
                if (el.closest('pre, code, [class*="shiki"], [class*="code-block"]')) {
                    return;
                }

                if (el.textContent.includes('{railway_domain}')) {
                    // Process this element
                    processRailwayDomainNode(el);
                    found = true;
                }
            });
        });

        // Fallback: scan all elements if not found with specific selectors
        if (!found) {
            document.querySelectorAll('*').forEach(el => {
                // Skip code blocks
                if (el.closest('pre, code, [class*="shiki"], [class*="code-block"]')) {
                    return;
                }

                // Only process text nodes directly
                Array.from(el.childNodes).forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('{railway_domain}')) {
                        processRailwayDomainTextNode(node);
                    }
                });
            });
        }
    }

    // Helper to process element that contains {railway_domain}
    function processRailwayDomainNode(el) {
        Array.from(el.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('{railway_domain}')) {
                processRailwayDomainTextNode(node);
            }
        });
    }

    // Helper to process a text node and wrap {railway_domain} in purple span
    function processRailwayDomainTextNode(node) {
        const text = node.textContent;
        const parts = text.split(/(\{railway_domain\})/g);

        if (parts.length > 1) {
            const fragment = document.createDocumentFragment();
            parts.forEach(part => {
                if (part === '{railway_domain}') {
                    const span = document.createElement('span');
                    span.textContent = part;
                    span.style.setProperty('color', '#7c1bc2', 'important');
                    span.style.fontWeight = '600'; // Make it slightly bolder
                    fragment.appendChild(span);
                } else if (part) {
                    fragment.appendChild(document.createTextNode(part));
                }
            });
            node.replaceWith(fragment);
        }
    }

    // --- Copy to Markdown (LLM Optimized) ---

    function getMarkdownFromElement(element) {
        let markdown = '';
        const children = element.childNodes;

        children.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const tag = node.tagName.toLowerCase();

                // Skip UI elements and specific noise
                if (node.matches('script, style, nav, footer, button, .sr-only, .copy-page-btn, .pagination-link, [class*="Pagination"], .chat-assistant-floating-input, [class*="assistant-bar"]')) {
                    return;
                }

                if (tag.match(/^h[1-6]$/)) {
                    const level = tag.substring(1);
                    markdown += '\n' + '#'.repeat(level) + ' ' + node.textContent.trim() + '\n';
                } else if (tag === 'p') {
                    markdown += '\n' + node.textContent.trim() + '\n';
                } else if (tag === 'pre' || node.classList.contains('code-block') || node.matches('[class*="shiki"]')) {
                    // Extract code content
                    let code = node.innerText || node.textContent;
                    // Try to avoid double copying if it has line numbers or copy buttons
                    const codeElement = node.querySelector('code');
                    if (codeElement) code = codeElement.innerText;

                    let lang = '';
                    const langMatch = node.className.match(/language-(\w+)/) || (codeElement && codeElement.className.match(/language-(\w+)/));
                    if (langMatch) lang = langMatch[1];
                    markdown += '\n```' + lang + '\n' + code.trim() + '\n```\n';
                } else if (tag === 'ul' || tag === 'ol') {
                    const prefix = tag === 'ul' ? '- ' : '1. ';
                    const items = node.querySelectorAll(':scope > li');
                    items.forEach((li, idx) => {
                        const liPrefix = tag === 'ul' ? '- ' : `${idx + 1}. `;
                        markdown += liPrefix + li.textContent.trim() + '\n';
                    });
                    markdown += '\n';
                } else if (tag === 'blockquote') {
                    markdown += '\n> ' + node.textContent.trim() + '\n';
                } else if (tag === 'br') {
                    markdown += '\n';
                } else {
                    // Recursive for generic containers (div, span, section, strong, em, a, etc.)
                    markdown += getMarkdownFromElement(node);
                }
            } else if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                // Add text if it's not just whitespace
                if (text.trim()) {
                    // Check if parent is a block element already handled
                    const parentTag = node.parentElement.tagName.toLowerCase();
                    if (!parentTag.match(/^h[1-6]$/) && parentTag !== 'p' && parentTag !== 'li' && parentTag !== 'blockquote' && parentTag !== 'pre' && parentTag !== 'code') {
                        markdown += text;
                    }
                }
            }
        });

        return markdown;
    }

    function copyPageAsMarkdown(targetBtn) {
        const title = document.title.split(' - ')[0] || 'Documentation';
        const url = window.location.href;

        // Find main content
        const contentArea = document.querySelector('#content-area, .mdx-content, main article, #content') || document.body;

        let markdown = `# ${title}\n\n`;
        markdown += `Source: ${url}\n\n`;
        markdown += '---\n\n';

        markdown += getMarkdownFromElement(contentArea);

        // Clean up excessive newlines
        markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

        // Copy to clipboard
        navigator.clipboard.writeText(markdown).then(() => {
            const btn = targetBtn || document.getElementById('copy-markdown-btn') || document.getElementById('page-context-menu-button');
            if (btn) {
                // If it's part of the native contextual menu, we apply success to both buttons
                const container = btn.closest('#page-context-menu');
                if (container) {
                    const allButtons = container.querySelectorAll('button');
                    const primarySpan = btn.querySelector('span');
                    const originalSpanText = primarySpan ? primarySpan.innerText : '';

                    if (primarySpan) primarySpan.innerText = 'Copiado!';
                    allButtons.forEach(b => b.classList.add('btn-success'));

                    setTimeout(() => {
                        if (primarySpan) primarySpan.innerText = originalSpanText;
                        allButtons.forEach(b => b.classList.remove('btn-success'));
                    }, 2000);
                } else if (btn.getAttribute('role') === 'menuitem') {
                    // Logic for dropdown menu item
                    const titleDiv = Array.from(btn.querySelectorAll('div')).find(d => {
                        const t = d.textContent.trim();
                        return t === 'Copiar' || t === 'Copiar página' || t === 'Copy page';
                    });
                    const originalTitle = titleDiv ? titleDiv.innerText : '';
                    const checkIcon = btn.querySelector('.lucide-check');

                    if (titleDiv) titleDiv.innerText = 'Copiado!';
                    if (checkIcon) {
                        checkIcon.classList.remove('opacity-0');
                        checkIcon.classList.add('opacity-100');
                    }
                    btn.classList.add('btn-success');

                    setTimeout(() => {
                        if (titleDiv) titleDiv.innerText = originalTitle;
                        if (checkIcon) {
                            checkIcon.classList.remove('opacity-100');
                            checkIcon.classList.add('opacity-0');
                        }
                        btn.classList.remove('btn-success');
                    }, 2000);
                } else {
                    // Fallback for custom button
                    const originalHTML = btn.innerHTML;
                    if (btn.querySelector('span')) {
                        const span = btn.querySelector('span');
                        const originalSpanText = span.innerText;
                        span.innerText = 'Copiado!';
                        btn.classList.add('btn-success');
                        setTimeout(() => {
                            span.innerText = originalSpanText;
                            btn.classList.remove('btn-success');
                        }, 2000);
                    } else {
                        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg> <span>Copiado!</span>';
                        btn.classList.add('btn-success');
                        setTimeout(() => {
                            btn.innerHTML = originalHTML;
                            btn.classList.remove('btn-success');
                        }, 2000);
                    }
                }
            }
        })
            .catch(err => {
                console.error('Erro ao copiar Markdown:', err);
                // Fallback for some browsers
                const textArea = document.createElement("textarea");
                textArea.value = markdown;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    const btn = targetBtn || document.getElementById('page-context-menu-button');
                    if (btn) {
                        const span = btn.querySelector('span');
                        if (span) span.innerText = 'Copiado!';
                        btn.classList.add('btn-success');
                        setTimeout(() => {
                            if (span) span.innerText = 'Copiar';
                            btn.classList.remove('btn-success');
                        }, 2000);
                    }
                } catch (err2) {
                    alert('Não foi possível copiar o Markdown.');
                }
                document.body.removeChild(textArea);
            });
    }

    function hijackNativeCopyButton() {
        // Target specifically by ID if available, or text
        const nativeBtn = document.getElementById('page-context-menu-button');
        if (nativeBtn && !nativeBtn.dataset.hijacked) {
            // Translate immediately
            const span = nativeBtn.querySelector('span');
            if (span && (span.textContent.includes('Copy page') || span.innerText.includes('Copy page'))) {
                span.textContent = 'Copiar';
            }
            nativeBtn.setAttribute('aria-label', 'Copiar');

            nativeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                copyPageAsMarkdown(nativeBtn);
            }, true);
            nativeBtn.dataset.hijacked = 'true';
            return;
        }

        // Fallback to text matching (including dropdown items)
        document.querySelectorAll('button, [role="menuitem"]').forEach(el => {
            const text = el.textContent.trim();
            // Check for any of the labels we've used or standard native labels
            if ((text.includes('Copiar') || text.includes('Copiar página') || text.includes('Copy page')) && !el.dataset.hijacked) {
                // Determine if it's a menu item or button
                const isMenu = el.getAttribute('role') === 'menuitem';

                // If it's a menu item, translate its children if needed
                if (isMenu) {
                    const divs = el.querySelectorAll('div');
                    divs.forEach(d => {
                        const dText = d.textContent.trim();
                        if (dText === 'Copy page' || dText === 'Copiar página') d.textContent = 'Copiar';
                        if (dText === 'Copy page as Markdown for LLMs' || dText === 'Copiar página como Markdown para LLMs') d.textContent = 'Copiar como Markdown para LLMs';
                    });
                } else {
                    const span = el.querySelector('span');
                    if (span) span.textContent = 'Copiar';
                    else el.textContent = 'Copiar';
                }

                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    copyPageAsMarkdown(el);
                }, true);
                el.dataset.hijacked = 'true';
            }
        });
    }

    hijackNativeCopyButton();

    hideSendButton();
    renameTryItButton();

    translateUI();
    toggleBodyScroll();
    cleanUrlDisplay();

    // Run functions with delays to catch dynamic content
    setTimeout(() => {
        colorRailwayDomain();
        translateUI();
    }, 50);
    setTimeout(() => {
        colorRailwayDomain();
        translateUI();
    }, 200);
    setTimeout(() => {
        colorRailwayDomain();
        translateUI();
    }, 500);
    setTimeout(() => {
        colorRailwayDomain();
        translateUI();
    }, 1000);

    // Watch for dynamically added buttons (Mintlify uses React/dynamic rendering)
    const observer = new MutationObserver(() => {
        hideSendButton();
        renameTryItButton();
        translateUI();
        toggleBodyScroll();
        cleanUrlDisplay();
        colorRailwayDomain();
        hijackNativeCopyButton();
    });



    // Start observing the document for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Also listen for URL changes (single-page app navigation)
    let lastUrl = window.location.href;
    new MutationObserver(() => {
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            setTimeout(() => {
                hideSendButton();
                renameTryItButton();
                translateUI();
                toggleBodyScroll();
                cleanUrlDisplay();
                colorRailwayDomain();
            }, 100); // Small delay for content to render
        }
    }).observe(document.querySelector('title'), {
        childList: true,
        subtree: true
    });
    // Hide copy buttons on quickstart page
    if (window.location.pathname.includes('/essentials/quickstart')) {
        const style = document.createElement('style');
        style.textContent = `
      [data-testid="copy-code-button"] {
        display: none !important;
      }
      [data-fade-overlay="true"] {
        display: none !important;
      }
    `;
        document.head.appendChild(style);
    }
})();
