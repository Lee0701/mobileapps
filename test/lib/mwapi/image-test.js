'use strict';

const assert = require('../../utils/assert.js');
const buildUrls = require('../../../lib/mwapi').buildLeadImageUrls;
const scale = require('../../../lib/mwapi').scaledImageUrl;
const scaledObj = require('../../../lib/mwapi').scaledThumbObj;

const path = '//upload.wikimedia.org/wikipedia/commons/thumb/a/a0';
const httpPath = 'http://upload.wikimedia.org/wikipedia/commons/thumb/a/a0';
const httpsPath = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0';

describe('lib:mwapi:image', () => {
    it('image URLs are rewritten if URL contains a size and the desired width is smaller', () => {
        const prefix = 'https://upload.wikimedia.org/wikipedia/commons';
        assert.deepEqual(scale(`${prefix}/thumb/0/0b/Cat_poster_1.jpg/720px-Cat_poster_1.jpg`, 320),
            `${prefix}/thumb/0/0b/Cat_poster_1.jpg/320px-Cat_poster_1.jpg`);
        assert.deepEqual(scale(`${prefix}/thumb/0/0b/Cat_poster_1.jpg/120px-Cat_poster_1.jpg`, 320),
            `${prefix}/thumb/0/0b/Cat_poster_1.jpg/120px-Cat_poster_1.jpg`);
        assert.deepEqual(scale(`${prefix}/9/96/Vasskertentrance.jpg`, 320),
            `${prefix}/9/96/Vasskertentrance.jpg`);
    });

    it('thumb objects are scaled if the original image is scalable', () => {
        const prefix = 'https://upload.wikimedia.org/wikipedia/commons';
        const initialHasWidth = {
            source: `${prefix}/thumb/0/0b/Cat_poster_1.jpg/1280px-Cat_poster_1.jpg`,
            width: 1280,
            height: 840
        };
        const initialNoWidth = {
            source: `${prefix}/9/96/Vasskertentrance.jpg`,
            width: 800,
            height: 533
        };
        assert.deepEqual(scaledObj(initialHasWidth, 5935, 320),
            {
                source: `${prefix}/thumb/0/0b/Cat_poster_1.jpg/320px-Cat_poster_1.jpg`,
                width: 320,
                height: 210
            });
        assert.deepEqual(scaledObj(initialHasWidth, 5935, 1600),
            {
                source: `${prefix}/thumb/0/0b/Cat_poster_1.jpg/1280px-Cat_poster_1.jpg`,
                width: 1280,
                height: 840
            });
        assert.deepEqual(scaledObj(initialNoWidth, 800, 320),
            {
                source: `${prefix}/9/96/Vasskertentrance.jpg`,
                width: 800,
                height: 533
            });
    });

    it('buildLeadImageUrls("a") should return all "a"s', () => {
        assert.deepEqual(buildUrls('a'), {
            320: 'a',
            640: 'a',
            800: 'a',
            1024: 'a'
        }
        );
    });

    it('buildLeadImageUrls with size 1024px', () => {
        assert.deepEqual(buildUrls(`${path}/Sun_in_February.jpg/1024px-Sun_in_February.jpg`), {
            320: `${path}/Sun_in_February.jpg/320px-Sun_in_February.jpg`,
            640: `${path}/Sun_in_February.jpg/640px-Sun_in_February.jpg`,
            800: `${path}/Sun_in_February.jpg/800px-Sun_in_February.jpg`,
            1024: `${path}/Sun_in_February.jpg/1024px-Sun_in_February.jpg`
        }
        );
    });

    it('buildLeadImageUrls with size 555px should return size 320 and 555 for rest', () => {
        assert.deepEqual(buildUrls(`${path}/Sun_in_February.jpg/555px-Sun_in_February.jpg`), {
            320: `${path}/Sun_in_February.jpg/320px-Sun_in_February.jpg`,
            640: `${path}/Sun_in_February.jpg/555px-Sun_in_February.jpg`,
            800: `${path}/Sun_in_February.jpg/555px-Sun_in_February.jpg`,
            1024: `${path}/Sun_in_February.jpg/555px-Sun_in_February.jpg`
        }
        );
    });

    it('buildLeadImageUrls with size 750px should return size 320, 640, and 750 for rest', () => {
        assert.deepEqual(buildUrls(`${path}/Sun_in_February.jpg/750px-Sun_in_February.jpg`), {
            320: `${path}/Sun_in_February.jpg/320px-Sun_in_February.jpg`,
            640: `${path}/Sun_in_February.jpg/640px-Sun_in_February.jpg`,
            800: `${path}/Sun_in_February.jpg/750px-Sun_in_February.jpg`,
            1024: `${path}/Sun_in_February.jpg/750px-Sun_in_February.jpg`
        }
        );
    });

    it('buildLeadImageUrls with size 200px should return size 200 for all URLs', () => {
        assert.deepEqual(buildUrls(`${path}/Sun_in_February.jpg/200px-Sun_in_February.jpg`), {
            320: `${path}/Sun_in_February.jpg/200px-Sun_in_February.jpg`,
            640: `${path}/Sun_in_February.jpg/200px-Sun_in_February.jpg`,
            800: `${path}/Sun_in_February.jpg/200px-Sun_in_February.jpg`,
            1024: `${path}/Sun_in_February.jpg/200px-Sun_in_February.jpg`
        }
        );
    });

    it('buildLeadImageUrls rewrites http URLs to https', () => {
        assert.deepEqual(buildUrls(`${httpPath}/Sun_in_February.jpg/1024px-Sun_in_February.jpg`), {
            320: `${httpsPath}/Sun_in_February.jpg/320px-Sun_in_February.jpg`,
            640: `${httpsPath}/Sun_in_February.jpg/640px-Sun_in_February.jpg`,
            800: `${httpsPath}/Sun_in_February.jpg/800px-Sun_in_February.jpg`,
            1024: `${httpsPath}/Sun_in_February.jpg/1024px-Sun_in_February.jpg`
        }
        );
    });
});
