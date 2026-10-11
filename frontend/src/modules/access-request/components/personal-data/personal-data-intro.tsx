export function PersonalDataIntro() {
  return (
    <>
  <div className="flex flex-col gap-2">
    <h1 className="text-3xl font-extrabold tracking-tight text-ink 2xl:text-4xl">
      Solicita tu acceso a la comunidad
    </h1>
    <p className="max-w-155 text-[15px] text-text-secondary 2xl:text-lg">
      La carrera verifica cada solicitud con tu documento académico. Así la comunidad reúne
      solo a titulados reales de Ingeniería de Sistemas e Informática.
    </p>
  </div>

  <p className="text-[12.5px] text-text-secondary 2xl:text-base">
    <span aria-hidden="true" className="text-accent">
      *
    </span>{" "}
    Campo obligatorio
  </p>
    </>
  );
}
