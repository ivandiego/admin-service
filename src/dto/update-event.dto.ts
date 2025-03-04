import { IsString, IsInt, Min } from 'class-validator';

export class UpdateEventDto {
  @IsString()
  name?: string;

  @IsInt()
  @Min(0)
  availableTickets?: number;
}
