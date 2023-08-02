import test, { APIRequestContext, APIResponse } from '@playwright/test';
import { APIClient } from '../api/client';
import { Message } from '../api/types';

export class EnqueueApiClient implements APIClient {
    constructor(public context: APIRequestContext) {}

    async enqueue(queueName: string, data?: Message | string): Promise<APIResponse> {
        const stepName = `Put message into queue with name ${queueName}`;

        return await test.step(stepName, async () => {
            return await this.context.put(`/${queueName}`, { data });
        });
    }
}
