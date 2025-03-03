// event.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
// import { Ticket } from './ticket.entity'; // Importa a entidade Ticket
// import { Sale } from '../sales/sale.entity'; // Importa a entidade Sale

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true, default: 'No description available' })
  description: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

//   @OneToMany(() => Ticket, (ticket) => ticket.event)
//   tickets: Ticket[]; // Relacionamento com ingressos

//   @OneToMany(() => Sale, (sale) => sale.event)
//   sales: Sale[]; // Relacionamento com vendas
}