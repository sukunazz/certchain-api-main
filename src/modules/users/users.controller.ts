import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from './auth/decorators/current-user';
import { UserJwtAuthGuard } from './auth/guards/jwt.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('Users')
@UseGuards(UserJwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns the current user profile' })
  async getCurrentUser(@CurrentUser() userId: string) {
    return this.usersService.findById(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Returns the updated user profile' })
  async updateCurrentUser(
    @CurrentUser() userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({
    status: 200,
    description: 'Returns true if account was deleted',
  })
  async deleteCurrentUser(@CurrentUser() userId: string) {
    return this.usersService.delete(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Returns the user profile' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
