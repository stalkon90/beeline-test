import test, { APIRequestContext, APIResponse } from '@playwright/test';
import { APIClient } from '../api/client';

export class DequeueApiClient implements APIClient {
    constructor(public context: APIRequestContext) {}

    async dequeue(queueName: string, timeout?: number): Promise<APIResponse> {
        const stepName = `Get message from queue with name ${queueName}`;

        return await test.step(stepName, async () => {
            if (timeout) {
                return await this.context.get(`/${queueName}`, { params: { timeout: timeout } });
            } else {
                return await this.context.get(`/${queueName}`);
            }
        });
    }
}
