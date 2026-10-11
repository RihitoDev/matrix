"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PHOTO_ERROR_MESSAGES,
  PHOTO_ERROR_MESSAGES_BY_STATUS,
} from "../constants/photo-error-messages.constants";
import { profilePhotoService } from "../services/profile-photo.service";
import { getHttpStatus } from "../utils/get-http-status";
import { validatePhotoFile } from "../utils/validate-photo-file";

export function useProfilePhoto() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const photoUrlRef = useRef<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const pendingFileRef = useRef<File | null>(null);
  const mountedRef = useRef(false);
  const busyRef = useRef(false);
  const requestIdRef = useRef(0);

  // Object URLs keep the image in memory until they are revoked.
  function replacePhotoUrl(blob: Blob | null) {
    if (photoUrlRef.current) {
      URL.revokeObjectURL(photoUrlRef.current);
    }
    photoUrlRef.current = blob ? URL.createObjectURL(blob) : null;
    setPhotoUrl(photoUrlRef.current);
  }

  function clearPreview() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = null;
    pendingFileRef.current = null;
    setPreviewUrl(null);
  }

  const reloadPhoto = useCallback(async () => {
    if (!mountedRef.current || busyRef.current) return;
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setLoadError(null);
    try {
      const photo = await profilePhotoService.getPhoto();
      if (mountedRef.current && requestId === requestIdRef.current) {
        replacePhotoUrl(photo);
      }
    } catch {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setLoadError(PHOTO_ERROR_MESSAGES.load);
      }
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void reloadPhoto();

    return () => {
      mountedRef.current = false;
      for (const url of [photoUrlRef.current, previewUrlRef.current]) {
        if (url) URL.revokeObjectURL(url);
      }
      photoUrlRef.current = null;
      previewUrlRef.current = null;
    };
  }, [reloadPhoto]);

  // Shows the chosen file as a preview; nothing is uploaded until confirmPhoto.
  function selectPhoto(file: File) {
    if (busyRef.current) return;
    const validationError = validatePhotoFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    clearPreview();
    pendingFileRef.current = file;
    previewUrlRef.current = URL.createObjectURL(file);
    setPreviewUrl(previewUrlRef.current);
    setError(null);
  }

  function cancelPhoto() {
    if (busyRef.current) return;
    clearPreview();
    setError(null);
  }

  async function runPhotoRequest(
    request: () => Promise<void>,
    onSuccess: () => void,
    fallbackMessage: string,
    setBusy: (value: boolean) => void,
  ): Promise<void> {
    if (!mountedRef.current || busyRef.current) return;
    busyRef.current = true;
    const requestId = ++requestIdRef.current;
    setBusy(true);
    setIsLoading(false);
    setError(null);
    try {
      await request();
      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      onSuccess();
      setLoadError(null);
    } catch (requestError) {
      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      const status = getHttpStatus(requestError);
      setError((status && PHOTO_ERROR_MESSAGES_BY_STATUS[status]) || fallbackMessage);
    } finally {
      busyRef.current = false;
      if (mountedRef.current && requestId === requestIdRef.current) {
        setBusy(false);
      }
    }
  }

  async function confirmPhoto(): Promise<void> {
    const file = pendingFileRef.current;
    if (!file) return;
    await runPhotoRequest(
      () => profilePhotoService.uploadPhoto(file),
      () => {
        replacePhotoUrl(file);
        clearPreview();
      },
      PHOTO_ERROR_MESSAGES.upload,
      setIsUploading,
    );
  }

  async function deletePhoto(): Promise<void> {
    await runPhotoRequest(
      () => profilePhotoService.deletePhoto(),
      () => replacePhotoUrl(null),
      PHOTO_ERROR_MESSAGES.delete,
      setIsDeleting,
    );
  }

  return {
    photoUrl,
    previewUrl,
    isUploading,
    isDeleting,
    isLoading,
    error,
    loadError,
    selectPhoto,
    confirmPhoto,
    cancelPhoto,
    deletePhoto,
    reloadPhoto,
  };
}
