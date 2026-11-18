import React, { useState, useEffect } from 'react';
import {
  EventItem,
  FacebookPostItem,
  FacultyOption,
  NewsItem,
  ReelItem,
  RegulationDoc,
  RegistrationPayload,
  UAGRM_FACULTIES,
  TIKTOK_REELS,
  OFFICIAL_LOGOS,
  OFFICIAL_WHATSAPP_NUMBER,
} from '../data/portalData';
import {
  buildDynamicWhatsAppUrl,
  db,
  doc,
  handleFirestoreError,
  OperationType,
  setDoc,
} from '../firebase';

interface EventModalProps {
  event: EventItem | null;
  onClose: () => void;
  faculties?: FacultyOption[];
  whatsappNumber?: string;
}

export const EventRegistrationModal: React.FC<EventModalProps> = ({
  event,
  onClose,
  faculties = UAGRM_FACULTIES,
  whatsappNumber = OFFICIAL_WHATSAPP_NUMBER,
}) => {
  const activeFaculties = faculties.length > 0 ? faculties : UAGRM_FACULTIES;
  const [activeTab, setActiveTab] = useState<'bases' | 'inscripcion'>('inscripcion');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [selectedFacultyId, setSelectedFacultyId] = useState(activeFaculties[0].id);
  const [career, setCareer] = useState(activeFaculties[0].careers[0] || '');
  const [whatsapp, setWhatsapp] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [receipt, setReceipt] = useState<RegistrationPayload | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setActiveTab('inscripcion');
      setFullName('');
      setStudentId('');
      setSelectedFacultyId(activeFaculties[0].id);
      setCareer(activeFaculties[0].careers[0] || '');
      setWhatsapp('');
      setErrors({});
      setReceipt(null);
      setCopiedCode(false);
      setSubmitting(false);
    }
  }, [event, activeFaculties]);

  if (!event) return null;

  const currentFaculty =
    activeFaculties.find((f) => f.id === selectedFacultyId) || activeFaculties[0];

  const handleFacultyChange = (facId: string) => {
    setSelectedFacultyId(facId);
    const found = activeFaculties.find((f) => f.id === facId);
    if (found && found.careers.length > 0) {
      setCareer(found.careers[0]);
    }
  };

  const validateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const trimmedName = fullName.trim();
    if (trimmedName.length < 5 || !trimmedName.includes(' ')) {
      newErrors.fullName = 'Ingresa tu nombre y apellidos completos.';
    }

    const cleanRegistro = studentId.trim();
    if (!/^\d{8,9}$/.test(cleanRegistro)) {
      newErrors.studentId =
        'El Registro Universitario UAGRM debe contener exactamente 8 o 9 dígitos numéricos.';
    }

    if (!selectedFacultyId) {
      newErrors.faculty = 'Selecciona tu facultad.';
    }

    if (!career.trim()) {
      newErrors.career = 'Selecciona o ingresa tu carrera.';
    }

    const cleanPhone = whatsapp.replace(/\D/g, '');
    if (!/^[67]\d{7}$/.test(cleanPhone) && cleanPhone.length < 8) {
      newErrors.whatsapp =
        'Ingresa un número válido de WhatsApp de 8 dígitos (ej. 70012345).';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const regTail = cleanRegistro.slice(-3);
    const code = `FUL-2026-${regTail}${randomSuffix}`;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const docId = `ins_${Date.now()}_${randomSuffix}`;
    setSubmitting(true);
    try {
      await setDoc(doc(db, 'inscritos', docId), {
        codigoConfirmacion: code,
        eventoId: event.id,
        eventoTitulo: event.title,
        nombre: trimmedName,
        registroUniversitario: cleanRegistro,
        facultad: currentFaculty.name,
        carrera: career,
        whatsapp: cleanPhone,
        fechaRegistro: formattedDate,
      });
    } catch (err) {
      setSubmitting(false);
      handleFirestoreError(err, OperationType.CREATE, `inscritos/${docId}`);
    }
    setSubmitting(false);

    setReceipt({
      confirmationCode: code,
      eventId: event.id,
      eventTitle: event.title,
      eventCategory: event.category,
      fullName: trimmedName,
      studentId: cleanRegistro,
      faculty: currentFaculty.name,
      career,
      whatsapp: cleanPhone,
      submittedAt: formattedDate,
    });
  };

  const handleCopyCode = () => {
    if (!receipt) return;
    navigator.clipboard?.writeText(receipt.confirmationCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const categoryColorClass =
    event.categoryColor === 'accent'
      ? 'bg-accent text-on-accent'
      : event.categoryColor === 'primary'
      ? 'bg-primary text-on-primary'
      : 'bg-secondary text-on-secondary';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-convocatoria-title"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-light-outline/40 overflow-hidden my-auto animate-surface-enter max-h-[92vh] flex flex-col">
        {/* Cabecera del Modal */}
        <div className="bg-primary text-white p-5 sm:p-6 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`${categoryColorClass} px-3 py-0.5 rounded-full text-xs font-headline font-bold uppercase tracking-wider`}
              >
                {event.category}
              </span>
              <span className="bg-white/10 text-white/90 px-2.5 py-0.5 rounded-md font-mono text-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-accent">
                  {event.badgeIcon}
                </span>
                <span>{event.badgeText}</span>
              </span>
            </div>
            <h3
              id="modal-convocatoria-title"
              className="font-headline text-title-lg sm:text-headline-sm text-white font-bold leading-snug"
            >
              {event.title}
            </h3>
            <p className="font-body text-xs text-white/80 mt-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-secondary">
                calendar_today
              </span>
              <span>{event.dateLabel}</span>
              <span>·</span>
              <span>{event.location}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer shrink-0"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Selector de Pestañas del Modal */}
        {!receipt && (
          <div className="bg-light-surface-container px-5 sm:px-6 pt-3 border-b border-light-outline/50 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('inscripcion')}
              className={`px-4 py-2.5 font-headline text-xs sm:text-label-md font-bold rounded-t-xl border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'inscripcion'
                  ? 'bg-white text-secondary border-secondary shadow-2xs'
                  : 'text-primary/70 border-transparent hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              <span>Formulario de Inscripción</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bases')}
              className={`px-4 py-2.5 font-headline text-xs sm:text-label-md font-bold rounded-t-xl border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'bases'
                  ? 'bg-white text-secondary border-secondary shadow-2xs'
                  : 'text-primary/70 border-transparent hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">description</span>
              <span>Bases y Requisitos de Convocatoria</span>
            </button>
          </div>
        )}

        {/* Cuerpo Desplazable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {receipt ? (
            /* COMPROBANTE DE INSCRIPCIÓN CON CÓDIGO ÚNICO */
            <div className="space-y-5 animate-surface-enter">
              <div className="p-5 rounded-2xl bg-accent/10 border border-accent/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center shrink-0 shadow">
                    <span className="material-symbols-outlined text-[28px]">verified</span>
                  </div>
                  <div>
                    <span className="text-xs font-headline uppercase font-bold text-accent tracking-wider">
                      Inscripción Registrada Exitosamente
                    </span>
                    <h4 className="font-headline text-title-md text-primary font-bold">
                      Comprobante Oficial de Acreditación FUL
                    </h4>
                    <p className="text-xs text-light-on-surface-container">
                      Emitido el {receipt.submittedAt}
                    </p>
                  </div>
                </div>

                <div className="bg-white px-4 py-2.5 rounded-xl border border-accent/40 text-center shrink-0 shadow-2xs">
                  <span className="block text-[10px] font-headline uppercase text-light-on-surface-container/70 font-semibold">
                    Código Único de Confirmación
                  </span>
                  <div className="flex items-center justify-center gap-2 mt-0.5">
                    <span className="font-mono text-base font-bold text-primary tracking-wider">
                      {receipt.confirmationCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="text-secondary hover:text-primary transition-colors cursor-pointer"
                      title="Copiar código"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {copiedCode ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-light-surface-container rounded-xl p-4 sm:p-5 border border-light-outline/50 space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between border-b border-light-outline/40 pb-2.5">
                  <span className="text-light-on-surface-container font-medium">Convocatoria:</span>
                  <span className="font-headline font-bold text-primary text-right">
                    {receipt.eventTitle}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-light-outline/40 pb-2.5">
                  <span className="text-light-on-surface-container font-medium">
                    Estudiante Postulante:
                  </span>
                  <span className="font-bold text-primary text-right">{receipt.fullName}</span>
                </div>
                <div className="flex items-center justify-between border-b border-light-outline/40 pb-2.5">
                  <span className="text-light-on-surface-container font-medium">
                    Registro Universitario UAGRM:
                  </span>
                  <span className="font-mono font-bold text-secondary">{receipt.studentId}</span>
                </div>
                <div className="flex items-center justify-between border-b border-light-outline/40 pb-2.5 gap-4">
                  <span className="text-light-on-surface-container font-medium shrink-0">
                    Facultad:
                  </span>
                  <span className="font-medium text-primary text-right">{receipt.faculty}</span>
                </div>
                <div className="flex items-center justify-between border-b border-light-outline/40 pb-2.5">
                  <span className="text-light-on-surface-container font-medium">Carrera:</span>
                  <span className="font-semibold text-primary text-right">{receipt.career}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-light-on-surface-container font-medium">
                    WhatsApp de Contacto:
                  </span>
                  <span className="font-mono font-medium text-primary">+591 {receipt.whatsapp}</span>
                </div>
              </div>

              <p className="text-xs text-light-on-surface-container leading-relaxed bg-primary/5 p-3.5 rounded-xl border border-primary/15">
                Presenta este código único <strong>{receipt.confirmationCode}</strong> junto con tu Cédula de Identidad o Boleta de Inscripción en las oficinas de la FUL UAGRM o envíalo directamente por WhatsApp para recibir el cronograma oficial de tu facultad.
              </p>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full border border-light-outline text-primary font-headline text-label-md font-semibold hover:bg-light-surface-container transition-colors cursor-pointer"
                >
                  Finalizar y Cerrar
                </button>
                <a
                  href={buildDynamicWhatsAppUrl(
                    whatsappNumber,
                    `Hola FUL UAGRM, completé mi inscripción a "${receipt.eventTitle}". Mi código de confirmación es ${receipt.confirmationCode} (Nombre: ${receipt.fullName} - Reg: ${receipt.studentId} - Carrera: ${receipt.career}).`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-full bg-accent text-on-accent font-headline text-label-md font-bold hover:bg-accent/90 transition-colors flex items-center gap-2 shadow cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <span>Enviar Comprobante por WhatsApp</span>
                </a>
              </div>
            </div>
          ) : activeTab === 'bases' ? (
            /* PESTAÑA DE BASES COMPLETAS */
            <div className="space-y-4 font-body text-body-md text-light-on-surface-container">
              <div className="p-4 rounded-xl bg-light-surface-container border border-light-outline/40 space-y-2">
                <div className="text-xs font-headline font-bold uppercase text-secondary tracking-wider">
                  Resumen Oficial de la Convocatoria
                </div>
                <p className="text-sm leading-relaxed text-primary">{event.basesSummary}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-light-outline/40">
                    <span className="font-bold text-primary block">Unidad Organizadora:</span>
                    <span>{event.organizer}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-light-outline/40">
                    <span className="font-bold text-primary block">Cupos Habilitados:</span>
                    <span>{event.quota}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-light-outline/50 bg-white space-y-2.5">
                  <h4 className="font-headline text-sm font-bold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[18px]">
                      task_alt
                    </span>
                    <span>Requisitos de Participación</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-light-on-surface-container">
                    {event.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-secondary text-[15px] shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-light-outline/50 bg-white space-y-2.5">
                  <h4 className="font-headline text-sm font-bold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-accent text-[18px]">
                      workspace_premium
                    </span>
                    <span>Beneficios y Certificación</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-light-on-surface-container">
                    {event.benefits.map((ben, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-accent text-[15px] shrink-0 mt-0.5">
                          verified
                        </span>
                        <span>{ben}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full border border-light-outline text-primary font-headline text-label-md hover:bg-light-surface-container transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('inscripcion')}
                  className="px-6 py-2.5 rounded-full bg-secondary text-on-secondary font-headline text-label-md font-bold hover:bg-secondary/90 transition-colors flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <span>Ir al Formulario de Inscripción</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ) : (
            /* PESTAÑA DE FORMULARIO DE INSCRIPCIÓN ESTUDIANTIL */
            <form onSubmit={validateAndSubmit} className="space-y-4" noValidate>
              <div className="p-3.5 rounded-xl bg-light-surface-container border border-light-outline/40 text-xs text-light-on-surface-container flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                  info
                </span>
                <span>
                  Completa tus datos universitarios reales para generar tu{' '}
                  <strong className="text-primary">Código Único de Acreditación FUL 2026–2028</strong>.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre Completo */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="reg-fullname"
                    className="block font-headline text-xs font-bold text-primary mb-1"
                  >
                    Nombre Completo (Nombres y Apellidos) *
                  </label>
                  <input
                    id="reg-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Carlos Andrés Ribera Justiniano"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-body focus:outline-none focus:ring-2 ${
                      errors.fullName
                        ? 'border-secondary focus:ring-secondary/30'
                        : 'border-light-outline focus:ring-primary/20 focus:border-primary'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-secondary font-medium mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Registro Universitario */}
                <div>
                  <label
                    htmlFor="reg-studentid"
                    className="block font-headline text-xs font-bold text-primary mb-1"
                  >
                    Registro Universitario (8 a 9 dígitos) *
                  </label>
                  <input
                    id="reg-studentid"
                    type="text"
                    inputMode="numeric"
                    maxLength={9}
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ej. 221045892"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 ${
                      errors.studentId
                        ? 'border-secondary focus:ring-secondary/30'
                        : 'border-light-outline focus:ring-primary/20 focus:border-primary'
                    }`}
                  />
                  {errors.studentId && (
                    <p className="text-xs text-secondary font-medium mt-1">{errors.studentId}</p>
                  )}
                </div>

                {/* WhatsApp */}
                <div>
                  <label
                    htmlFor="reg-whatsapp"
                    className="block font-headline text-xs font-bold text-primary mb-1"
                  >
                    Celular / WhatsApp (Bolivia) *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-light-outline bg-light-surface-container text-xs font-mono text-primary font-semibold">
                      +591
                    </span>
                    <input
                      id="reg-whatsapp"
                      type="tel"
                      inputMode="numeric"
                      maxLength={8}
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                      placeholder="70012345"
                      className={`w-full px-3.5 py-2.5 rounded-r-xl border text-sm font-mono focus:outline-none focus:ring-2 ${
                        errors.whatsapp
                          ? 'border-secondary focus:ring-secondary/30'
                          : 'border-light-outline focus:ring-primary/20 focus:border-primary'
                      }`}
                    />
                  </div>
                  {errors.whatsapp && (
                    <p className="text-xs text-secondary font-medium mt-1">{errors.whatsapp}</p>
                  )}
                </div>

                {/* Facultad */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="reg-faculty"
                    className="block font-headline text-xs font-bold text-primary mb-1"
                  >
                    Facultad UAGRM *
                  </label>
                  <select
                    id="reg-faculty"
                    value={selectedFacultyId}
                    onChange={(e) => handleFacultyChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-light-outline text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {activeFaculties.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Carrera */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="reg-career"
                    className="block font-headline text-xs font-bold text-primary mb-1"
                  >
                    Carrera *
                  </label>
                  <select
                    id="reg-career"
                    value={career}
                    onChange={(e) => setCareer(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-light-outline text-sm font-body bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {currentFaculty.careers.map((car) => (
                      <option key={car} value={car}>
                        {car}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-light-outline/40">
                <a
                  href={buildDynamicWhatsAppUrl(
                    whatsappNumber,
                    `Hola FUL UAGRM, deseo consultar sobre la convocatoria: ${event.title}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-headline font-semibold text-accent hover:underline inline-flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  <span>Consultar dudas por WhatsApp</span>
                </a>

                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-full border border-light-outline text-primary font-headline text-label-md hover:bg-light-surface-container transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-full bg-secondary text-on-secondary font-headline text-label-md font-bold hover:bg-secondary/90 disabled:opacity-60 transition-colors flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>
                      {submitting ? 'Registrando...' : 'Confirmar Inscripción'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

interface NewsModalProps {
  news: NewsItem | null;
  onClose: () => void;
  whatsappNumber?: string;
}

export const NewsReaderModal: React.FC<NewsModalProps> = ({
  news,
  onClose,
  whatsappNumber = OFFICIAL_WHATSAPP_NUMBER,
}) => {
  if (!news) return null;

  const badgeClass =
    news.categoryBg === 'accent'
      ? 'bg-accent text-on-accent'
      : news.categoryBg === 'primary'
      ? 'bg-primary text-on-primary'
      : 'bg-secondary text-on-secondary';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-news-title"
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-light-outline/40 overflow-hidden my-auto animate-surface-enter max-h-[92vh] flex flex-col">
        {/* Imagen de Portada */}
        <div className="relative h-56 sm:h-72 bg-primary shrink-0">
          <img
            src={news.image}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-secondary flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar lector de noticia"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>

          <div className="absolute bottom-4 left-5 right-5 text-white">
            <span
              className={`${badgeClass} px-3 py-1 rounded-full font-headline text-label-sm font-bold uppercase tracking-wider shadow inline-block mb-2`}
            >
              {news.category}
            </span>
            <h3
              id="modal-news-title"
              className="font-headline text-title-lg sm:text-headline-md font-bold text-white leading-tight"
            >
              {news.title}
            </h3>
          </div>
        </div>

        {/* Contenido Editorial */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-5 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-light-outline/50 text-xs text-light-on-surface-container">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[16px]">
                calendar_today
              </span>
              <span className="font-medium">{news.date}</span>
              <span>·</span>
              <span>{news.readTime}</span>
            </div>
            <div className="font-headline font-semibold text-primary">
              Por: {news.author}
            </div>
          </div>

          <div className="space-y-4 font-body text-body-lg text-light-on-surface leading-relaxed">
            {news.fullContent.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Indicadores de Impacto */}
          <div className="p-5 rounded-2xl bg-light-surface-container border border-light-outline/50 space-y-3">
            <h4 className="font-headline text-sm font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-accent text-[20px]">
                verified
              </span>
              <span>Resultados e Impacto Directo en la Comunidad Moreniana</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-light-on-surface-container">
              {news.keyImpacts.map((impact, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <span>{impact}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-light-outline/40">
            <a
              href={buildDynamicWhatsAppUrl(
                whatsappNumber,
                `Hola FUL UAGRM, leí la nota "${news.title}" y me gustaría participar o recibir más información.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-on-accent font-headline text-label-md font-bold hover:bg-accent/90 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>Consultar sobre esta Iniciativa</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-headline text-label-md font-bold hover:bg-secondary transition-colors cursor-pointer"
            >
              Cerrar Nota
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ReelModalProps {
  reel: ReelItem | null;
  onClose: () => void;
  onSelectReel: (reel: ReelItem) => void;
  allReels?: ReelItem[];
}

export const ReelPlayerModal: React.FC<ReelModalProps> = ({
  reel,
  onClose,
  onSelectReel,
  allReels = TIKTOK_REELS,
}) => {
  const reelsSource = allReels.length > 0 ? allReels : TIKTOK_REELS;
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    setIsPlaying(true);
    setIsLiked(false);
    setProgress(15);
  }, [reel]);

  useEffect(() => {
    if (!reel || !isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 300);
    return () => clearInterval(interval);
  }, [reel, isPlaying]);

  if (!reel) return null;

  const currentIndex = Math.max(0, reelsSource.findIndex((r) => r.id === reel.id));
  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + reelsSource.length) % reelsSource.length;
    onSelectReel(reelsSource[prevIdx]);
  };
  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % reelsSource.length;
    onSelectReel(reelsSource[nextIdx]);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Reproductor TikTok FUL: ${reel.title}`}
    >
      <div className="bg-dark-surface text-white rounded-2xl max-w-3xl w-full shadow-2xl border border-white/15 overflow-hidden my-auto animate-surface-enter grid grid-cols-1 md:grid-cols-12 max-h-[92vh]">
        {/* Columna Izquierda: Visor Vertical 9:16 */}
        <div className="md:col-span-6 relative bg-black aspect-[9/16] max-h-[75vh] md:max-h-[85vh] w-full mx-auto overflow-hidden flex flex-col justify-between select-none">
          <img
            src={reel.image}
            alt={reel.title}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${
              isPlaying ? 'scale-105' : 'scale-100 opacity-80'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/50"></div>

          {/* Barra Superior del Reel */}
          <div className="relative z-10 p-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-xs px-3 py-1 rounded-full">
              <img
                src={OFFICIAL_LOGOS.ful}
                alt="FUL"
                className="w-5 h-5 rounded-full object-contain bg-white"
              />
              <span className="font-headline font-bold">@ful.uagrm</span>
              <span className="w-2 h-2 rounded-full bg-accent"></span>
            </div>

            <span className="bg-secondary px-2.5 py-0.5 rounded font-headline text-[11px] font-bold uppercase">
              {reel.category}
            </span>
          </div>

          {/* Botón Play/Pause Central */}
          <div className="relative z-10 flex items-center justify-center my-auto">
            <button
              type="button"
              onClick={() => setIsPlaying((prev) => !prev)}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-black/30 hover:bg-black/60 text-white/90'
                  : 'bg-secondary text-white scale-110 shadow-xl'
              }`}
              aria-label={isPlaying ? 'Pausar reel' : 'Reproducir reel'}
            >
              <span className="material-symbols-outlined text-[36px]">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
          </div>

          {/* Controles Laterales e Info Inferior dentro del Visor */}
          <div className="relative z-10 p-4 space-y-3">
            <div className="flex items-end justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-accent font-semibold block">
                  {reel.publishedAt} · {reel.duration}
                </span>
                <h4 className="font-headline text-sm font-bold text-white leading-snug">
                  {reel.caption}
                </h4>
              </div>

              <div className="flex flex-col items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsLiked((prev) => !prev)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                    isLiked ? 'bg-secondary text-white' : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                  aria-label="Me gusta"
                >
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                </button>
                <span className="text-[11px] font-mono">{reel.likes}</span>
              </div>
            </div>

            {/* Barra de Progreso */}
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-secondary transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Detalles y Controles */}
        <div className="md:col-span-6 p-5 sm:p-6 flex flex-col justify-between bg-white text-light-on-surface">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-light-outline/50 pb-3">
              <div>
                <span className="text-xs font-headline uppercase font-bold text-secondary">
                  Red Oficial TikTok FUL
                </span>
                <h3 className="font-headline text-title-lg text-primary font-bold">
                  {reel.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-light-on-surface-container hover:bg-light-surface-container hover:text-secondary transition-colors cursor-pointer"
                aria-label="Cerrar reproductor"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            {/* Estadísticas del Reel */}
            <div className="grid grid-cols-3 gap-2 bg-light-surface-container p-3 rounded-xl border border-light-outline/40 text-center">
              <div>
                <div className="font-mono text-sm font-bold text-primary">{reel.views}</div>
                <div className="text-[11px] text-light-on-surface-container">Reproducciones</div>
              </div>
              <div>
                <div className="font-mono text-sm font-bold text-secondary">{reel.likes}</div>
                <div className="text-[11px] text-light-on-surface-container">Me gusta</div>
              </div>
              <div>
                <div className="font-mono text-sm font-bold text-accent">{reel.comments}</div>
                <div className="text-[11px] text-light-on-surface-container">Comentarios</div>
              </div>
            </div>

            {/* Puntos Destacados del Video */}
            <div className="space-y-2">
              <h4 className="font-headline text-xs font-bold uppercase text-primary tracking-wider">
                Puntos Clave de esta Publicación:
              </h4>
              <ul className="space-y-2 text-xs text-light-on-surface-container">
                {reel.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-light-outline/40 mt-4">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="flex-1 py-2 px-3 rounded-xl border border-light-outline text-primary font-headline text-xs font-bold hover:bg-light-surface-container flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">skip_previous</span>
                <span>Reel Anterior</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-2 px-3 rounded-xl border border-light-outline text-primary font-headline text-xs font-bold hover:bg-light-surface-container flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Siguiente Reel</span>
                <span className="material-symbols-outlined text-[16px]">skip_next</span>
              </button>
            </div>

            <a
              href={reel.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-headline text-label-md font-bold hover:bg-secondary transition-colors flex items-center justify-center gap-2 shadow"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              <span>Abrir Perfil Oficial @ful.uagrm en TikTok</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

interface RegulationModalProps {
  regulation: RegulationDoc | null;
  onClose: () => void;
  whatsappNumber?: string;
}

export const RegulationViewerModal: React.FC<RegulationModalProps> = ({
  regulation,
  onClose,
  whatsappNumber = OFFICIAL_WHATSAPP_NUMBER,
}) => {
  const [downloadedNotice, setDownloadedNotice] = useState(false);

  useEffect(() => {
    setDownloadedNotice(false);
  }, [regulation]);

  if (!regulation) return null;

  const handleDownloadSummary = () => {
    const content = [
      `FEDERACIÓN UNIVERSITARIA LOCAL (FUL 2026-2028) - UAGRM`,
      `GACETA OFICIAL ESTUDIANTIL`,
      `====================================================`,
      `Documento: ${regulation.title} - ${regulation.subtitle}`,
      `Código Normativo: ${regulation.code}`,
      `Vigencia: ${regulation.updatedAt}`,
      ``,
      `RESUMEN EJECUTIVO:`,
      regulation.summary,
      ``,
      `ARTÍCULOS FUNDAMENTALES PARA EL ESTUDIANTE:`,
      ...regulation.articles.map(
        (a) => `\n- ${a.number} | ${a.title}:\n  ${a.content}`
      ),
      ``,
      `Oficina Central FUL UAGRM - Ciudad Universitaria (2do Anillo), Santa Cruz, Bolivia.`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${regulation.id}-uagrm-ful.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloadedNotice(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-regulation-title"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-light-outline/40 overflow-hidden my-auto animate-surface-enter max-h-[90vh] flex flex-col">
        {/* Cabecera */}
        <div className="bg-primary text-white p-5 sm:p-6 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-accent text-white px-2.5 py-0.5 rounded-full font-headline text-[11px] font-bold uppercase tracking-wider">
                Gaceta Oficial UAGRM
              </span>
              <span className="font-mono text-xs text-white/80">{regulation.code}</span>
            </div>
            <h3
              id="modal-regulation-title"
              className="font-headline text-headline-sm font-bold text-white"
            >
              {regulation.title} — {regulation.subtitle}
            </h3>
            <p className="text-xs text-white/75 mt-1">
              {regulation.updatedAt} · {regulation.pages} páginas · Tam. ref: {regulation.fileSize}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Cerrar visor de reglamento"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Contenido Articulado */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="p-4 rounded-xl bg-light-surface-container border border-light-outline/50 text-sm text-primary leading-relaxed">
            {regulation.summary}
          </div>

          <h4 className="font-headline text-xs font-bold uppercase tracking-wider text-secondary">
            Extracto de Artículos Clave de Defensa Estudiantil
          </h4>

          <div className="space-y-3">
            {regulation.articles.map((art, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-light-outline/60 bg-white space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-secondary">
                    {art.number}
                  </span>
                  <span className="text-[11px] font-headline font-semibold text-primary/70">
                    Normativa Vigente
                  </span>
                </div>
                <h5 className="font-headline text-sm font-bold text-primary">{art.title}</h5>
                <p className="font-body text-xs sm:text-sm text-light-on-surface-container leading-relaxed">
                  {art.content}
                </p>
              </div>
            ))}
          </div>

          {downloadedNotice && (
            <div className="p-3 rounded-xl bg-accent/10 border border-accent/30 text-xs text-accent font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">download_done</span>
              <span>
                Se ha descargado el compendio normativo de <strong>{regulation.title}</strong> en tu dispositivo.
              </span>
            </div>
          )}
        </div>

        {/* Pie del Modal */}
        <div className="px-5 sm:px-6 py-4 bg-light-surface-container border-t border-light-outline/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <a
            href={buildDynamicWhatsAppUrl(
              whatsappNumber,
              `Hola Defensoría FUL UAGRM, necesito asesoría respecto al documento normativo: ${regulation.title}`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-headline font-bold text-accent hover:underline inline-flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">gavel</span>
            <span>Solicitar asesoramiento legal por WhatsApp</span>
          </a>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-light-outline text-primary font-headline text-xs font-semibold hover:bg-white transition-colors cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleDownloadSummary}
              className="px-5 py-2.5 rounded-full bg-secondary text-on-secondary font-headline text-xs font-bold hover:bg-secondary/90 transition-colors flex items-center gap-1.5 shadow cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Descargar Compendio Normativo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FacebookPostModalProps {
  post: FacebookPostItem | null;
  onClose: () => void;
}

export const FacebookPostModal: React.FC<FacebookPostModalProps> = ({
  post,
  onClose,
}) => {
  useEffect(() => {
    if (!post) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [post, onClose]);

  if (!post) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-fb-post-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-light-outline/40 overflow-hidden my-auto animate-surface-enter grid grid-cols-1 lg:grid-cols-12 max-h-[92vh]"
      >
        {/* Botón de cierre (X) flotante superior derecho */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar comunicado"
          className="absolute top-3.5 right-3.5 z-20 w-10 h-10 rounded-full bg-primary/90 text-white hover:bg-secondary flex items-center justify-center shadow-md transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">close</span>
        </button>

        {/* Columna Izquierda (7 cols en desktop): Imagen o afiche completo sin recortes (object-contain) */}
        <div className="lg:col-span-7 bg-[#071529] flex items-center justify-center p-4 sm:p-6 min-h-[280px] sm:min-h-[420px] max-h-[55vh] lg:max-h-[88vh] relative">
          <img
            src={post.imagenUrl}
            alt={post.titulo}
            referrerPolicy="no-referrer"
            className="w-full h-full max-h-[50vh] lg:max-h-[82vh] object-contain rounded-lg select-none"
          />
        </div>

        {/* Columna Derecha (5 cols en desktop): Encabezado institucional, texto con scroll interno y CTA Facebook */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white text-light-on-surface max-h-[88vh] overflow-hidden">
          {/* Encabezado Institucional de la FUL UAGRM */}
          <div className="p-5 sm:p-6 border-b border-light-outline/50 pr-14 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white p-0.5 border border-primary/20 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={OFFICIAL_LOGOS.ful}
                  alt="FUL UAGRM"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-headline text-sm font-bold text-primary">
                    FUL UAGRM 2026–2028
                  </span>
                  <span
                    className="material-symbols-outlined text-[#1877F2] text-[16px]"
                    title="Página Oficial Verificada"
                  >
                    verified
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-light-on-surface-container/80 font-body mt-0.5">
                  <span className="material-symbols-outlined text-[14px] text-secondary">
                    calendar_today
                  </span>
                  <span>{post.fecha}</span>
                  <span>·</span>
                  <span>Comunicado Oficial</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cuerpo desplazable: Título completo y descripción íntegra */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
            <h3
              id="modal-fb-post-title"
              className="font-headline text-title-lg sm:text-headline-sm font-bold text-primary leading-snug"
            >
              {post.titulo}
            </h3>

            <div className="font-body text-body-md text-light-on-surface-container whitespace-pre-line leading-relaxed">
              {post.descripcionCompleta}
            </div>
          </div>

          {/* Pie con botón destacado Azul Facebook (#1877F2) */}
          <div className="p-5 sm:p-6 bg-light-surface-container border-t border-light-outline/50 shrink-0 space-y-2.5">
            <a
              href={post.facebookPostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-5 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-headline text-label-lg font-bold shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Reaccionar y comentar en Facebook</span>
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

