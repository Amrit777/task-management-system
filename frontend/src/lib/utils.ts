import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from "axios"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Extract a human-readable message from an unknown error (typically an Axios error).
export function getApiErrorMessage(
  err: unknown,
  fallback = "Something went wrong"
): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || fallback
  }
  return fallback
}
