import { APIResponse, expect, test } from '@playwright/test';
import { getDefaultAPIContext } from '../framework/api/default-context';
import { EnqueueApiClient } from '../framework/actions/enqueue-api';
import { randomMessage, randomString } from '../framework/utils/test-data-generator';
import { it } from 'node:test';

test.describe('Enque test suite', () => {
    test('Put valid message into queue', async () => {
        const context = await getDefaultAPIContext();
        const enqueueApi = new EnqueueApiClient(context);
        const response = await enqueueApi.enqueue('test', randomMessage());

        expect(response.ok()).toBeTruthy();
    });

    test('Check empty message', async () => {
        const context = await getDefaultAPIContext();
        const enqueueApi = new EnqueueApiClient(context);

        const response = await enqueueApi.enqueue('test', { message: '' });

        expect(response.ok()).toBeTruthy();
    });

    test('Check incorrect body', async () => {
        const context = await getDefaultAPIContext();
        const enqueueApi = new EnqueueApiClient(context);

        const response = await enqueueApi.enqueue('test', 'incorrect body');

        expect(response.status()).toEqual(400);
    });

    test('Check empty body', async () => {
        const context = await getDefaultAPIContext();
        const enqueueApi = new EnqueueApiClient(context);

        const response = await enqueueApi.enqueue('test');

        expect(response.status()).toEqual(400);
    });

    test('Check put into unnamed queue', async () => {
        const context = await getDefaultAPIContext();
        const enqueueApi = new EnqueueApiClient(context);

        const response = await enqueueApi.enqueue('', randomMessage());

        expect(response.status()).toEqual(400);
    });

    test('Check limit messages count into queue', async () => {
        test.skip(process.env.MAX_QUEUE_MESSAGE_COUNT === undefined, 'Max queue message count is undefined in .env');
        const context = await getDefaultAPIContext();
        const enqueueApi = new EnqueueApiClient(context);
        const messageCount = Number(process.env.MAX_QUEUE_MESSAGE_COUNT);

        let responseArr: APIResponse[] = [];
        for (let i = 0; i <= messageCount; i++) {
            responseArr.push(await enqueueApi.enqueue('message-count', randomMessage()));
        }

        expect(responseArr.pop()?.status()).toEqual(400);
    });

    test('Check max queues count', async () => {
        test.skip(process.env.MAX_QUEUE_COUNT === undefined, 'Max queue count is undefined in .env');
        const context = await getDefaultAPIContext();
        const enqueueApi = new EnqueueApiClient(context);
        const queueCount = Number(process.env.MAX_QUEUE_COUNT);

        let responseArr: APIResponse[] = [];
        for (let i = 0; i <= queueCount; i++) {
            responseArr.push(await enqueueApi.enqueue(randomString(5, 10), randomMessage()));
        }

        expect(responseArr.pop()?.status()).toEqual(400);
    });
});
