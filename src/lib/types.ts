export interface Edition {
  id: string
  edition_number: number
  title: string
  subtitle: string | null // [NEW]
  cover_image_url: string | null
  pdf_url: string | null // [NEW]
  release_date: string
  created_at: string
}

export interface Article {
  id: string
  edition_id: string
  title: string
  short_description: string | null
  content: string | null
  author: string
  department: string | null
  page_number: number
  pdf_url: string | null
  created_at: string
}

export interface ArticleWithEdition extends Article {
  editions: Edition
}