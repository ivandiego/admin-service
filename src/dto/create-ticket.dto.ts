import { IsString, IsUUID, IsInt, Min, Max } from 'class-validator';

export class CreateTicketDto {
  @IsUUID()
  eventId: string;

  @IsUUID()
  userId: string;

  @IsInt()
  @Min(1)
  @Max(5) // 🔥 Regra: um usuário pode comprar no máximo 5 bilhetes por evento
  quantity: number;
}
