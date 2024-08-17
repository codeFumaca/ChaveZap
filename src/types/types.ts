export type role = {
    nome:string | null
    resp:string | null
    numero:string | null
}

export type schedule = {
    id:string
    isOpen:boolean
    tasks:role[]
    registered:string[]
}

export interface YouTubeMedia {
    "360p": {
      has_audio: boolean;
      quality: string;
      size: string;
      url: string;
    };
    audio: {
      quality: string;
      size: string;
      url: string;
    };
  }