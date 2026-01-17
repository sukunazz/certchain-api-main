import { UserWithoutPassword } from '../../users.service';

export class UserRegisteredEvent {
  constructor(public readonly user: UserWithoutPassword) {}
}
