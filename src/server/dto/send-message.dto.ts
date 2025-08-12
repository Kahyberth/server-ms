import { IsOptional, IsString } from "class-validator"


export class SendMessageDto {
    
    @IsString()
    userName: string;

    @IsString()
    @IsOptional()
    avatar?: string;

    @IsString()
    value: string;

}