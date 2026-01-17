import { Module } from '@nestjs/common';
import { HashModule } from 'src/lib/hash/hash.module';
import { TeamMemberController } from './team-member.controller';
import { TeamMemberService } from './team-member.service';

@Module({
  imports: [HashModule],
  controllers: [TeamMemberController],
  providers: [TeamMemberService],
  exports: [TeamMemberService],
})
export class TeamMemberModule {}
