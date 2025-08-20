import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Channel } from "./channel.entity";


@Entity('Message')
export class Message {


    @PrimaryGeneratedColumn('uuid')
    message_id: string;

    @Column({ type: 'varchar', nullable: false })
    userName: string;

    @Column({ type: 'text', nullable: true })
    avatar?: string;

    @Column({ type: 'text', nullable: false })
    value: string;


    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(()=> Channel, (channel)=> channel.message)
    channel: Channel;

}