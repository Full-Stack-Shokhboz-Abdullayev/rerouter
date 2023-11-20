import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateHostDto {
  @IsUrl({
    allow_protocol_relative_urls: true,
  })
  host: string;

  @IsString()
  @IsNotEmpty()
  topic: string;
}
