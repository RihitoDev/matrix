export const PROFILE_FEEDBACK_MESSAGES = {
  loading: "Cargando tu perfil...",
  loadError: "No se pudo cargar tu perfil. Recarga la página para intentarlo de nuevo.",
  citiesLoadError: "No se pudieron cargar las ciudades. Recarga la página para intentarlo de nuevo.",
  personalInfoSaveSuccess: "Tus datos personales se guardaron correctamente.",
  presentationSaveSuccess: "Tu presentación se guardó correctamente.",
  saveError: "No se pudieron guardar tus datos. Inténtalo de nuevo.",
};

export const PROFILE_ERROR_MESSAGES_BY_STATUS: Record<number, string> = {
  400: "Revisa los datos ingresados e inténtalo de nuevo.",
  401: "Tu sesión no es válida. Inicia sesión nuevamente.",
  404: "No encontramos tu perfil o la ciudad elegida. Recarga la página.",
};
