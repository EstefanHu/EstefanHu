/**
 * Blog content lives here as plain data for now. Every post is a slug, some
 * metadata for the list view, and an array of blocks rendered by
 * `app/blg/[slug]/page.tsx` — no markdown parser, no front matter, no build
 * step. Swap this file for a CMS later and the two pages keep working.
 *
 * Dates are ISO strings (YYYY-MM-DD) and are compared lexicographically, which
 * is the same as chronologically, so no Date parsing is needed to sort.
 */

export type PostBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'list'; items: string[] }

export type Post = {
  slug: string
  title: string
  /**
   * One-line tagline for the card. Always gets a line of its own, so keep it
   * short: anything longer is ellipsised by CSS rather than pushing the
   * preview down a line.
   */
  excerpt: string
  date: string
  tags: string[]
  body: PostBlock[]
}

export const posts: Post[] = [
  {
    slug: 'macro-software',
    title: 'Macro Software',
    excerpt:
      'A theory of control',
    date: '2026-09-18',
    tags: ['Tooling', 'Web'],
    body: [
      {
        type: 'paragraph',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      },
      {
        type: 'paragraph',
        text: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      },
      { type: 'heading', text: 'Where the complexity went' },
      {
        type: 'paragraph',
        text: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
      },
      {
        type: 'quote',
        text: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos.',
        attribution: 'Lorem Ipsum',
      },
      {
        type: 'paragraph',
        text: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
      },
      {
        type: 'list',
        items: [
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
          'Sed do eiusmod tempor incididunt ut labore et dolore magna',
          'Ut enim ad minim veniam, quis nostrud exercitation ullamco',
          'Duis aute irure dolor in reprehenderit in voluptate velit esse',
        ],
      },
      {
        type: 'paragraph',
        text: 'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae itaque earum rerum hic tenetur a sapiente delectus.',
      },
    ],
  },
  {
    slug: 'the-art-of-system-design',
    title: 'The Art of System Design',
    excerpt:
      'A meso interpretation of senior thinking',
    date: '2026-08-02',
    tags: ['CSS', 'Design'],
    body: [
      {
        type: 'paragraph',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      },
      {
        type: 'paragraph',
        text: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      },
      { type: 'heading', text: 'Order beats specificity' },
      {
        type: 'paragraph',
        text: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
      },
      {
        type: 'paragraph',
        text: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.',
      },
      {
        type: 'list',
        items: [
          'Unlayered styles always lose to a layered one',
          'Later layers beat earlier ones, specificity aside',
          '!important flips the order back inside a layer',
        ],
      },
      {
        type: 'paragraph',
        text: 'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.',
      },
    ],
  },
  {
    slug: 'the-act-of-coding',
    title: 'The Act of Coding',
    excerpt:
      'A micro look into look into software and how its created',
    date: '2026-06-21',
    tags: ['Reading', 'Data'],
    body: [
      {
        type: 'paragraph',
        text: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      },
      {
        type: 'paragraph',
        text: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
      },
      { type: 'heading', text: 'A year in numbers' },
      {
        type: 'paragraph',
        text: 'Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos.',
      },
      {
        type: 'quote',
        text: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.',
        attribution: 'Lorem Ipsum',
      },
      {
        type: 'paragraph',
        text: 'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae itaque earum rerum hic tenetur a sapiente delectus.',
      },
    ],
  },
  {
    slug: 'what-is-software',
    title: 'What is Software',
    excerpt:
      'A multi-level look into software',
    date: '2026-04-09',
    tags: ['Writing', 'Tooling'],
    body: [
      {
        type: 'paragraph',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.',
      },
      {
        type: 'list',
        items: [
          'Say what it is in the first line',
          'Show the one command that gets you running',
          'Link the docs, do not inline them',
        ],
      },
      {
        type: 'paragraph',
        text: 'Itaque earum rerum hic tenetur a sapiente delectus, reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit.',
      },
      { type: 'heading', text: 'Length is not the goal' },
      {
        type: 'paragraph',
        text: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa.',
      },
    ],
  },
  {
    slug: 'whats-a-computer',
    title: 'What\'s a Computer',
    excerpt:
      'An overcomplicated abstraction of compute',
    date: '2026-01-27',
    tags: ['Writing'],
    body: [
      {
        type: 'paragraph',
        text: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
      },
      {
        type: 'paragraph',
        text: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.',
      },
      {
        type: 'quote',
        text: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum.',
        attribution: 'Lorem Ipsum',
      },
      {
        type: 'paragraph',
        text: 'Consectetur adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem, ut enim ad minima veniam quis nostrum exercitationem ullam corporis suscipit.',
      },
    ],
  },
]

/** Newest first. ISO dates sort as plain strings, so no Date objects needed. */
export const sortedPosts = [...posts].sort(
  (a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title),
)

export function getPost(slug: string): Post | undefined {
  return sortedPosts.find((post) => post.slug === slug)
}

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

/** "Sep 18, 2026" — rendered in UTC so a build never shifts the day. */
export function formatDate(date: string): string {
  return DATE_FORMAT.format(new Date(`${date}T00:00:00Z`))
}

const WORDS_PER_MINUTE = 225

/** Rounded up, floored at a minute so nothing ever reads as "0 min read". */
export function readingTime(post: Post): number {
  const words = post.body
    .flatMap((block) => (block.type === 'list' ? block.items : [block.text]))
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length

  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

/**
 * The post's opening paragraph — prose only, never a heading or a list. Shown
 * on the card under the tagline to fill the second line, so a post that opens
 * on a heading or a list still gets a preview from its first paragraph; an
 * empty string renders as a blank line and the footers stay aligned.
 */
export function preview(post: Post): string {
  for (const block of post.body) {
    if (block.type === 'paragraph') return block.text
  }

  return ''
}
