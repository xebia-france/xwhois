var Entities = require('html-entities').AllHtmlEntities,
    entities = new Entities();

function sanitize(content) {
    var sanitizedContent = content, infiniteLoopGuardCount = 0;
    while (sanitizedContent.indexOf('<') !== -1 && infiniteLoopGuardCount < 10) {
        sanitizedContent = sanitizedContent.replace(/<[a-zA-Z =":(0-9,);]+>(.+)/gi, '$1');
        sanitizedContent = sanitizedContent.replace(/(.+)<\/[a-zA-Z]+>/gi, '$1');
        sanitizedContent = sanitizedContent.replace(/(.*)<br>(.*)/gi, '$1$2');
        infiniteLoopGuardCount++;
    }
    return entities.decode(sanitizedContent).trim();
}

module.exports = function (nameAsHtml) {
    var name = sanitize(nameAsHtml),
        href,
        image,
        lastModifiedDate,
        contentType;

    return {
        'getName': getName,
        'setHref': setHref,
        'getHref': getHref,
        'getImage': getImage,
        'isReadyToDownload': isReadyToDownload,
        'downloaded': downloaded,
        'downloadFailed': downloadFailed,
        'getLastModifiedDate': getLastModifiedDate,
        'getContentType': getContentType,
        'prepareDownload': prepareDownload,
        'exportToJSON': exportToJSON
    };

    function getName() {
        return name;
    }

    function getHref() {
        return href;
    }

    function getImage() {
        return image;
    }

    function isReadyToDownload() {
        return href !== undefined;
    }

    function downloaded(image_) {
        image = image_;
        href = undefined;
    }

    function downloadFailed() {
        href = undefined;
    }

    function getLastModifiedDate() {
        return lastModifiedDate;
    }

    function getContentType() {
        return contentType;
    }

    function prepareDownload(contentType_, href, lastModifiedDate_) {
        contentType = contentType_;
        setHref(href);
        lastModifiedDate = lastModifiedDate_;
    }

    function exportToJSON() {
        return {
            'name': name,
            'image': image,
            'contentType': contentType,
            'lastModifiedDate': lastModifiedDate
        };
    }


    function setHref(href_) {
        href = href_.replace(/\+/g, '%20');
    }
};
