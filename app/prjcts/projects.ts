/**
 * Project content lives here as plain data for the same reason the blog's does:
 * no markdown parser, no front matter, no build step. A project is a `slug`,
 * the metadata the list card needs, and a `body` of blocks rendered by
 * `app/prjcts/[slug]/page.tsx`.
 *
 * Years are plain numbers and sort as numbers, so ordering needs no Date
 * parsing. Featured projects sort ahead of the rest, then newest year first.
 */

export type ProjectBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'list'; items: string[] }

export type ProjectLink = {
  /** What the button says, e.g. "Source" or "Live site". */
  label: string
  href: string
}

export type Project = {
  slug: string
  title: string
  /**
   * One-line tagline for the card. Always gets a line of its own, so keep it
   * short: anything longer is ellipsised by CSS rather than pushing the
   * summary down a line.
   */
  excerpt: string
  /** The opening paragraph — prose only, never a heading or a list. */
  summary: string
  year: number
  /** Where the project stands: "Live", "In progress", "Archived". */
  status: 'Live' | 'In progress' | 'Archived'
  /** Short role line, e.g. "Solo build" or "Team of 3, backend". */
  role: string
  tags: string[]
  /** The tools it was built with, shown as its own row on the detail page. */
  stack: string[]
  /** Featured projects lead the list and get an accent marker on the card. */
  featured?: boolean
  links: ProjectLink[]
  body: ProjectBlock[]
}

export const projects: Project[] = [
  {
    slug: 'helios',
    title: 'Helios Journal',
    excerpt: 'The journal that grows with you',
    summary: '',
    year: 2026,
    status: 'Live',
    role: 'Solo build',
    tags: ['web', 'desktop'],
    stack: ['TypeScript', 'Node', 'Next.js', 'Electrum.js'],
    featured: true,
    links: [
      { label: 'Source', href: 'https://github.com/estefanhu/helios'},
      {label: 'Write-up', href: '/blg/helios-journal'},
    ],
    body: [],
  },
  {
    slug: 'reading-dashboard',
    title: 'Reading Dashboard',
    excerpt: 'A year of books, read as data',
    summary:
      'The reading stats on this site, built from a Goodreads library export and turned into pages-per-book, era and genre charts — no accounts, no tracking, all of it resolved at build time.',
    year: 2026,
    status: 'Live',
    role: 'Solo build',
    tags: ['Data', 'Web'],
    stack: ['Next.js', 'React', 'Tailwind', 'CSS Modules'],
    featured: true,
    links: [
      { label: 'Source', href: 'https://github.com/estefanhu/' },
      { label: 'Open it', href: '/rdng' },
    ],
    body: [
      {
        type: 'paragraph',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      },
      { type: 'heading', text: 'The build-time bargain' },
      {
        type: 'paragraph',
        text: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
      },
      {
        type: 'list',
        items: [
          'Parse the export once, statically, at build time',
          'Report coverage honestly rather than implying completeness',
          'Let the page fall back to the last month with any read in it',
        ],
      },
      {
        type: 'paragraph',
        text: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.',
      },
    ],
  },
  {
    slug: 'resume-site',
    title: 'This Site',
    excerpt: 'Make, break, and make again',
    summary:
      'The site you are on: resume, reading dashboard, blog and projects, all statically prerendered with CSS Modules and a content layer that is just TypeScript.',
    year: 2024,
    status: 'In progress',
    role: 'Solo build',
    tags: ['Web', 'Design'],
    stack: ['Next.js', 'React', 'CSS Modules'],
    links: [{ label: 'Source', href: 'https://github.com/estefanhu/' }],
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
        type: 'paragraph',
        text: 'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae itaque earum rerum hic tenetur a sapiente delectus.',
      },
    ],
  },
  {
    slug: 'terminal-notes',
    title: 'Terminal Notes',
    excerpt: 'Markdown that stays where you left it',
    summary:
      'A CLI scratchpad that keeps notes as plain Markdown files on disk, so nothing to import, export, sync or lose — the terminal is only the editor.',
    year: 2023,
    status: 'Archived',
    role: 'Solo build',
    tags: ['Tooling', 'CLI'],
    stack: ['Go'],
    links: [{ label: 'Source', href: 'https://github.com/estefanhu/' }],
    body: [
      {
        type: 'paragraph',
        text: 'Consectetur adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem, ut enim ad minima veniam quis nostrum exercitationem ullam corporis suscipit.',
      },
      {
        type: 'paragraph',
        text: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
      },
    ],
  },
]

/** Featured first, then newest year, then title — stable and build-time only. */
export const sortedProjects = [...projects].sort(
  (a, b) =>
    Number(b.featured ?? false) - Number(a.featured ?? false) ||
    b.year - a.year ||
    a.title.localeCompare(b.title),
)

export function getProject(slug: string): Project | undefined {
  return sortedProjects.find((project) => project.slug === slug)
}

/**
 * The project's opening paragraph — prose only, never a heading or a list.
 * Shown on the card to fill the second line, so a project that opens on a
 * heading or a list still gets a preview from its first paragraph; an empty
 * string renders as a blank line and the footers stay aligned.
 */
export function preview(project: Project): string {
  return project.summary
}
