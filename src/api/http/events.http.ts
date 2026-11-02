import type { EventApi } from '../interfaces';
import { ApiError, request, requestData } from './client';
import type { HomeSummaryDto, SecurityEventDto, SecurityEventPageDto, VideoUrlDto } from './dto';
import { toHomeSummary, toSecurityEvent } from './mappers';

/** 목록은 최근 20개만 불러온다(무한 스크롤은 추후). 서버 기본값도 20, 최대 100 */
export const EVENT_PAGE_SIZE = 20;

export const httpEventApi: EventApi = {
  // GET /api/security-events?page&size[&riskLevel] — 최신순. 위험도 필터는 서버가 페이지를 나누기 전에 거른다
  async list(filter) {
    const risk = filter?.risk ? `&riskLevel=${filter.risk}` : '';
    const page = await request<SecurityEventPageDto>(`/api/security-events?page=0&size=${EVENT_PAGE_SIZE}${risk}`);
    return page.content.map(toSecurityEvent);
  },

  // GET /api/home/summary
  async getHomeSummary() {
    return toHomeSummary(await requestData<HomeSummaryDto>('/api/home/summary'));
  },

  // GET /api/security-events/{eventId}
  async get(id) {
    return toSecurityEvent(await request<SecurityEventDto>(`/api/security-events/${encodeURIComponent(id)}`));
  },

  // GET /api/security-events/{eventId}/video-url — 5분 유효 S3 주소. 영상이 없으면(404) null
  async getVideoUrl(id) {
    try {
      const res = await request<VideoUrlDto>(`/api/security-events/${encodeURIComponent(id)}/video-url`);
      return res?.url ?? null;
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },

  // 서버 명세 없음: 확인 처리를 저장하는 API가 없어 요청하지 않는다(화면 상태만 정리)
  async acknowledge() {},
};
