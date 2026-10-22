"use client";

import { ProfileSectionLinks } from "../components/profile-section-links";
import { ContactInfoCard } from "../components/contact-info-card";
import { FeedbackMessage } from "../components/feedback-message";
import { PresentationSummaryCard } from "../components/presentation-summary-card";
import { ProfileCompletionBanner } from "../components/profile-completion-banner";
import { ProfilePageLayout } from "../components/profile-page-layout";
import { ProfilePhotoFeedback } from "../components/profile-photo-feedback";
import { PROFILE_FEEDBACK_MESSAGES } from "../constants/profile-feedback.constants";
import { useProfile } from "../hooks/use-profile";
import { useProfilePhoto } from "../hooks/use-profile-photo";
import { isProfileComplete } from "../utils/is-profile-complete";
import { toProfileSummary } from "../utils/to-profile-summary";

export function ProfileOverviewView() {
  const { profile, isLoading, error: loadError } = useProfile();
  const { photoUrl, isLoading: isPhotoLoading, loadError: photoLoadError, reloadPhoto } = useProfilePhoto();
  const summary = profile ? toProfileSummary(profile) : null;

  return (
    <ProfilePageLayout
      title="Mi perfil"
      description="Tu información y trayectoria profesional, en un solo lugar."
    >
      {isLoading ? (
        <p role="status" className="text-[15px] text-text-secondary">
          {PROFILE_FEEDBACK_MESSAGES.loading}
        </p>
      ) : null}

      {!isLoading && !summary ? (
        <FeedbackMessage
          feedback={{ type: "error", message: loadError ?? PROFILE_FEEDBACK_MESSAGES.loadError }}
        />
      ) : null}

      {summary ? (
        <div className="flex flex-col gap-6">
          <ProfilePhotoFeedback error={photoLoadError} isLoading={isPhotoLoading} onRetry={() => void reloadPhoto()} />
          {isProfileComplete(summary) ? null : <ProfileCompletionBanner hasContactInfo={[summary.fullName, summary.city, summary.phone, summary.personalEmail].every((value) => value.trim().length > 0)} />}
          <ContactInfoCard profile={summary} photoUrl={photoUrl} />
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <PresentationSummaryCard profile={summary} />
            <ProfileSectionLinks />
          </div>
        </div>
      ) : null}
    </ProfilePageLayout>
  );
}
