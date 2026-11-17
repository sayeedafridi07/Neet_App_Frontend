import type {
  ApiResponse,
  AudioLectureParams,
  AudioLecturesData,
} from "@/types";
import { apiConnector } from "./apiConnector";
import { audioLectureEndpoints } from "./apis";

const { AUDIO_LECTURES_API } = audioLectureEndpoints;

export const getAudioLectures = async (
  params: AudioLectureParams = {},
): Promise<ApiResponse<AudioLecturesData>> => {
  const { data } = await apiConnector({
    method: "GET",
    url: AUDIO_LECTURES_API,
    params: { ...params },
  });

  return data;
};
