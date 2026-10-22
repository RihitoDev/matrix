"use client";

import { FeedbackMessage } from "../components/feedback-message";
import { PresentationForm } from "../components/presentation-form";
import { ProfilePageLayout } from "../components/profile-page-layout";
import { ProfilePhotoFeedback } from "../components/profile-photo-feedback";
import { PROFILE_FEEDBACK_MESSAGES } from "../constants/profile-feedback.constants";
import { useProfile } from "../hooks/use-profile";
import { useProfilePhoto } from "../hooks/use-profile-photo";
import { useSaveProfile } from "../hooks/use-save-profile";
import { getFullName } from "../utils/get-full-name";
import { toPresentationValues } from "../utils/to-presentation-values";

export function PresentationView() {
  const { profile, isLoading, error: loadError, setProfile } = useProfile();
  const { savePresentation, isSaving, feedback, fieldErrors, clearFeedback } = useSaveProfile(setProfile);
  const { photoUrl, isLoading: isPhotoLoading, loadError: photoLoadError, reloadPhoto } = useProfilePhoto();

  return (
    <ProfilePageLayout
      title="Presentación profesional"
      description="Cuenta qué haces y qué buscas."
    >
      {isLoading ? (
        <p role="status" className="text-[15px] text-text-secondary">
          {PROFILE_FEEDBACK_MESSAGES.loading}
        </p>
      ) : null}

      {!isLoading && !profile ? (
        <FeedbackMessage
          feedback={{ type: "error", message: loadError ?? PROFILE_FEEDBACK_MESSAGES.loadError }}
        />
      ) : null}

      {profile ? (
        <>
          <FeedbackMessage feedback={feedback} />
          <ProfilePhotoFeedback
            error={photoLoadError}
            isLoading={isPhotoLoading}
            onRetry={() => void reloadPhoto()}
          />
          <PresentationForm
            initialValues={toPresentationValues(profile)}
            fullName={getFullName(profile)}
            photoUrl={photoUrl}
            isSaving={isSaving}
            serverErrors={fieldErrors}
            onEdit={clearFeedback}
            onSubmit={(values) => void savePresentation(values)}
          />
        </>
      ) : null}
    </ProfilePageLayout>
  );
}
