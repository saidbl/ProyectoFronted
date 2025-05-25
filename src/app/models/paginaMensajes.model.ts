import { MensajeDTO } from "./mensajeDTO.model";

export interface PaginaMensajes {
  content: MensajeDTO[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
}