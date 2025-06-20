import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateRaffleParticipantDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
