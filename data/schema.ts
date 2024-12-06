export interface Document {
  id: number
  url: string
  namespace: string
  title: string
  text: string
  summary: string
  indexed_at: number
}

export type DocumentWithoutText = Omit<Document, 'text'>

export type DocumentSearchResult = DocumentWithoutText & {
  score: number
}

export type DocumentVectorType = 'title' | 'summary' | 'paragraph'
