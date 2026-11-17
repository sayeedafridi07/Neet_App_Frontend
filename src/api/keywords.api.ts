import type {
  ApiResponse,
  AudioLectureParams,
  KeywordRevisionsData,
} from "@/types";
import { apiConnector } from "./apiConnector";
import { keywordRevisionEndpoints } from "./apis";

const { KEYWORD_REVISIONS_API } = keywordRevisionEndpoints;

export const getKeywordRevisions = async (
  params: AudioLectureParams = {},
): Promise<ApiResponse<KeywordRevisionsData>> => {
  const { data } = await apiConnector({
    method: "GET",
    url: KEYWORD_REVISIONS_API,
    params: { ...params },
  });

  return data;
};
