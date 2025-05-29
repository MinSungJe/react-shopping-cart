import '@testing-library/jest-dom';
import {initFetchedData, fetchedData} from './test/mocks'

beforeEach(() => {
  initFetchedData(); // 테스트 간 상태 초기화

  globalThis.fetch = jest.fn().mockImplementation(async (url, options) => {
    const method = options?.method || 'GET';

    // GET: /cart-items
    if (url.includes('/cart-items') && method === 'GET') {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fetchedData),
      });
    }

    // DELETE: /cart-items/:id
    if (url.match(/\/cart-items\/\d+$/) && method === 'DELETE') {
      const id = Number(url.split('/').pop());
      fetchedData.content = fetchedData.content.filter((item) => item.id !== id);

      return Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ ok: true }),
      });
    }

    // PATCH: /cart-items/:id
    if (url.match(/\/cart-items\/\d+$/) && method === 'PATCH') {
      const id = Number(url.split('/').pop());
      const body = JSON.parse(options?.body as string);
      const { quantity } = body as { quantity: number };
      const cartIndex = fetchedData.content.findIndex((item) => item.id === id);

      if (!id || quantity < 1) {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: 'Invalid data' }),
        });
      }
      const cartItem = fetchedData.content[cartIndex];
      fetchedData.content[cartIndex] = {
        ...cartItem,
        quantity
      };

      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ ok: true }),
      });
    }

    // Unhandled
    return Promise.reject(new Error(`Unhandled fetch: ${url} ${method}`));
  });
});