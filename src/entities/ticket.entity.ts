import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from './event.entity';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => Event, (event) => event.tickets)
  @JoinColumn({ name: 'eventId' }) // 🔥 Definindo a chave estrangeira explicitamente
  event: Event;

  @Column()
  eventId: string; // 🔥 Adicionando a chave estrangeira explicitamente

  @Column()
  quantity: number;
}
