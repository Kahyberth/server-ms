import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateChannelDto {


    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty()
    created_by: string;


    @IsString()
    @IsNotEmpty()
    serverId: string;

    @IsOptional()
    @IsString()
    parentId?: string;


}