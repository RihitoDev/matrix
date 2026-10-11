"use client";

import { AccessRequestProvider, useAccessRequestForm } from "../contexts/access-request-context";
import { DocumentStep } from "../components/document/document-step";
import { PersonalDataForm } from "../components/personal-data/personal-data-form";
import { PublicHeader } from "../components/request-steps/public-header";
import { ReviewStep } from "../components/request-steps/review-step";
import { RequestStepsSidebar } from "../components/request-steps/request-steps-sidebar";

// Vive dentro del Provider: la barra lateral y el contenido leen el paso actual del Context
function RequestAccessLayout() {
  const { currentStep } = useAccessRequestForm();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <RequestStepsSidebar currentStep={currentStep} />
      <div className="flex flex-1 flex-col">
        <PublicHeader />
        <section className="flex flex-1 flex-col justify-center px-6 py-10 lg:px-16">
          <div className="mx-auto flex w-full max-w-190 justify-center 2xl:max-w-5xl">
            {currentStep === 1 ? <PersonalDataForm /> : currentStep === 2 ? <DocumentStep /> : <ReviewStep />}
          </div>
        </section>
      </div>
    </div>
  );
}

export function RequestAccessView() {
  return (
    <main className="min-h-screen bg-surface-soft">
      <AccessRequestProvider>
        <RequestAccessLayout />
      </AccessRequestProvider>
    </main>
  );
}
