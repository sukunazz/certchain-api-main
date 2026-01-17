import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { DbService } from '../db/db.service';

@Injectable()
export class AiService {
  model = 'openai/gpt-4o-mini';
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  });
  constructor(private readonly db: DbService) {}

  async generateMesssage(message: string, eventId: string) {
    const event = await this.db.event.findUnique({
      where: {
        id: eventId,
      },
      include: {
        organizer: true,
        faqs: true,
        schedules: true,
      },
    });

    const prompt = `
    You are a helpful assistant that can answer questions about the event.
    Here is the information about the event:
    ${JSON.stringify(event)}
    This is production based environment, so you should answer the question based on the information provided.
        and you should not answer the question if you don't have the information.

        Just answer what is need if possible one liner answer.
        Don't give extra context or information that's not asked in question.

        Here is the question:
    ${message}
    `;
    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content;
  }
}
