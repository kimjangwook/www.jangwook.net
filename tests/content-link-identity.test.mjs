import test from 'node:test';import assert from 'node:assert/strict';import {contentLinkIdentity} from '../scripts/content-link-identity.mjs';
test('localized teaching links retain destination identity without hiding source changes',()=>{
 const base='https://jangwook.net';
 assert.equal(contentLinkIdentity(base+'/en/series/accessibility/overview#evaluation-prompt'),base+'/series/accessibility/overview#evaluation-prompt');
 assert.equal(contentLinkIdentity(base+'/labs/accessibility/media-alternatives-1-2-3/ja/v01.html'),base+'/labs/accessibility/media-alternatives-1-2-3/ko/v01.html');
 for(const value of ['https://www.w3.org/en/series/accessibility/overview','https://other.example/labs/accessibility/media-alternatives-1-2-3/ja/v01.html',base+'/labs/accessibility/other-series/ja/v01.html'])assert.equal(contentLinkIdentity(value),value);
 assert.notEqual(contentLinkIdentity(base+'/en/series/accessibility/overview?different=1'),base+'/series/accessibility/overview');
 assert.notEqual(contentLinkIdentity(base+'/en/series/accessibility/keyboard'),base+'/series/accessibility/overview');
});
