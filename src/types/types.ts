export type role = {
  nome: string | null
  resp: string | null
  numero: string | null
}

export type schedule = {
  id: string
  isOpen: boolean
  tasks: role[]
  registered: string[]
}