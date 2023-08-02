import { APIResponse, expect, test } from '@playwright/test';
import { getDefaultAPIContext } from '../framework/api/default-context';
import { EnqueueApiClient } from '../framework/actions/enqueue-api';
import { DequeueApiClient } from '../framework/actions/dequeue-api';
import { randomMessage, randomString } from '../framework/utils/test-data-generator';

test.describe('Dequeue test suite', () => {
    test('Get message from queue', async () => {
        const context = await getDefaultAPIContext();
        const enqueApi = new EnqueueApiClient(context);
        const dequeueApi = new DequeueApiClient(context);
        const message = randomMessage();

        await enqueApi.enqueue('test', message);
        const response = await dequeueApi.dequeue('test');

        const dequeuedMessage = JSON.parse(await response.json());

        expect(dequeuedMessage).toEqual(message);
    });

    test('Check order in queue', async () => {
        const context = await getDefaultAPIContext();
        const enqueApi = new EnqueueApiClient(context);
        const dequeueApi = new DequeueApiClient(context);
        const messageFirst = randomMessage();
        const messageSecond = randomMessage();

        await enqueApi.enqueue('order', messageFirst);
        await enqueApi.enqueue('order', messageSecond);

        const responseFirst = await dequeueApi.dequeue('order');
        const responseSecond = await dequeueApi.dequeue('order');

        const dequeuedMessageFirst = JSON.parse(await responseFirst.json());
        const dequeuedMessageSecond = JSON.parse(await responseSecond.json());

        expect(dequeuedMessageFirst).toEqual(messageFirst);
        expect(dequeuedMessageSecond).toEqual(messageSecond);
    });

    test('Check positive timeout', async () => {
        const context = await getDefaultAPIContext();
        const enqueApi = new EnqueueApiClient(context);
        const dequeueApi = new DequeueApiClient(context);
        const message = randomMessage();
        const dequeueResponsePromise = dequeueApi.dequeue('timeout', 5);
        await enqueApi.enqueue('timeout', message);

        const dequeueResponse = await dequeueResponsePromise;
        const dequeuedMessage = JSON.parse(await dequeueResponse.json());

        expect(dequeuedMessage).toEqual(message);
    });

    test('Check negative timeout', async () => {
        const context = await getDefaultAPIContext();
        const dequeueApi = new DequeueApiClient(context);

        const dequeueResponse = await dequeueApi.dequeue('negative-timeout', 5);

        expect(dequeueResponse.status()).toEqual(404);
    });

    test('Check concurrent request from queue', async () => {
        const contextFirst = await getDefaultAPIContext();
        const contextSecond = await getDefaultAPIContext();
        
        const enqueApiFirst = new EnqueueApiClient(contextFirst);
        const enqueApiSecond = new EnqueueApiClient(contextSecond);

        const dequeueApiFirst = new DequeueApiClient(contextFirst);
        const dequeueApiSecond = new DequeueApiClient(contextSecond);

        const messageFirst = randomMessage();
        const messageSecond = randomMessage();

        const dequeueResponsePromiseFirst = dequeueApiFirst.dequeue('concurrent', 10);
        const dequeueResponsePromiseSecond = dequeueApiSecond.dequeue('concurrent', 5);

        await enqueApiFirst.enqueue('concurrent', messageFirst);
        await enqueApiSecond.enqueue('concurrent', messageSecond);

        const concurrentResponse = await Promise.race([dequeueResponsePromiseFirst, dequeueResponsePromiseSecond]);

        const dequeueMessage = JSON.parse(await concurrentResponse.json());

        expect(dequeueMessage).toEqual(messageFirst);
    });

    test('Get message from non-exists queue', async () => {
        const context = await getDefaultAPIContext();
        const dequeueApi = new DequeueApiClient(context);

        const dequeueResponse = await dequeueApi.dequeue('non-exists');

        expect(dequeueResponse.status()).toEqual(404);
    });
});
