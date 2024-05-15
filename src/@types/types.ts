export type role = {
    nome:string | null
    resp:string | null
    numero:string | null
}

export type schedule = {
    week:number
    year:number
    tasks:role[]
    registered:string[]
}