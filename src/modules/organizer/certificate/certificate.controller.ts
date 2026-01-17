import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginateQueryDto } from 'src/lib/pagination/dto/paginate-query.dto';
import { Paginate } from 'src/lib/pagination/paginate';
import { OrganizerJwtAuthGuard } from '../auth/guards/jwt.guard';
import { CertificateService } from './certificate.service';
import { CreateBulkCertificatesDto } from './dto/create-bulk-certificates.dto';
import { CreateCertificateDto } from './dto/create-certificate.dto';
import { IsEventCompletedGuard } from './guards/is-event-completed';

@Controller('organizer/certificate')
@ApiTags('Organizer Certificate')
@UseGuards(OrganizerJwtAuthGuard)
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post()
  @UseGuards(IsEventCompletedGuard)
  @ApiOperation({ summary: 'Create a certificate' })
  create(@Body() createCertificateDto: CreateCertificateDto) {
    return this.certificateService.create(createCertificateDto);
  }

  @Post('bulk/:eventId')
  @UseGuards(IsEventCompletedGuard)
  @ApiOperation({ summary: 'Create a certificate for all attendees' })
  async createBulk(@Param('eventId') eventId: string) {
    const result =
      await this.certificateService.createBulkCertificates(eventId);
    return {
      message: 'Certificates created and emails queued',
      data: result,
    };
  }

  @Post('bulk-selected/:eventId')
  @UseGuards(IsEventCompletedGuard)
  @ApiOperation({ summary: 'Create a certificate for selected attendees' })
  createBulkForSelectedUsers(
    @Param('eventId') eventId: string,
    @Body() createBulkDto: CreateBulkCertificatesDto,
  ) {
    return this.certificateService.createBulkCertificatesForSelectedUsers(
      eventId,
      createBulkDto.userIds,
    );
  }

  @Get(':eventId')
  @ApiOperation({ summary: 'Get all certificates' })
  @UseGuards(OrganizerJwtAuthGuard)
  async findAll(
    @Param('eventId') eventId: string,
    @Query() pagination: PaginateQueryDto,
  ) {
    const paginate = new Paginate(pagination);
    const [data, count] = await this.certificateService.findAll(
      eventId,
      paginate.params(),
    );

    return paginate.response(data, count);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a certificate' })
  async remove(@Param('id') id: string) {
    const certificate = await this.certificateService.remove(id);
    return {
      message: 'Certificate deleted',
      data: certificate,
    };
  }
}
