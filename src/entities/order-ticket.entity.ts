import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity';

@Entity()
@Index(['eventId', 'userId']) // ✅ Índice composto para melhorar buscas
export class TicketOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' }) // ✅ Agora eventId é do tipo UUID
  @Index() // ✅ Índice para consultas por evento
  eventId: string;

  @Column({ type: 'uuid' }) // ✅ userId também deve ser UUID se necessário
  @Index() // ✅ Índice para consultas por usuário
  userId: string;

  @Column()
  quantity: number;

  @ManyToOne(() => Event, (event) => event.tickets, { eager: true }) // 🔥 Relacionamento correto
  @JoinColumn({ name: 'eventId' }) // 🔥 Define a chave estrangeira
  event: Event;
}

