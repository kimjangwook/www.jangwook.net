import type { Language } from './i18n/languages';

export interface ArchiveLabels {
	tags: string;
	tagsDescription: string;
	searchTags: string;
	searchPlaceholder: string;
	clearSearch: string;
	searchResults: (count: number) => string;
	noTags: string;
	noMatchingTags: string;
	tagCount: (count: number) => string;
	postsWithTag: (tag: string) => string;
	readTime: string;
	readMore: string;
	page: string;
	previous: string;
	next: string;
	loadMore: string;
	retry: string;
	loading: string;
	loaded: (count: number) => string;
	allLoaded: string;
	loadError: string;
	skipToFooter: string;
	archiveLabel: string;
}

/**
 * These labels are intentionally local to the archive surface. The shared UI
 * dictionary owns navigation labels; keeping pagination/search copy here lets
 * archive pages evolve without coupling their static routes to that file.
 */
export const archiveLabels: Record<Language, ArchiveLabels> = {
	ko: {
		tags: '태그',
		tagsDescription: '주제별로 기술 기록을 찾아보세요. 태그를 선택하면 관련 글을 모아 볼 수 있습니다.',
		searchTags: '태그 검색',
		searchPlaceholder: '태그 이름 입력',
		clearSearch: '검색 지우기',
		searchResults: (count) => `${count}개 태그`,
		noTags: '아직 공개된 태그가 없습니다.',
		noMatchingTags: '검색어와 일치하는 태그가 없습니다.',
		tagCount: (count) => `${count}개 글`,
		postsWithTag: (tag) => `#${tag} 글`,
		readTime: '분 소요',
		readMore: '더 읽기',
		page: '페이지',
		previous: '이전 페이지',
		next: '다음 페이지',
		loadMore: '더 불러오기',
		retry: '다시 시도',
		loading: '글을 불러오는 중입니다.',
		loaded: (count) => `${count}개 글을 추가했습니다.`,
		allLoaded: '모든 글을 불러왔습니다.',
		loadError: '글을 더 불러오지 못했습니다. 아래 페이지 이동을 이용하거나 다시 시도하세요.',
		skipToFooter: '푸터로 건너뛰기',
		archiveLabel: 'archive',
	},
	en: {
		tags: 'Tags',
		tagsDescription: 'Browse the field notes by topic. Choose a tag to read the related posts together.',
		searchTags: 'Search tags',
		searchPlaceholder: 'Type a tag name',
		clearSearch: 'Clear search',
		searchResults: (count) => `${count} tag${count === 1 ? '' : 's'}`,
		noTags: 'No published tags yet.',
		noMatchingTags: 'No tags match your search.',
		tagCount: (count) => `${count} post${count === 1 ? '' : 's'}`,
		postsWithTag: (tag) => `Posts tagged #${tag}`,
		readTime: 'min read',
		readMore: 'Read more',
		page: 'Page',
		previous: 'Previous page',
		next: 'Next page',
		loadMore: 'Load more',
		retry: 'Try again',
		loading: 'Loading more posts.',
		loaded: (count) => `Added ${count} more post${count === 1 ? '' : 's'}.`,
		allLoaded: 'All posts are loaded.',
		loadError: 'More posts could not be loaded. Use the page links below or try again.',
		skipToFooter: 'Skip to footer',
		archiveLabel: 'archive',
	},
	ja: {
		tags: 'タグ',
		tagsDescription: 'テーマから技術ノートを探せます。タグを選ぶと関連する記事をまとめて読めます。',
		searchTags: 'タグを検索',
		searchPlaceholder: 'タグ名を入力',
		clearSearch: '検索をクリア',
		searchResults: (count) => `${count}件のタグ`,
		noTags: '公開済みのタグはまだありません。',
		noMatchingTags: '一致するタグがありません。',
		tagCount: (count) => `${count}件の記事`,
		postsWithTag: (tag) => `#${tag} の記事`,
		readTime: '分',
		readMore: '続きを読む',
		page: 'ページ',
		previous: '前のページ',
		next: '次のページ',
		loadMore: 'さらに読み込む',
		retry: '再試行',
		loading: '記事を読み込んでいます。',
		loaded: (count) => `${count}件の記事を追加しました。`,
		allLoaded: 'すべての記事を読み込みました。',
		loadError: '記事を読み込めませんでした。下のページリンクを使うか、再試行してください。',
		skipToFooter: 'フッターへ移動',
		archiveLabel: 'archive',
	},
	zh: {
		tags: '标签',
		tagsDescription: '按主题浏览技术笔记。选择标签即可集中阅读相关文章。',
		searchTags: '搜索标签',
		searchPlaceholder: '输入标签名称',
		clearSearch: '清除搜索',
		searchResults: (count) => `${count}个标签`,
		noTags: '暂时没有已发布的标签。',
		noMatchingTags: '没有匹配的标签。',
		tagCount: (count) => `${count}篇文章`,
		postsWithTag: (tag) => `#${tag} 相关文章`,
		readTime: '分钟阅读',
		readMore: '继续阅读',
		page: '第',
		previous: '上一页',
		next: '下一页',
		loadMore: '加载更多',
		retry: '重试',
		loading: '正在加载更多文章。',
		loaded: (count) => `已添加${count}篇文章。`,
		allLoaded: '所有文章均已加载。',
		loadError: '无法加载更多文章。请使用下方分页链接或重试。',
		skipToFooter: '跳到页脚',
		archiveLabel: 'archive',
	},
};
