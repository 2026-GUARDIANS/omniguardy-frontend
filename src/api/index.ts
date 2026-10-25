import { USE_MOCK } from './config';
import { createHttpApi } from './http';
import type { Api, DevTools } from './interfaces';
import { createMockApi, mockDevTools } from './mock';

export const api: Api = USE_MOCK ? createMockApi() : createHttpApi();

/** mock 모드에서만 값이 있습니다. 개발용 버튼에서 사용 */
export const devTools: DevTools | null = USE_MOCK ? mockDevTools : null;

export { USE_MOCK };
export * from './types';
export type * from './interfaces';
