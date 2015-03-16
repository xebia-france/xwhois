var cheerio = require('cheerio'),
    confluence = require('./infrastructure/confluence');

function extractImage(element, index, self) {
    var image = element.find('ri\\:attachment').attr('ri:filename');
    if (image !== undefined) {
        self.getPeople(index)['filename'] = image;
    }
    self.getPeople(index)['href'] = element.find('ri\\:url').attr('ri:value');
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

module.exports = {
    'people': [],
    'content': '',
    'getPeople': function (index) {
        if (this.people[index] === undefined) {
            this.people[index] = {};
        }
        return this.people[index];
    },

    'findPeople': function (filename) {
        for (var i = 0; i < this.people.length; i++) {
            if (this.people[i]['filename'] === filename) {
                return this.people[i];
            }
        }
        return undefined;
    },

    'parse': function () {
        confluence.content(process.env.RESOURCE_ID, function (content) {
            var $ = cheerio.load(cheerio.load(content).root().text()),
                self = this;

            $('th').each(function (index) {
                self.getPeople(index)['name'] = sanitize($(this).html());
            });

            $('ac\\:image').each(function (index) {
                extractImage($(this), index, self);
            });

            confluence.attachments(process.env.RESOURCE_ID, function (content) {
                var $ = cheerio.load(content),
                    urlByFilename = {};

                $('attachment').each(function () {
                    var attachment = $(this);
                    var filename = attachment.attr('filename');
                    attachment.find('link').each(function () {
                        var link = $(this);
                        if (link.attr('rel') === 'download') {
                            urlByFilename[filename] = link.attr('href');
                        }
                    });
                });

                for (var filename in urlByFilename) {
                    if (!urlByFilename.hasOwnProperty(filename)) {
                        continue;
                    }
                    var people = self.findPeople(filename);
                    if (people !== undefined) {
                        delete people['filename'];
                        people['href'] = urlByFilename[filename];
                        continue;
                    }
                    console.log(filename, ' is not known');
                }

                console.log(self.people);
            }, function (error) {
                console.log(error);
            })
        }, function (error) {
            console.log(error);
        });
    }
};
