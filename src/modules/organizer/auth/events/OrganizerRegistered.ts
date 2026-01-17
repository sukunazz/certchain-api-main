import { TeamMemberWithoutPassword } from '../../team-member/team-member.service';

export class OrganizerRegisteredEvent {
  constructor(public readonly teamMember: TeamMemberWithoutPassword) {}
}
