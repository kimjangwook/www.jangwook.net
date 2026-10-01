import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalPagePath, canonicalizeUrl } from './validate-hreflang.mjs';

test('hreflang comparison treats literal and encoded Unicode URLs as equivalent', () => {
	const literal = 'https://jangwook.net/ja/tags/aiエーシェント--1nu6dwp/';
	const encoded = 'https://jangwook.net/ja/tags/ai%E3%82%A8%E3%83%BC%E3%82%B7%E3%82%A7%E3%83%B3%E3%83%88--1nu6dwp/';
	assert.equal(canonicalizeUrl(literal), encoded);
	assert.equal(canonicalPagePath(literal), canonicalPagePath(encoded));
});

test('hreflang comparison normalizes decomposed Unicode route segments', () => {
	const composed = 'https://jangwook.net/ko/tags/ai-개발/';
	const decomposed = `https://jangwook.net/ko/tags/ai-${'개발'.normalize('NFD')}/`;
	assert.equal(canonicalizeUrl(composed), canonicalizeUrl(decomposed));
});
