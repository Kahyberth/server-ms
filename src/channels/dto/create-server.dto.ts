import { IsString, IsBoolean } from 'class-validator';



export class CreateServerDto {

    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsBoolean()
    isAlive?: boolean;

    @IsString()
    created_by: string;

}