export class LocalTime {
    constructor(
        public horas: number,
        public minutos: number, 
        public segundos: number 
    ) {}
    toString(): string {
        return `${this.horas.toString().padStart(2, '0')}:${this.minutos.toString().padStart(2, '0')}:${this.segundos.toString().padStart(2, '0')}`;
    }
    static fromDate(date: Date): LocalTime {
        return new LocalTime(
            date.getHours(),
            date.getMinutes(),
            date.getSeconds()
        );
    }
    static fromString(timeString: string): LocalTime {
        const [horas, minutos, segundos] = timeString.split(':').map(Number);
        return new LocalTime(horas, minutos, segundos);
    }
}