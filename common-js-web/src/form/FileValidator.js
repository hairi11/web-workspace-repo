class FileValidator {
    static maxSize(maxBytes, message) {
        return function (value) {
            var files = FileValidator._files(value);
            for (var i = 0; i < files.length; i += 1) {
                if (Number(files[i].size) > Number(maxBytes)) {
                    return message || 'File exceeds the maximum allowed size.';
                }
            }
            return null;
        };
    }

    static allowedTypes(types, message) {
        var allowed = (types || []).map(function (type) { return String(type).toLowerCase(); });
        return function (value) {
            var files = FileValidator._files(value);
            for (var i = 0; i < files.length; i += 1) {
                var current = String(files[i].type || '').toLowerCase();
                if (allowed.indexOf(current) < 0) {
                    return message || 'File type is not allowed.';
                }
            }
            return null;
        };
    }

    static allowedExtensions(extensions, message) {
        var allowed = (extensions || []).map(function (extension) {
            extension = String(extension).toLowerCase();
            return extension.charAt(0) === '.' ? extension : '.' + extension;
        });
        return function (value) {
            var files = FileValidator._files(value);
            for (var i = 0; i < files.length; i += 1) {
                var name = String(files[i].name || '').toLowerCase();
                var valid = allowed.some(function (extension) { return name.endsWith(extension); });
                if (!valid) return message || 'File extension is not allowed.';
            }
            return null;
        };
    }

    static _files(value) {
        if (!value) return [];
        if (typeof FileList !== 'undefined' && value instanceof FileList) return Array.prototype.slice.call(value);
        if (Array.isArray(value)) return value;
        if (value && typeof value.length === 'number' && typeof value !== 'string' && !value.name) {
            return Array.prototype.slice.call(value);
        }
        return [value];
    }
}

module.exports = FileValidator;
