export interface Asiento {
  id: string;      
  numero: number;  
  ocupado: boolean;
  seleccionado: boolean;
}

export interface Fila {
  letra: string;
  tipoColor: 'normal' | 'azul' | 'amarillo';
  bloqueIzq: Asiento[];
  bloqueCentro: Asiento[];
  bloqueDer: Asiento[];
}

