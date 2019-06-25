/* eslint-disable no-undef */
Prism.languages.vgl = {
	'string': {
		pattern: /"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,
		greedy: true
	},
	'comment': /{[\s\S]*?(?:}|$)/,
	'number': /-?\d+\.?\d*(e[+-]?\d+)?/i,
	'punctuation': /[[\](),]/,
	'operator': /[+\-*/#]/,
	'keyword': /\b(?:JOIN LIBRARY|JOIN STANDARD_LIBRARY|DECLARE|CREATE OBJECT)\b/,
	'boolean': /\b(?:TRUE|FALSE)\b/,
	'null': {
		pattern: /\b(?:EMPTY|ERROR|LOCKED)\b/,
		alias: 'keyword'
	}
};