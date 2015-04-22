var assert = require('assert'),
    person = require('../../../src/api/person');

describe("Person Module Test", function () {
    it('should replace plus to spaces into href', function () {
        var p = person('name');

        p.prepareDownloadByUrl('https://intarnet/confluence/download/attachments/1234/some+nice+image.jpg?version=1&modificationDate=1234');

        assert.strictEqual(p.getHref(), 'https://intarnet/confluence/download/attachments/1234/some%20nice%20image.jpg?version=1&modificationDate=1234');
    });

    it('should export', function () {
        var p = person('name');
        var lastModifiedDate = new Date(0);
        p.prepareDownloadByAttachment('image/jpeg', 'https://intarnet/confluence/download/attachments/1234/image.jpg?version=1&modificationDate=1234', lastModifiedDate);

        var personAsJson = p.export();

        assert.strictEqual(personAsJson.name, 'name');
        assert.strictEqual(personAsJson.contentType, 'image/jpeg');
        assert.strictEqual(personAsJson.lastModifiedDate, lastModifiedDate);
    });
});