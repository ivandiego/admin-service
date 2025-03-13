import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Event } from './event.entity';

@Entity()
@Index(['eventId', 'userId']) // ✅ Índice composto para melhorar buscas
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index() // ✅ Índice para melhorar buscas por usuário
  userId: string;

  @ManyToOne(() => Event, (event) => event.tickets)
  @JoinColumn({ name: 'eventId' }) // 🔥 Definindo a chave estrangeira explicitamente
  event: Event;

  @Column()
  @Index() // ✅ Índice para melhorar buscas por usuário
  eventId: string; // 🔥 Adicionando a chave estrangeira explicitamente

  @Column()
  quantity: number;
}
