"use client";

import { useQuery } from "@tanstack/react-query";
import { getMentorDirectory } from "../services/mentor-directory.service";

export function useMentorDirectory() {
  return useQuery({
    queryKey: ["mentorship", "directory"],
    queryFn: ({ signal }) => getMentorDirectory(signal),
  });
}
