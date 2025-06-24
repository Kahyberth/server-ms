import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Channel } from "./channel.entity";

@Entity('Server')
export class Server {


    @PrimaryGeneratedColumn('uuid')
    server_id: string;

    @Column({type: 'varchar', nullable: false})
    serverName: string;

    @Column({type: 'text',  nullable: true})
    description?: string;

    @Column({type: 'boolean', nullable: true, default: true})
    isAlive?: boolean;

    @Column({type: 'varchar', nullable: false})
    created_by: string;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;


    @OneToMany(()=> Channel, (channel)=> channel.server)
    channel: Channel[];

}