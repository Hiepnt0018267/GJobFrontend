import {
  ArrowRight,
  ChevronRight,
  Search,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  HELP_CATEGORIES,
  searchHelpArticles,
  type HelpArticle,
} from '../../data/helpCenterData'

export default function HelpCenterPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category')
  const selectedCategorySlug =
    categoryParam && HELP_CATEGORIES.some((c) => c.slug === categoryParam)
      ? categoryParam
      : 'safety'

  const searchQuery = searchParams.get('q') || ''
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null)

  const selectedCategory = useMemo(() => {
    return HELP_CATEGORIES.find((c) => c.slug === selectedCategorySlug) || HELP_CATEGORIES[0]
  }, [selectedCategorySlug])

  const searchResults = useMemo(() => {
    return searchHelpArticles(searchQuery)
  }, [searchQuery])

  const handleSelectCategory = (slug: string) => {
    setExpandedArticleId(null)
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('category', slug)
        next.delete('q')
        return next
      },
      { replace: true }
    )
  }

  const handleSearchChange = (value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value.trim()) {
          next.set('q', value.trim())
        } else {
          next.delete('q')
        }
        return next
      },
      { replace: true }
    )
  }

  const handleClearSearch = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete('q')
        return next
      },
      { replace: true }
    )
  }

  const toggleArticle = (id: string) => {
    setExpandedArticleId((current) => (current === id ? null : id))
  }

  const isSearching = searchQuery.trim().length > 0

  return (
    <div className="min-h-screen bg-[#f4f5f5] pb-16 pt-6 sm:pb-20 sm:pt-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Mobile Horizontal Category Tabs */}
        <div className="lg:hidden mb-5">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {HELP_CATEGORIES.map((cat) => {
              const isActive = !isSearching && selectedCategorySlug === cat.slug
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.slug)}
                  className={`shrink-0 rounded-md px-3.5 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#15999B] text-white shadow-xs'
                      : 'bg-white text-gray-700 border border-gray-200/80 hover:bg-gray-50'
                  }`}
                >
                  {cat.title}
                </button>
              )
            })}
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Categories Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="rounded-lg bg-white shadow-2xs border border-gray-100/90 overflow-hidden">
              <div className="px-6 pt-5 pb-3">
                <h2 className="text-base sm:text-lg font-bold text-[#15999B]">Chuyên mục</h2>
              </div>
              <nav aria-label="Chuyên mục hỗ trợ" className="flex flex-col pb-2">
                {HELP_CATEGORIES.map((cat) => {
                  const isActive = !isSearching && selectedCategorySlug === cat.slug
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat.slug)}
                      className={`w-full text-left px-6 py-3.5 text-sm sm:text-[15px] transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-teal-50/90 text-[#15999B] font-semibold border-l-4 border-[#15999B]'
                          : 'text-gray-700 hover:text-[#15999B] hover:bg-gray-50/70 font-normal border-l-4 border-transparent'
                      }`}
                    >
                      {cat.title}
                    </button>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Right Column: Search + Content */}
          <main className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-5">
            {/* Real-time Search Box */}
            <div className="relative w-full">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Tìm kiếm câu hỏi..."
                className="w-full rounded-md border border-gray-200/90 bg-white py-3 pl-11 pr-10 text-sm text-gray-800 placeholder-gray-400 shadow-2xs focus:border-[#15999B] focus:outline-none focus:ring-1 focus:ring-[#15999B] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Xóa từ khóa tìm kiếm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Title */}
            <div className="pt-1 pb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight font-[Plus_Jakarta_Sans,sans-serif]">
                {isSearching ? `Kết quả tìm kiếm cho: "${searchQuery}"` : selectedCategory.title}
              </h1>
            </div>

            {/* Articles List / Search Results */}
            {isSearching ? (
              <div className="space-y-3">
                {searchResults.length === 0 ? (
                  <div className="rounded-lg bg-white border border-dashed border-gray-200 p-8 text-center space-y-3">
                    <p className="text-sm font-semibold text-gray-800">Không tìm thấy câu hỏi phù hợp</p>
                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                      Vui lòng thử lại với từ khóa khác như &quot;tìm việc&quot;, &quot;tạo cv&quot;, &quot;an toàn&quot;, hoặc chọn chuyên mục bên trái.
                    </p>
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#15999B] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#117D7F] transition-colors"
                    >
                      Xem tất cả chuyên mục
                    </button>
                  </div>
                ) : (
                  searchResults.map(({ article, category }) => (
                    <ArticleAccordionItem
                      key={article.id}
                      article={article}
                      categoryName={category.title}
                      isExpanded={expandedArticleId === article.id}
                      onToggle={() => toggleArticle(article.id)}
                    />
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {selectedCategory.articles.map((article) => (
                  <ArticleAccordionItem
                    key={article.id}
                    article={article}
                    isExpanded={expandedArticleId === article.id}
                    onToggle={() => toggleArticle(article.id)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function ArticleAccordionItem({
  article,
  categoryName,
  isExpanded,
  onToggle,
}: {
  article: HelpArticle
  categoryName?: string
  isExpanded: boolean
  onToggle: () => void
}) {
  const contentId = `help-article-${article.id}`
  const triggerId = `help-trigger-${article.id}`

  return (
    <div className="rounded-lg border border-gray-100/90 bg-white shadow-2xs hover:border-gray-200 transition-colors overflow-hidden">
      <button
        type="button"
        id={triggerId}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#49BBBD]"
      >
        <div className="flex-1">
          {categoryName && (
            <span className="inline-block text-[11px] font-semibold text-[#15999B] bg-teal-50 px-2 py-0.5 rounded mb-1">
              {categoryName}
            </span>
          )}
          <span className="text-[15px] text-gray-800 font-medium leading-relaxed block">
            {article.title}
          </span>
        </div>
        <ChevronRight
          size={16}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-90 text-[#15999B]' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isExpanded && (
        <div
          id={contentId}
          role="region"
          aria-labelledby={triggerId}
          className="border-t border-gray-100 bg-gray-50/30 px-5 py-4 space-y-3 text-sm text-gray-700 leading-relaxed animate-in fade-in-50 duration-150"
        >
          <p>{article.content}</p>

          {article.bullets && article.bullets.length > 0 && (
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
              {article.bullets.map((bullet, idx) => (
                <li key={idx}>{bullet}</li>
              ))}
            </ul>
          )}

          {article.note && (
            <div className="p-3 bg-amber-50/90 border border-amber-200/60 text-amber-900 rounded-md text-xs font-medium">
              {article.note}
            </div>
          )}

          {article.actionLink && (
            <div className="pt-1">
              <Link
                to={article.actionLink.url}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#15999B] hover:text-[#117D7F] hover:underline"
              >
                <span>{article.actionLink.text}</span>
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
