/** Narrative grammar icons: [!bug] foot-gun, [!idea] smarter move, [!rule] takeaway. */
export type IconMark = 'bug' | 'idea' | 'rule';

export type InlineToken =
	| { kind: 'text'; value: string }
	| { kind: 'code'; value: string }
	| { kind: 'bold'; value: string }
	/** Semantic icon marker — rendered as an inline icon, silent in narration. */
	| { kind: 'icon'; value: IconMark };

const markPattern = /`([^`]+)`|\*\*([^*]+)\*\*|\[!(bug|idea|rule)\] ?/g;

/**
 * Splits span text into inline tokens: `code`, **bold**, and icon grammar —
 * `[!bug]` foot-gun, `[!idea]` smarter move, `[!rule]` takeaway.
 * Deliberately tiny — spans need inline emphasis, not a document format.
 * Unmatched marks are left as literal text.
 */
export function parseInline(text: string): InlineToken[] {
	const tokens: InlineToken[] = [];
	let last = 0;

	for (const match of text.matchAll(markPattern)) {
		if (match.index > last) tokens.push({ kind: 'text', value: text.slice(last, match.index) });
		if (match[1] !== undefined) tokens.push({ kind: 'code', value: match[1] });
		else if (match[2] !== undefined) tokens.push({ kind: 'bold', value: match[2] });
		else tokens.push({ kind: 'icon', value: match[3] as IconMark });
		last = match.index + match[0].length;
	}

	if (last < text.length) tokens.push({ kind: 'text', value: text.slice(last) });
	return tokens;
}
