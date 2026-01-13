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

    // Function to hide copy button for specific code blocks
    function hideCopyButtonForRailwayUrl() {
        // Find all code blocks
        const codeBlocks = document.querySelectorAll('.code-block');
        
        codeBlocks.forEach(block => {
            // Check if the code block contains the railway URL
            const codeContent = block.textContent || '';
            if (codeContent.includes('https://seu-projeto.up.railway.app/qr?API_KEY')) {
                // Find the copy button within this code block
                const copyButton = block.querySelector('.h-\\[26px\\].w-\\[26px\\].flex.items-center.justify-center.rounded-md.backdrop-blur.peer.group\\/copy-button, [data-testid="copy-code-button"]');
                if (copyButton) {
                    copyButton.style.display = 'none';
                }
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
            '#search-bar-entry div' // Specific content inside search bar
        ];

        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                const text = el.textContent.trim();
                if (text === 'On this page') {
                    el.textContent = 'Nesta página';
                } else if (text === 'Search...') {
                    el.textContent = 'Buscar...';
                }
            });
        });

        // Also check buttons directly and inputs
        document.querySelectorAll('button, input').forEach(el => {
            if (el.textContent.trim() === 'On this page') {
                el.textContent = 'Nesta página';
            }
            if (el.placeholder === 'Search...') {
                el.placeholder = 'Buscar...';
            }
            if (el.getAttribute('aria-label') === 'Open search') {
                el.setAttribute('aria-label', 'Abrir busca');
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
})();
