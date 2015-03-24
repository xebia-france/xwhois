var cheerio = require('cheerio'),
    confluence = require('./infrastructure/confluence'),
    trombinoscopeDb = require('./infrastructure/trombinoscopeDb');

function extractImage(element, index, self) {
    var image = element.find('ri\\:attachment').attr('ri:filename');
    if (image !== undefined) {
        self.getPerson(index)['filename'] = image;
        return;
    }
    self.getPerson(index)['href'] = element.find('ri\\:url').attr('ri:value');
}

function sanitize(content) {
    var sanitizedContent = content, infiniteLoopGuardCount = 0;
    while (sanitizedContent.indexOf('<') !== -1 && infiniteLoopGuardCount < 10) {
        sanitizedContent = sanitizedContent.replace(/<[a-zA-Z =":(0-9,);]+>(.+)/gi, '$1');
        sanitizedContent = sanitizedContent.replace(/(.+)<\/[a-zA-Z]+>/gi, '$1');
        sanitizedContent = sanitizedContent.replace(/(.+)<br>(.+)/gi, '$1$2');
        infiniteLoopGuardCount++;
    }
    return sanitizedContent;
}

function lastModifiedDatesAreSame(lastModifiedDateFromConfluence) {
    var lastModifiedDateFromDb = trombinoscopeDb.getLastModifiedDate();

    if (lastModifiedDateFromDb === undefined) {
        return false;
    }

    return lastModifiedDateFromConfluence.getTime() === lastModifiedDateFromDb.getTime()
}

function findPerson(filename, self) {
    return self.people.filter(function (person) {
        return person['filename'] === filename;
    })[0];
}

function download(person) {
    confluence.download(person['href'], function (content) {
        person['imageAsByteArray'] = new Buffer(content);
        delete person['href'];
        trombinoscopeDb.updatePerson(person);
    });
}

module.exports = {
    'people': [],

    'reset': function () {
        this.people = [];
    },

    'getPerson': function (index) {
        if (this.people[index] === undefined) {
            this.people[index] = {};
        }
        return this.people[index];
    },

    'parsePeople': function () {
        confluence.content(process.env.RESOURCE_ID, function (content) {
            var $ = cheerio.load(content),
                self = this,
                lastModifiedDateFromConfluence = new Date($('lastModifiedDate').attr('date'));

            if (lastModifiedDatesAreSame(lastModifiedDateFromConfluence)) {
                console.log('no need to update because last modified date hasn\'t change since last update: ', lastModifiedDateFromConfluence);
                return;
            }

            $ = cheerio.load($.root().text());

            $('th').each(function (index) {
                self.getPerson(index)['name'] = sanitize($(this).html());
            });

            $('ac\\:image').each(function (index) {
                extractImage($(this), index, self);
            });

            confluence.attachments(process.env.RESOURCE_ID, function (content) {
                var $ = cheerio.load(content);

                $('attachment').each(function () {
                    var attachment = $(this),
                        filename = attachment.attr('filename'),
                        person = findPerson(filename, self);

                    if (person === undefined) {
                        return;
                    }

                    delete person['filename'];
                    person['href'] = attachment.find('link[rel=download]').attr('href');
                    person['lastModifiedDate'] = attachment.find('lastModifiedDate').attr('date');
                    download(person);
                });

                self.people.filter(function (person) {
                    return person['href'] !== undefined;
                }).forEach(function (person) {
                    download(person);
                });

                trombinoscopeDb.updateLastModifiedDate(lastModifiedDateFromConfluence);
            })
        });
    }
};
