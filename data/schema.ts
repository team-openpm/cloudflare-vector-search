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
