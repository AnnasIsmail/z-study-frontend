import api from './api';
import { StreamRequest, FileProcessRequest } from "../types";

export const getModels = async () => {
  try {
    const response = await api.get("/llm/models");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch models");
  }
};

export const chatCompletionStream = async (
  request: StreamRequest
): Promise<ReadableStream<Uint8Array>> => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${api.defaults.baseURL}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Stream failed" }));
    throw new Error(error.message);
  }

  return response.body!;
};

export const processFileStream = async (
  request: FileProcessRequest
): Promise<ReadableStream<Uint8Array>> => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${api.defaults.baseURL}/llm/process-file/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "File processing failed" }));
    throw new Error(error.message);
  }

  return response.body!;
};

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post("/llm/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "File upload failed");
  }
};