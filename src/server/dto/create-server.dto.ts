import { IsString, IsBoolean, IsOptional } from 'class-validator';



export class CreateServerDto {

    @IsString()
    serverName: string;

    @IsString()
    description: string;

    @IsBoolean()
    @IsOptional()
    isAlive?: boolean;

    @IsString()
    created_by: string;

    @IsString()
    teamId: string;

}