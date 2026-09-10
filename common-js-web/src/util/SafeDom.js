class SafeDom {
    static setText(element, value) {
        if (!element) return element;
        element.textContent = value === null || value === undefined ? '' : String(value);
        return element;
    }

    static appendContent(element, content, options) {
        if (!element) return element;
        options = options || {};

        if (content === null || content === undefined) return element;

        if (typeof Node !== 'undefined' && content instanceof Node) {
            element.appendChild(content);
            return element;
        }

        if (options.trustedHtml === true) {
            element.innerHTML = String(content);
            return element;
        }

        element.textContent = String(content);
        return element;
    }

    static clear(element) {
        if (!element) return element;
        while (element.firstChild) element.removeChild(element.firstChild);
        return element;
    }
}

module.exports = SafeDom;
