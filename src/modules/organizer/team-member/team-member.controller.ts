import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TeamMember } from '@prisma/client';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import { PaginateQueryDto } from 'src/lib/pagination/dto/paginate-query.dto';
import { Paginate } from 'src/lib/pagination/paginate';
import { OrganizerJwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { TeamMemberService } from './team-member.service';

@ApiTags('Team Member')
@Controller('organizer/team-member')
export class TeamMemberController {
  constructor(private readonly service: TeamMemberService) {}

  @Post()
  @ApiOperation({ summary: 'Create new team member' })
  @ApiResponse({
    status: 201,
    description: 'Team member has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    type: ErrorResponseDto,
  })
  @UseGuards(OrganizerJwtAuthGuard)
  async create(@Body() createDto: CreateTeamMemberDto) {
    const data = await this.service.create(createDto);
    return {
      data,
      message: 'Team member created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all team members' })
  @ApiResponse({
    status: 200,
    description: 'Return all team members.',
  })
  @UseGuards(OrganizerJwtAuthGuard)
  async getAll(@Query() query: PaginateQueryDto) {
    const paginate = new Paginate<Partial<TeamMember>>(query);
    const [data, count] = await this.service.all(paginate.params());
    return paginate.response(data as Partial<TeamMember>[], count);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team member by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the team member.',
  })
  @ApiResponse({
    status: 404,
    description: 'Team member not found',
    type: ErrorResponseDto,
  })
  @UseGuards(OrganizerJwtAuthGuard)
  async getOne(@Param('id') id: string) {
    const data = await this.service.one(id);
    return {
      data,
      message: 'Team member fetched successfully',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update team member by id' })
  @ApiResponse({
    status: 200,
    description: 'Team member has been successfully updated.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Team member not found',
    type: ErrorResponseDto,
  })
  @UseGuards(OrganizerJwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTeamMemberDto,
  ) {
    const data = await this.service.update(id, updateDto);
    return {
      data,
      message: 'Team member updated successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete team member' })
  @ApiResponse({
    status: 200,
    description: 'Team member has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Team member not found',
    type: ErrorResponseDto,
  })
  @UseGuards(OrganizerJwtAuthGuard)
  async delete(@Param('id') id: string) {
    const data = await this.service.remove(id);
    return {
      data,
      message: 'Team member deleted successfully',
    };
  }
}
