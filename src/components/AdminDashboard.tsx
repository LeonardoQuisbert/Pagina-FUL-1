import React, { useEffect, useState } from 'react';
import {
  auth,
  collection,
  db,
  DEFAULT_PORTAL_CONFIG,
  deleteDoc,
  doc,
  FirestoreAdminUser,
  FirestoreEvento,
  FirestoreFacultad,
  FirestoreInscrito,
  FirestoreNoticia,
  FirestoreTikTokVideo,
  getDoc,
  googleProvider,
  handleFirestoreError,
  onAuthStateChanged,
   onSnapshot,
  OperationType,
  PortalConfig,
  PRIMARY_ADMIN_EMAIL,
  seedInitialPortalDataIfEmpty,
  setDoc,
  signInWithPopup,
  signOut,
  User,
} from '../firebase';
import {
  FacebookPostItem,
  OFFICIAL_FACEBOOK_URL,
  OFFICIAL_LOGOS,
} from '../data/portalData';

interface AdminDashboardProps {
  onBackToHome: () => void;
  onPreviewFacebookPost: (post: FacebookPostItem) => void;
}

type AdminSectionId =
  | 'noticias'
  | 'eventos'
  | 'facebook'
  | 'tiktok'
  | 'inscritos_config';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToHome,
  onPreviewFacebookPost,
}) => {
  // Auth & Authorization State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState('');
  const [seedingStatus, setSeedingStatus] = useState('');

  // Navigation State
  const [activeSection, setActiveSection] = useState<AdminSectionId>('noticias');
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Confirmation state for deletions (no window.confirm)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Live Firestore Collections for Admin
  const [noticias, setNoticias] = useState<FirestoreNoticia[]>([]);
  const [eventos, setEventos] = useState<FirestoreEvento[]>([]);
  const [facebookPosts, setFacebookPosts] = useState<FacebookPostItem[]>([]);
  const [tiktokVideos, setTiktokVideos] = useState<FirestoreTikTokVideo[]>([]);
  const [facultades, setFacultades] = useState<FirestoreFacultad[]>([]);
  const [inscritos, setInscritos] = useState<FirestoreInscrito[]>([]);
  const [adminsList, setAdminsList] = useState<FirestoreAdminUser[]>([]);
  const [configForm, setConfigForm] = useState<PortalConfig>(DEFAULT_PORTAL_CONFIG);

  // ===============================================================
  // 1. NOTICIAS STATE
  // ===============================================================
  const [newsSearch, setNewsSearch] = useState('');
  const [editingNoticiaId, setEditingNoticiaId] = useState<string | null>(null);
  const [noticiaForm, setNoticiaForm] = useState<{
    titulo: string;
    categoria: FirestoreNoticia['categoria'];
    fecha: string;
    resumen: string;
    contenidoCompleto: string;
    imagenUrl: string;
    destacada: boolean;
    archivada: boolean;
    autor: string;
    impactosTexto: string;
  }>({
    titulo: '',
    categoria: 'Gestión',
    fecha: '',
    resumen: '',
    contenidoCompleto: '',
    imagenUrl: '',
    destacada: true,
    archivada: false,
    autor: 'Dirección de Comunicación FUL UAGRM',
    impactosTexto: '',
  });

  // ===============================================================
  // 2. EVENTOS & FACULTADES STATE
  // ===============================================================
  const [eventosSubTab, setEventosSubTab] = useState<'convocatorias' | 'facultades'>(
    'convocatorias'
  );
  const [editingEventoId, setEditingEventoId] = useState<string | null>(null);
  const [eventoForm, setEventoForm] = useState<Omit<FirestoreEvento, 'id'>>({
    titulo: '',
    tipo: 'Deportivo',
    fechaEvento: '',
    lugar: 'Ciudad Universitaria UAGRM (2do Anillo)',
    descripcion: '',
    imagenUrl: '',
    cupoMaximo: 100,
    estado: 'Activo',
    organizador: 'Secretaría Ejecutiva FUL UAGRM',
    etiquetaCorta: 'Inscripción Abierta',
  });

  const [editingFacultadId, setEditingFacultadId] = useState<string | null>(null);
  const [facultadForm, setFacultadForm] = useState<{
    nombre: string;
    carrerasTexto: string;
    orden: number;
  }>({
    nombre: '',
    carrerasTexto: '',
    orden: 1,
  });

  // ===============================================================
  // 3. FACEBOOK POSTS STATE
  // ===============================================================
  const [editingFbId, setEditingFbId] = useState<string | null>(null);
  const [fbForm, setFbForm] = useState<Omit<FacebookPostItem, 'id'>>({
    titulo: '',
    fecha: '',
    imagenUrl: '',
    descripcionCompleta: '',
    facebookPostUrl: OFFICIAL_FACEBOOK_URL,
  });

  // ===============================================================
  // 4. TIKTOK VIDEOS STATE
  // ===============================================================
  const [editingTiktokId, setEditingTiktokId] = useState<string | null>(null);
  const [tiktokForm, setTiktokForm] = useState<Omit<FirestoreTikTokVideo, 'id'>>({
    titulo: '',
    autorCuenta: '@ful.uagrm',
    tiktokUrl: 'https://tiktok.com/@ful.uagrm',
    miniaturaUrl: '',
    categoria: 'Gestión',
    vistas: '25.0K',
    orden: 1,
  });

  // ===============================================================
  // 5. INSCRITOS & CONFIGURACION & ADMINS STATE
  // ===============================================================
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('Todos');
  const [inscritoSearch, setInscritoSearch] = useState<string>('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminNombre, setNewAdminNombre] = useState('');

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackBanner({ type, text });
    setTimeout(() => {
      setFeedbackBanner((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Check Auth & Verify Admin Role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthErrorMsg('');
      if (!user || !user.email) {
        setIsAuthorizedAdmin(false);
        setAuthLoading(false);
        return;
      }

      const normalizedEmail = user.email.toLowerCase().trim();
      if (normalizedEmail === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
        setIsAuthorizedAdmin(true);
        setAuthLoading(false);
        return;
      }

      try {
        const adminDoc = await getDoc(doc(db, 'admins', normalizedEmail));
        setIsAuthorizedAdmin(adminDoc.exists());
      } catch {
        setIsAuthorizedAdmin(false);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // When authorized admin logs in, seed initial data if collections are empty and subscribe to collections
  useEffect(() => {
    if (!isAuthorizedAdmin) return;

    let isMounted = true;
    setSeedingStatus('Sincronizando base de datos institucional...');
    seedInitialPortalDataIfEmpty()
      .catch((err) => console.warn('Seed check warning:', err))
      .finally(() => {
        if (isMounted) setSeedingStatus('');
      });

    const unsubNoticias = onSnapshot(
      collection(db, 'noticias'),
      (snap) => {
        const items: FirestoreNoticia[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<FirestoreNoticia, 'id'>),
        }));
        setNoticias(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'noticias')
    );

    const unsubEventos = onSnapshot(
      collection(db, 'eventos'),
      (snap) => {
        const items: FirestoreEvento[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<FirestoreEvento, 'id'>),
        }));
        setEventos(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'eventos')
    );

    const unsubFb = onSnapshot(
      collection(db, 'facebook_posts'),
      (snap) => {
        const items: FacebookPostItem[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<FacebookPostItem, 'id'>),
        }));
        setFacebookPosts(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'facebook_posts')
    );

    const unsubTiktok = onSnapshot(
      collection(db, 'tiktok_videos'),
      (snap) => {
        const items: FirestoreTikTokVideo[] = snap.docs
          .map((d) => ({
            id: d.id,
            ...(d.data() as Omit<FirestoreTikTokVideo, 'id'>),
          }))
          .sort((a, b) => a.orden - b.orden);
        setTiktokVideos(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'tiktok_videos')
    );

    const unsubFacultades = onSnapshot(
      collection(db, 'facultades'),
      (snap) => {
        const items: FirestoreFacultad[] = snap.docs
          .map((d) => ({
            id: d.id,
            ...(d.data() as Omit<FirestoreFacultad, 'id'>),
          }))
          .sort((a, b) => a.orden - b.orden);
        setFacultades(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'facultades')
    );

    const unsubInscritos = onSnapshot(
      collection(db, 'inscritos'),
      (snap) => {
        const items: FirestoreInscrito[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<FirestoreInscrito, 'id'>),
        }));
        setInscritos(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'inscritos')
    );

    const unsubConfig = onSnapshot(
      doc(db, 'configuracion', 'general'),
      (snap) => {
        if (snap.exists()) {
          setConfigForm(snap.data() as PortalConfig);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'configuracion/general')
    );

    const unsubAdmins = onSnapshot(
      collection(db, 'admins'),
      (snap) => {
        const items: FirestoreAdminUser[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<FirestoreAdminUser, 'id'>),
        }));
        setAdminsList(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'admins')
    );

    return () => {
      isMounted = false;
      unsubNoticias();
      unsubEventos();
      unsubFb();
      unsubTiktok();
      unsubFacultades();
      unsubInscritos();
      unsubConfig();
      unsubAdmins();
    };
  }, [isAuthorizedAdmin]);

  const handleGoogleLogin = async () => {
    setAuthErrorMsg('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthErrorMsg(
        err instanceof Error
          ? `No se pudo iniciar sesión con Google: ${err.message}`
          : 'Error al autenticar con Google.'
      );
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // ===============================================================
  // HANDLERS: 1. NOTICIAS
  // ===============================================================
  const resetNoticiaForm = () => {
    setEditingNoticiaId(null);
    setNoticiaForm({
      titulo: '',
      categoria: 'Gestión',
      fecha: '',
      resumen: '',
      contenidoCompleto: '',
      imagenUrl: '',
      destacada: true,
      archivada: false,
      autor: 'Dirección de Comunicación FUL UAGRM',
      impactosTexto: '',
    });
  };

  const handleSaveNoticia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      noticiaForm.titulo.trim().length < 3 ||
      noticiaForm.resumen.trim().length < 5 ||
      noticiaForm.contenidoCompleto.trim().length < 10 ||
      !noticiaForm.imagenUrl.trim().startsWith('http')
    ) {
      showFeedback(
        'error',
        'Por favor completa título, resumen, contenido completo y una URL de imagen válida (https://...).'
      );
      return;
    }

    const docId = editingNoticiaId || `noticia_${Date.now()}`;
    const impactosList = noticiaForm.impactosTexto
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 10);

    const payload: Omit<FirestoreNoticia, 'id'> = {
      titulo: noticiaForm.titulo.trim(),
      categoria: noticiaForm.categoria,
      fecha:
        noticiaForm.fecha.trim() ||
        new Date().toLocaleDateString('es-BO', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
      resumen: noticiaForm.resumen.trim(),
      contenidoCompleto: noticiaForm.contenidoCompleto.trim(),
      imagenUrl: noticiaForm.imagenUrl.trim(),
      destacada: noticiaForm.destacada,
      archivada: noticiaForm.archivada,
      autor: noticiaForm.autor.trim() || 'Dirección de Comunicación FUL UAGRM',
      impactos:
        impactosList.length > 0
          ? impactosList
          : ['Gestión verificable a favor del estamento estudiantil UAGRM'],
    };

    try {
      await setDoc(doc(db, 'noticias', docId), payload);
      showFeedback(
        'success',
        editingNoticiaId
          ? 'Noticia actualizada en Cloud Firestore.'
          : 'Nueva noticia publicada en Cloud Firestore.'
      );
      resetNoticiaForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `noticias/${docId}`);
    }
  };

  const handleToggleNoticiaFlag = async (
    item: FirestoreNoticia,
    field: 'destacada' | 'archivada'
  ) => {
    const updated: Omit<FirestoreNoticia, 'id'> = {
      titulo: item.titulo,
      categoria: item.categoria,
      fecha: item.fecha,
      resumen: item.resumen,
      contenidoCompleto: item.contenidoCompleto,
      imagenUrl: item.imagenUrl,
      destacada: field === 'destacada' ? !item.destacada : item.destacada,
      archivada: field === 'archivada' ? !item.archivada : item.archivada,
      autor: item.autor,
      impactos: item.impactos || [],
    };
    try {
      await setDoc(doc(db, 'noticias', item.id), updated);
      showFeedback('success', `Estado de "${item.titulo}" actualizado.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `noticias/${item.id}`);
    }
  };

  const handleDeleteNoticia = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'noticias', id));
      setConfirmDeleteId(null);
      if (editingNoticiaId === id) resetNoticiaForm();
      showFeedback('success', 'Noticia eliminada permanentemente.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `noticias/${id}`);
    }
  };

  // ===============================================================
  // HANDLERS: 2. EVENTOS & FACULTADES
  // ===============================================================
  const resetEventoForm = () => {
    setEditingEventoId(null);
    setEventoForm({
      titulo: '',
      tipo: 'Deportivo',
      fechaEvento: '',
      lugar: 'Ciudad Universitaria UAGRM (2do Anillo)',
      descripcion: '',
      imagenUrl: '',
      cupoMaximo: 100,
      estado: 'Activo',
      organizador: 'Secretaría Ejecutiva FUL UAGRM',
      etiquetaCorta: 'Inscripción Abierta',
    });
  };

  const handleSaveEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      eventoForm.titulo.trim().length < 3 ||
      eventoForm.descripcion.trim().length < 5 ||
      eventoForm.lugar.trim().length < 3 ||
      !eventoForm.imagenUrl.trim().startsWith('http')
    ) {
      showFeedback(
        'error',
        'Por favor completa el título, fecha, lugar, descripción y una URL de imagen válida (https://...).'
      );
      return;
    }

    const docId = editingEventoId || `evento_${Date.now()}`;
    const payload: Omit<FirestoreEvento, 'id'> = {
      titulo: eventoForm.titulo.trim(),
      tipo: eventoForm.tipo,
      fechaEvento: eventoForm.fechaEvento.trim() || 'Convocatoria Vigente 2026',
      lugar: eventoForm.lugar.trim(),
      descripcion: eventoForm.descripcion.trim(),
      imagenUrl: eventoForm.imagenUrl.trim(),
      cupoMaximo: Math.max(1, Number(eventoForm.cupoMaximo) || 100),
      estado: eventoForm.estado,
      organizador: eventoForm.organizador.trim() || 'Secretaría Ejecutiva FUL UAGRM',
      etiquetaCorta: eventoForm.etiquetaCorta.trim() || 'Convocatoria FUL',
    };

    try {
      await setDoc(doc(db, 'eventos', docId), payload);
      showFeedback(
        'success',
        editingEventoId
          ? 'Convocatoria/Evento actualizado correctamente.'
          : 'Nueva convocatoria creada en Cloud Firestore.'
      );
      resetEventoForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `eventos/${docId}`);
    }
  };

  const handleToggleEventoEstado = async (ev: FirestoreEvento) => {
    const nuevoEstado: FirestoreEvento['estado'] =
      ev.estado === 'Activo' ? 'Cerrado' : 'Activo';
    const payload: Omit<FirestoreEvento, 'id'> = {
      titulo: ev.titulo,
      tipo: ev.tipo,
      fechaEvento: ev.fechaEvento,
      lugar: ev.lugar,
      descripcion: ev.descripcion,
      imagenUrl: ev.imagenUrl,
      cupoMaximo: ev.cupoMaximo,
      estado: nuevoEstado,
      organizador: ev.organizador,
      etiquetaCorta: ev.etiquetaCorta,
    };
    try {
      await setDoc(doc(db, 'eventos', ev.id), payload);
      showFeedback('success', `Evento marcado como ${nuevoEstado}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `eventos/${ev.id}`);
    }
  };

  const handleDeleteEvento = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'eventos', id));
      setConfirmDeleteId(null);
      if (editingEventoId === id) resetEventoForm();
      showFeedback('success', 'Convocatoria eliminada de Firestore.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `eventos/${id}`);
    }
  };

  const handleSaveFacultad = async (e: React.FormEvent) => {
    e.preventDefault();
    const carrerasArray = facultadForm.carrerasTexto
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean)
      .slice(0, 25);

    if (facultadForm.nombre.trim().length < 3 || carrerasArray.length === 0) {
      showFeedback(
        'error',
        'Ingresa el nombre de la Facultad y al menos una carrera (una por línea).'
      );
      return;
    }

    const docId = editingFacultadId || `fac_${Date.now()}`;
    const payload: Omit<FirestoreFacultad, 'id'> = {
      nombre: facultadForm.nombre.trim(),
      carreras: carrerasArray,
      orden: Number(facultadForm.orden) || facultades.length + 1,
    };

    try {
      await setDoc(doc(db, 'facultades', docId), payload);
      showFeedback('success', 'Facultad y carreras guardadas en el catálogo.');
      setEditingFacultadId(null);
      setFacultadForm({
        nombre: '',
        carrerasTexto: '',
        orden: facultades.length + 1,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `facultades/${docId}`);
    }
  };

  const handleDeleteFacultad = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'facultades', id));
      setConfirmDeleteId(null);
      showFeedback('success', 'Facultad eliminada del catálogo.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `facultades/${id}`);
    }
  };

  // ===============================================================
  // HANDLERS: 3. FACEBOOK POSTS
  // ===============================================================
  const resetFbForm = () => {
    setEditingFbId(null);
    setFbForm({
      titulo: '',
      fecha: '',
      imagenUrl: '',
      descripcionCompleta: '',
      facebookPostUrl: OFFICIAL_FACEBOOK_URL,
    });
  };

  const handleSaveFbPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      fbForm.titulo.trim().length < 3 ||
      fbForm.descripcionCompleta.trim().length < 5 ||
      !fbForm.imagenUrl.trim().startsWith('http')
    ) {
      showFeedback(
        'error',
        'Completa título, descripción completa y una URL de imagen válida (https://...).'
      );
      return;
    }

    const docId = editingFbId || `fb_post_${Date.now()}`;
    const payload: Omit<FacebookPostItem, 'id'> = {
      titulo: fbForm.titulo.trim(),
      fecha:
        fbForm.fecha.trim() ||
        new Date().toLocaleDateString('es-BO', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
      imagenUrl: fbForm.imagenUrl.trim(),
      descripcionCompleta: fbForm.descripcionCompleta.trim(),
      facebookPostUrl: fbForm.facebookPostUrl.trim() || OFFICIAL_FACEBOOK_URL,
    };

    try {
      await setDoc(doc(db, 'facebook_posts', docId), payload);
      showFeedback(
        'success',
        editingFbId
          ? 'Comunicado de Facebook actualizado.'
          : 'Nuevo comunicado de Facebook publicado.'
      );
      resetFbForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `facebook_posts/${docId}`);
    }
  };

  const handleDeleteFbPost = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'facebook_posts', id));
      setConfirmDeleteId(null);
      if (editingFbId === id) resetFbForm();
      showFeedback('success', 'Publicación de Facebook eliminada.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `facebook_posts/${id}`);
    }
  };

  // ===============================================================
  // HANDLERS: 4. TIKTOK VIDEOS
  // ===============================================================
  const resetTiktokForm = () => {
    setEditingTiktokId(null);
    setTiktokForm({
      titulo: '',
      autorCuenta: '@ful.uagrm',
      tiktokUrl: 'https://tiktok.com/@ful.uagrm',
      miniaturaUrl: '',
      categoria: 'Gestión',
      vistas: '25.0K',
      orden: tiktokVideos.length + 1,
    });
  };

  const handleSaveTiktok = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      tiktokForm.titulo.trim().length < 3 ||
      !tiktokForm.tiktokUrl.trim().startsWith('http') ||
      !tiktokForm.miniaturaUrl.trim().startsWith('http')
    ) {
      showFeedback(
        'error',
        'Completa el título, la URL del video de TikTok y la URL de la miniatura vertical.'
      );
      return;
    }

    const docId = editingTiktokId || `reel_${Date.now()}`;
    const payload: Omit<FirestoreTikTokVideo, 'id'> = {
      titulo: tiktokForm.titulo.trim(),
      autorCuenta: tiktokForm.autorCuenta.trim() || '@ful.uagrm',
      tiktokUrl: tiktokForm.tiktokUrl.trim(),
      miniaturaUrl: tiktokForm.miniaturaUrl.trim(),
      categoria: tiktokForm.categoria.trim() || 'Gestión',
      vistas: tiktokForm.vistas.trim() || '15.0K',
      orden: Number(tiktokForm.orden) || tiktokVideos.length + 1,
    };

    try {
      await setDoc(doc(db, 'tiktok_videos', docId), payload);
      showFeedback(
        'success',
        editingTiktokId ? 'Video de TikTok actualizado.' : 'Video de TikTok agregado.'
      );
      resetTiktokForm();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `tiktok_videos/${docId}`);
    }
  };

  const handleReorderTiktok = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= tiktokVideos.length) return;

    const currentItem = tiktokVideos[index];
    const swapItem = tiktokVideos[targetIndex];

    try {
      await setDoc(doc(db, 'tiktok_videos', currentItem.id), {
        titulo: currentItem.titulo,
        autorCuenta: currentItem.autorCuenta,
        tiktokUrl: currentItem.tiktokUrl,
        miniaturaUrl: currentItem.miniaturaUrl,
        categoria: currentItem.categoria,
        vistas: currentItem.vistas,
        orden: targetIndex + 1,
      });
      await setDoc(doc(db, 'tiktok_videos', swapItem.id), {
        titulo: swapItem.titulo,
        autorCuenta: swapItem.autorCuenta,
        tiktokUrl: swapItem.tiktokUrl,
        miniaturaUrl: swapItem.miniaturaUrl,
        categoria: swapItem.categoria,
        vistas: swapItem.vistas,
        orden: index + 1,
      });
      showFeedback('success', 'Orden de videos de TikTok actualizado.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'tiktok_videos');
    }
  };

  const handleDeleteTiktok = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tiktok_videos', id));
      setConfirmDeleteId(null);
      if (editingTiktokId === id) resetTiktokForm();
      showFeedback('success', 'Video de TikTok eliminado.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tiktok_videos/${id}`);
    }
  };

  // ===============================================================
  // HANDLERS: 5. INSCRITOS, CSV EXPORT, CONFIG & ADMINS
  // ===============================================================
  const filteredInscritos = inscritos.filter((item) => {
    const matchesEvent =
      selectedEventFilter === 'Todos' ||
      item.eventoId === selectedEventFilter ||
      item.eventoTitulo === selectedEventFilter;
    const q = inscritoSearch.toLowerCase().trim();
    const matchesQuery =
      !q ||
      item.nombre.toLowerCase().includes(q) ||
      item.registroUniversitario.includes(q) ||
      item.carrera.toLowerCase().includes(q) ||
      item.codigoConfirmacion.toLowerCase().includes(q);
    return matchesEvent && matchesQuery;
  });

  const handleExportCsv = () => {
    const headers = [
      'Código Confirmación',
      'Evento / Convocatoria',
      'Nombre Estudiante',
      'Registro Universitario',
      'Facultad',
      'Carrera',
      'WhatsApp',
      'Fecha de Registro',
    ];

    const escapeCsv = (val: string) => `"${String(val || '').replace(/"/g, '""')}"`;

    const rows = filteredInscritos.map((ins) =>
      [
        ins.codigoConfirmacion,
        ins.eventoTitulo,
        ins.nombre,
        ins.registroUniversitario,
        ins.facultad,
        ins.carrera,
        ins.whatsapp,
        ins.fechaRegistro,
      ]
        .map(escapeCsv)
        .join(',')
    );

    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inscritos-ful-uagrm-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteInscrito = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'inscritos', id));
      setConfirmDeleteId(null);
      showFeedback('success', 'Registro de inscripción eliminado.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `inscritos/${id}`);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: PortalConfig = {
      whatsappGeneral: configForm.whatsappGeneral.replace(/\D/g, '') || '59175562627',
      whatsappDefensoria:
        configForm.whatsappDefensoria.replace(/\D/g, '') || '59175562627',
      facebookUrl: configForm.facebookUrl.trim() || OFFICIAL_FACEBOOK_URL,
      tiktokUrl: configForm.tiktokUrl.trim() || 'https://tiktok.com/@ful.uagrm',
      instagramUrl:
        configForm.instagramUrl.trim() || 'https://instagram.com/ful.uagrm',
      emailContacto:
        configForm.emailContacto.trim() || 'contacto@ful-uagrm.edu.bo',
      direccionCampus:
        configForm.direccionCampus.trim() ||
        'Ciudad Universitaria (Campus), Av. Busch y 2do Anillo, Santa Cruz.',
      horarioAtencion:
        configForm.horarioAtencion.trim() || 'Lun a Vie: 08:00 – 18:30',
    };

    try {
      await setDoc(doc(db, 'configuracion', 'general'), payload);
      showFeedback(
        'success',
        'Configuración general de WhatsApp y redes actualizada en todo el portal.'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'configuracion/general');
    }
  };

  const handleAddCollaboratorAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newAdminEmail.toLowerCase().trim();
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail)) {
      showFeedback('error', 'Ingresa un correo electrónico válido.');
      return;
    }
    if (newAdminNombre.trim().length < 2) {
      showFeedback('error', 'Ingresa el nombre o cargo del colaborador.');
      return;
    }

    const payload: Omit<FirestoreAdminUser, 'id'> = {
      email: cleanEmail,
      nombre: newAdminNombre.trim(),
      agregadoPor: currentUser?.email?.toLowerCase() || PRIMARY_ADMIN_EMAIL,
      fechaAlta: new Date().toLocaleDateString('es-BO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };

    try {
      await setDoc(doc(db, 'admins', cleanEmail), payload);
      setNewAdminEmail('');
      setNewAdminNombre('');
      showFeedback('success', `Colaborador ${cleanEmail} autorizado para /admin.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `admins/${cleanEmail}`);
    }
  };

  const handleRemoveCollaboratorAdmin = async (emailId: string) => {
    try {
      await deleteDoc(doc(db, 'admins', emailId));
      setConfirmDeleteId(null);
      showFeedback('success', `Acceso revocado para ${emailId}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `admins/${emailId}`);
    }
  };

  // ===============================================================
  // AUTH SCREENS (LOADING / SIGN IN / ACCESS DENIED)
  // ===============================================================
  if (authLoading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-light-surface-container p-6">
        <div className="bg-white p-8 rounded-2xl border border-light-outline/60 shadow-lg max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-secondary animate-spin mx-auto"></div>
          <p className="font-headline text-sm font-bold text-primary">
            Verificando credenciales de administración FUL UAGRM...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-light-surface-container px-4 py-12">
        <div className="bg-white rounded-2xl border border-light-outline/60 shadow-xl max-w-md w-full overflow-hidden">
          <div className="bg-primary text-white p-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-white p-1.5 mx-auto shadow flex items-center justify-center">
              <img
                src={OFFICIAL_LOGOS.ful}
                alt="FUL UAGRM"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <span className="inline-block px-3 py-0.5 rounded-full bg-white/10 text-accent font-mono text-xs font-bold">
              Ruta Protegida · /admin
            </span>
            <h1 className="font-headline text-title-lg font-bold text-white">
              Panel Administrativo FUL 2026–2028
            </h1>
            <p className="text-xs text-white/80 font-body">
              Acceso exclusivo para el Administrador Principal y colaboradores autorizados de la Federación Universitaria Local.
            </p>
          </div>

          <div className="p-6 space-y-5">
            {authErrorMsg && (
              <div className="p-3.5 rounded-xl bg-secondary/10 border border-secondary/30 text-xs text-secondary font-medium">
                {authErrorMsg}
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3.5 px-5 rounded-xl bg-primary hover:bg-secondary text-white font-headline text-sm font-bold shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">login</span>
              <span>Iniciar sesión con Google</span>
            </button>

            <div className="pt-3 border-t border-light-outline/40 text-center">
              <button
                type="button"
                onClick={onBackToHome}
                className="text-xs font-headline font-bold text-primary/70 hover:text-secondary inline-flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Volver al Portal Público</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-light-surface-container px-4 py-12">
        <div className="bg-white rounded-2xl border border-secondary/40 shadow-xl max-w-lg w-full overflow-hidden">
          <div className="bg-secondary text-white p-6 text-center space-y-2">
            <span className="material-symbols-outlined text-[42px]">gpp_bad</span>
            <h1 className="font-headline text-headline-sm font-bold text-white">
              Acceso Denegado
            </h1>
            <p className="text-xs text-white/90">
              Tu cuenta de Google no tiene permisos de administrador en el Portal Oficial FUL UAGRM.
            </p>
          </div>

          <div className="p-6 space-y-5 text-center">
            <div className="p-4 rounded-xl bg-light-surface-container border border-light-outline/50 text-xs space-y-1">
              <span className="text-light-on-surface-container block">
                Cuenta autenticada actualmente:
              </span>
              <strong className="font-mono text-sm text-primary block">
                {currentUser.email}
              </strong>
            </div>

            <p className="text-xs text-light-on-surface-container leading-relaxed">
              Solo el administrador principal o los correos registrados en la colección{' '}
              <code className="font-mono bg-primary/5 px-1.5 py-0.5 rounded text-primary">
                admins
              </code>{' '}
              pueden gestionar el contenido institucional.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-light-outline text-primary font-headline text-xs font-bold hover:bg-light-surface-container transition-colors cursor-pointer"
              >
                Cambiar de cuenta Google
              </button>
              <button
                type="button"
                onClick={onBackToHome}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-primary text-white font-headline text-xs font-bold hover:bg-secondary transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                <span className="material-symbols-outlined text-[16px]">home</span>
                <span>Volver al Inicio</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===============================================================
  // AUTHORIZED ADMIN DASHBOARD VIEW
  // ===============================================================
  const filteredNoticias = noticias.filter((n) => {
    const q = newsSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      n.titulo.toLowerCase().includes(q) ||
      n.categoria.toLowerCase().includes(q) ||
      n.resumen.toLowerCase().includes(q)
    );
  });

  const NAV_SECTIONS: { id: AdminSectionId; label: string; icon: string; badge?: number }[] = [
    {
      id: 'noticias',
      label: '1. Noticias y Comunicados',
      icon: 'newspaper',
      badge: noticias.length,
    },
    {
      id: 'eventos',
      label: '2. Eventos e Inscripciones',
      icon: 'event_available',
      badge: eventos.length,
    },
    {
      id: 'facebook',
      label: '3. Galería Facebook',
      icon: 'photo_library',
      badge: facebookPosts.length,
    },
    {
      id: 'tiktok',
      label: '4. Videos de TikTok',
      icon: 'smart_display',
      badge: tiktokVideos.length,
    },
    {
      id: 'inscritos_config',
      label: '5. Inscritos y Configuración',
      icon: 'groups',
      badge: inscritos.length,
    },
  ];

  return (
    <div className="min-h-screen bg-light-surface-container animate-surface-enter">
      {/* Cabecera Superior del Dashboard */}
      <section className="bg-primary text-white py-8 border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-accent font-headline text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>Cloud Firestore Conectado · Sesión: {currentUser.email}</span>
            </div>
            <h1 className="font-headline text-headline-sm sm:text-headline-md font-extrabold text-white">
              Panel de Administración — Portal Oficial FUL UAGRM
            </h1>
            {seedingStatus && (
              <p className="text-xs text-accent font-mono">{seedingStatus}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="px-4 py-2 rounded-full bg-white text-primary font-headline text-xs font-bold hover:bg-light-surface-container transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>Ver Portal Público</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-full bg-secondary text-white font-headline text-xs font-bold hover:bg-secondary/90 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navegación de las 5 Secciones */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-2xl border border-light-outline/60 shadow-2xs">
          {NAV_SECTIONS.map((sec) => {
            const active = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`px-4 py-2.5 rounded-xl font-headline text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  active
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-primary hover:bg-light-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{sec.icon}</span>
                <span>{sec.label}</span>
                {typeof sec.badge === 'number' && (
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[11px] ${
                      active ? 'bg-secondary text-white' : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {sec.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Banner de Retroalimentación */}
        {feedbackBanner && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-medium ${
              feedbackBanner.type === 'success'
                ? 'bg-accent/10 border-accent/30 text-accent'
                : 'bg-secondary/10 border-secondary/30 text-secondary'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">
                {feedbackBanner.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{feedbackBanner.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackBanner(null)}
              className="text-xs underline cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* =========================================================
            SECCIÓN 1: NOTICIAS Y COMUNICADOS WEB
           ========================================================= */}
        {activeSection === 'noticias' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Formulario Crear / Editar Noticia */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-light-outline/60 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-light-outline/40 pb-3">
                <h2 className="font-headline text-title-lg font-bold text-primary">
                  {editingNoticiaId ? 'Editar Noticia' : 'Nueva Noticia o Comunicado'}
                </h2>
                {editingNoticiaId && (
                  <button
                    type="button"
                    onClick={resetNoticiaForm}
                    className="text-xs font-headline font-bold text-secondary hover:underline cursor-pointer"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveNoticia} className="space-y-3.5">
                <div>
                  <label className="block font-headline text-xs font-bold text-primary mb-1">
                    Título (`titulo`) *
                  </label>
                  <input
                    type="text"
                    value={noticiaForm.titulo}
                    onChange={(e) =>
                      setNoticiaForm((p) => ({ ...p, titulo: e.target.value }))
                    }
                    placeholder="Ej. Brigadas universitarias en apoyo a los barrios"
                    className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-headline text-xs font-bold text-primary mb-1">
                      Categoría (`categoria`) *
                    </label>
                    <select
                      value={noticiaForm.categoria}
                      onChange={(e) =>
                        setNoticiaForm((p) => ({
                          ...p,
                          categoria: e.target.value as FirestoreNoticia['categoria'],
                        }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm bg-white"
                    >
                      <option value="Proyección Social">Proyección Social</option>
                      <option value="Gestión">Gestión</option>
                      <option value="Infraestructura">Infraestructura</option>
                      <option value="Académico">Académico</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-headline text-xs font-bold text-primary mb-1">
                      Fecha (`fecha`) *
                    </label>
                    <input
                      type="text"
                      value={noticiaForm.fecha}
                      onChange={(e) =>
                        setNoticiaForm((p) => ({ ...p, fecha: e.target.value }))
                      }
                      placeholder="Ej. 18 de Noviembre, 2026"
                      className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-headline text-xs font-bold text-primary mb-1">
                    URL de Imagen (`imagenUrl`) *
                  </label>
                  <input
                    type="url"
                    value={noticiaForm.imagenUrl}
                    onChange={(e) =>
                      setNoticiaForm((p) => ({ ...p, imagenUrl: e.target.value }))
                    }
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block font-headline text-xs font-bold text-primary mb-1">
                    Resumen Corto (`resumen`) *
                  </label>
                  <textarea
                    rows={2}
                    value={noticiaForm.resumen}
                    onChange={(e) =>
                      setNoticiaForm((p) => ({ ...p, resumen: e.target.value }))
                    }
                    placeholder="Extracto breve para la tarjeta..."
                    className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm"
                  />
                </div>

                <div>
                  <label className="block font-headline text-xs font-bold text-primary mb-1">
                    Contenido Completo (`contenidoCompleto`) *
                  </label>
                  <textarea
                    rows={4}
                    value={noticiaForm.contenidoCompleto}
                    onChange={(e) =>
                      setNoticiaForm((p) => ({
                        ...p,
                        contenidoCompleto: e.target.value,
                      }))
                    }
                    placeholder="Cuerpo completo del artículo (separa párrafos con salto de línea)..."
                    className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm"
                  />
                </div>

                <div>
                  <label className="block font-headline text-xs font-bold text-primary mb-1">
                    Puntos de Impacto (Opcional, uno por línea)
                  </label>
                  <textarea
                    rows={2}
                    value={noticiaForm.impactosTexto}
                    onChange={(e) =>
                      setNoticiaForm((p) => ({ ...p, impactosTexto: e.target.value }))
                    }
                    placeholder="Ej. 350 cupos de pasantías habilitados"
                    className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-xs"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-light-surface-container border border-light-outline/50">
                  <span className="font-headline text-xs font-bold text-primary">
                    Destacar en página principal (`destacada`)
                  </span>
                  <input
                    type="checkbox"
                    checked={noticiaForm.destacada}
                    onChange={(e) =>
                      setNoticiaForm((p) => ({ ...p, destacada: e.target.checked }))
                    }
                    className="w-4 h-4 accent-secondary cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-5 rounded-xl bg-secondary text-white font-headline text-sm font-bold hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>
                    {editingNoticiaId ? 'Actualizar Noticia' : 'Publicar Noticia'}
                  </span>
                </button>
              </form>
            </div>

            {/* Lista de Noticias con Buscador e Interruptores */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-light-outline/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-headline text-title-md font-bold text-primary">
                  Noticias Registradas ({filteredNoticias.length})
                </h3>
                <div className="relative min-w-[240px]">
                  <span className="material-symbols-outlined text-[18px] text-primary/50 absolute left-3 top-1/2 -translate-y-1/2">
                    search
                  </span>
                  <input
                    type="text"
                    value={newsSearch}
                    onChange={(e) => setNewsSearch(e.target.value)}
                    placeholder="Buscar por título o categoría..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-full border border-light-outline text-xs"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredNoticias.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start gap-4 ${
                      item.archivada
                        ? 'border-light-outline/40 opacity-65'
                        : 'border-light-outline/60 shadow-2xs'
                    }`}
                  >
                    <img
                      src={item.imagenUrl}
                      alt={item.titulo}
                      referrerPolicy="no-referrer"
                      className="w-full sm:w-28 h-24 rounded-xl object-cover shrink-0 bg-primary/10"
                    />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-headline text-[10px] font-bold uppercase">
                          {item.categoria}
                        </span>
                        <span className="text-xs text-light-on-surface-container">
                          {item.fecha}
                        </span>
                        {item.destacada && !item.archivada && (
                          <span className="px-2 py-0.5 rounded bg-accent/15 text-accent font-headline text-[10px] font-bold">
                            Destacada en Portada
                          </span>
                        )}
                        {item.archivada && (
                          <span className="px-2 py-0.5 rounded bg-secondary/15 text-secondary font-headline text-[10px] font-bold">
                            Archivada
                          </span>
                        )}
                      </div>

                      <h4 className="font-headline text-sm font-bold text-primary">
                        {item.titulo}
                      </h4>
                      <p className="text-xs text-light-on-surface-container line-clamp-2">
                        {item.resumen}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleNoticiaFlag(item, 'destacada')}
                          className={`px-2.5 py-1 rounded-lg font-headline text-[11px] font-bold border cursor-pointer ${
                            item.destacada
                              ? 'bg-accent text-white border-accent'
                              : 'bg-white text-primary border-light-outline'
                          }`}
                        >
                          {item.destacada ? '★ Destacada' : '☆ Destacar'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleNoticiaFlag(item, 'archivada')}
                          className="px-2.5 py-1 rounded-lg bg-light-surface-container text-primary font-headline text-[11px] font-bold hover:bg-primary/10 cursor-pointer"
                        >
                          {item.archivada ? 'Desarchivar' : 'Archivar'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoticiaId(item.id);
                            setNoticiaForm({
                              titulo: item.titulo,
                              categoria: item.categoria,
                              fecha: item.fecha,
                              resumen: item.resumen,
                              contenidoCompleto: item.contenidoCompleto,
                              imagenUrl: item.imagenUrl,
                              destacada: item.destacada,
                              archivada: item.archivada,
                              autor: item.autor,
                              impactosTexto: (item.impactos || []).join('\n'),
                            });
                          }}
                          className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-headline text-[11px] font-bold hover:bg-primary hover:text-white cursor-pointer"
                        >
                          Editar
                        </button>

                        {confirmDeleteId === item.id ? (
                          <div className="inline-flex items-center gap-1.5 bg-secondary/10 px-2.5 py-1 rounded-lg">
                            <span className="text-[11px] font-bold text-secondary">
                              ¿Confirmar?
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteNoticia(item.id)}
                              className="px-2 py-0.5 rounded bg-secondary text-white text-[11px] font-bold cursor-pointer"
                            >
                              Sí, eliminar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-0.5 rounded bg-white text-primary text-[11px] cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(item.id)}
                            className="px-3 py-1 rounded-lg bg-secondary/10 text-secondary font-headline text-[11px] font-bold hover:bg-secondary hover:text-white cursor-pointer"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            SECCIÓN 2: EVENTOS E INSCRIPCIONES + CATÁLOGO FACULTADES
           ========================================================= */}
        {activeSection === 'eventos' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setEventosSubTab('convocatorias')}
                className={`px-4 py-2 rounded-xl font-headline text-xs font-bold cursor-pointer ${
                  eventosSubTab === 'convocatorias'
                    ? 'bg-secondary text-white shadow-2xs'
                    : 'bg-white text-primary border border-light-outline'
                }`}
              >
                Gestión de Convocatorias y Eventos ({eventos.length})
              </button>
              <button
                type="button"
                onClick={() => setEventosSubTab('facultades')}
                className={`px-4 py-2 rounded-xl font-headline text-xs font-bold cursor-pointer ${
                  eventosSubTab === 'facultades'
                    ? 'bg-secondary text-white shadow-2xs'
                    : 'bg-white text-primary border border-light-outline'
                }`}
              >
                Editor de Facultades y Carreras UAGRM ({facultades.length})
              </button>
            </div>

            {eventosSubTab === 'convocatorias' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Formulario de Evento */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-light-outline/60 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-light-outline/40 pb-3">
                    <h2 className="font-headline text-title-lg font-bold text-primary">
                      {editingEventoId ? 'Editar Convocatoria' : 'Nueva Convocatoria / Evento'}
                    </h2>
                    {editingEventoId && (
                      <button
                        type="button"
                        onClick={resetEventoForm}
                        className="text-xs font-headline font-bold text-secondary hover:underline cursor-pointer"
                      >
                        Cancelar edición
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSaveEvento} className="space-y-3.5">
                    <div>
                      <label className="block font-headline text-xs font-bold text-primary mb-1">
                        Título del Evento (`titulo`) *
                      </label>
                      <input
                        type="text"
                        value={eventoForm.titulo}
                        onChange={(e) =>
                          setEventoForm((p) => ({ ...p, titulo: e.target.value }))
                        }
                        placeholder="Ej. Campeonato Interfacultativo de Futsal"
                        className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-headline text-xs font-bold text-primary mb-1">
                          Tipo (`tipo`) *
                        </label>
                        <select
                          value={eventoForm.tipo}
                          onChange={(e) =>
                            setEventoForm((p) => ({
                              ...p,
                              tipo: e.target.value as FirestoreEvento['tipo'],
                            }))
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm bg-white"
                        >
                          <option value="Deportivo">Deportivo</option>
                          <option value="Académico">Académico</option>
                          <option value="Cultural">Cultural</option>
                          <option value="Innovación y Negocios">
                            Innovación y Negocios
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-headline text-xs font-bold text-primary mb-1">
                          Estado (`estado`) *
                        </label>
                        <select
                          value={eventoForm.estado}
                          onChange={(e) =>
                            setEventoForm((p) => ({
                              ...p,
                              estado: e.target.value as FirestoreEvento['estado'],
                            }))
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm bg-white"
                        >
                          <option value="Activo">Activo (Abierto)</option>
                          <option value="Cerrado">Cerrado</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-headline text-xs font-bold text-primary mb-1">
                          Fecha del Evento (`fechaEvento`) *
                        </label>
                        <input
                          type="text"
                          value={eventoForm.fechaEvento}
                          onChange={(e) =>
                            setEventoForm((p) => ({ ...p, fechaEvento: e.target.value }))
                          }
                          placeholder="Ej. Inicia: 24 de Noviembre, 2026"
                          className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm"
                        />
                      </div>

                      <div>
                        <label className="block font-headline text-xs font-bold text-primary mb-1">
                          Cupo Máximo (`cupoMaximo`) *
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={eventoForm.cupoMaximo}
                          onChange={(e) =>
                            setEventoForm((p) => ({
                              ...p,
                              cupoMaximo: Number(e.target.value) || 100,
                            }))
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-headline text-xs font-bold text-primary mb-1">
                        Lugar en el Campus (`lugar`) *
                      </label>
                      <input
                        type="text"
                        value={eventoForm.lugar}
                        onChange={(e) =>
                          setEventoForm((p) => ({ ...p, lugar: e.target.value }))
                        }
                        placeholder="Ej. Coliseo Polideportivo Ciudad Universitaria"
                        className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-headline text-xs font-bold text-primary mb-1">
                          Unidad Organizadora
                        </label>
                        <input
                          type="text"
                          value={eventoForm.organizador}
                          onChange={(e) =>
                            setEventoForm((p) => ({ ...p, organizador: e.target.value }))
                          }
                          className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-headline text-xs font-bold text-primary mb-1">
                          Insignia Corta
                        </label>
                        <input
                          type="text"
                          value={eventoForm.etiquetaCorta}
                          onChange={(e) =>
                            setEventoForm((p) => ({
                              ...p,
                              etiquetaCorta: e.target.value,
                            }))
                          }
                          placeholder="Ej. 18 Facultades"
                          className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-headline text-xs font-bold text-primary mb-1">
                        URL del Afiche o Imagen (`imagenUrl`) *
                      </label>
                      <input
                        type="url"
                        value={eventoForm.imagenUrl}
                        onChange={(e) =>
                          setEventoForm((p) => ({ ...p, imagenUrl: e.target.value }))
                        }
                        placeholder="https://..."
                        className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-headline text-xs font-bold text-primary mb-1">
                        Descripción y Bases (`descripcion`) *
                      </label>
                      <textarea
                        rows={3}
                        value={eventoForm.descripcion}
                        onChange={(e) =>
                          setEventoForm((p) => ({ ...p, descripcion: e.target.value }))
                        }
                        placeholder="Bases y detalles de la convocatoria..."
                        className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-5 rounded-xl bg-secondary text-white font-headline text-sm font-bold hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 shadow cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      <span>
                        {editingEventoId ? 'Guardar Cambios' : 'Publicar Convocatoria'}
                      </span>
                    </button>
                  </form>
                </div>

                {/* Lista de Eventos */}
                <div className="lg:col-span-7 space-y-3">
                  {eventos.map((ev) => (
                    <div
                      key={ev.id}
                      className="bg-white p-4 rounded-2xl border border-light-outline/60 shadow-2xs flex flex-col sm:flex-row items-start gap-4"
                    >
                      <img
                        src={ev.imagenUrl}
                        alt={ev.titulo}
                        referrerPolicy="no-referrer"
                        className="w-full sm:w-28 h-24 rounded-xl object-cover shrink-0 bg-primary/10"
                      />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-headline text-[10px] font-bold uppercase">
                            {ev.tipo}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded font-headline text-[10px] font-bold ${
                              ev.estado === 'Activo'
                                ? 'bg-accent/15 text-accent'
                                : 'bg-secondary/15 text-secondary'
                            }`}
                          >
                            {ev.estado}
                          </span>
                          <span className="text-xs font-mono text-light-on-surface-container">
                            Cupo: {ev.cupoMaximo}
                          </span>
                        </div>

                        <h4 className="font-headline text-sm font-bold text-primary">
                          {ev.titulo}
                        </h4>
                        <p className="text-xs text-light-on-surface-container">
                          {ev.fechaEvento} · {ev.lugar}
                        </p>

                        <div className="pt-2 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleEventoEstado(ev)}
                            className="px-3 py-1 rounded-lg bg-light-surface-container text-primary font-headline text-[11px] font-bold hover:bg-primary/10 cursor-pointer"
                          >
                            {ev.estado === 'Activo'
                              ? 'Cerrar Convocatoria'
                              : 'Reabrir Convocatoria'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingEventoId(ev.id);
                              setEventoForm({
                                titulo: ev.titulo,
                                tipo: ev.tipo,
                                fechaEvento: ev.fechaEvento,
                                lugar: ev.lugar,
                                descripcion: ev.descripcion,
                                imagenUrl: ev.imagenUrl,
                                cupoMaximo: ev.cupoMaximo,
                                estado: ev.estado,
                                organizador: ev.organizador,
                                etiquetaCorta: ev.etiquetaCorta,
                              });
                            }}
                            className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-headline text-[11px] font-bold hover:bg-primary hover:text-white cursor-pointer"
                          >
                            Editar
                          </button>

                          {confirmDeleteId === ev.id ? (
                            <div className="inline-flex items-center gap-1.5 bg-secondary/10 px-2.5 py-1 rounded-lg">
                              <button
                                type="button"
                                onClick={() => handleDeleteEvento(ev.id)}
                                className="px-2 py-0.5 rounded bg-secondary text-white text-[11px] font-bold cursor-pointer"
                              >
                                Confirmar Eliminar
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-0.5 rounded bg-white text-primary text-[11px] cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(ev.id)}
                              className="px-3 py-1 rounded-lg bg-secondary/10 text-secondary font-headline text-[11px] font-bold hover:bg-secondary hover:text-white cursor-pointer"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* SUB-PESTAÑA: EDITOR DINÁMICO DE FACULTADES Y CARRERAS */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-light-outline/60 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-light-outline/40 pb-3">
                    <h2 className="font-headline text-title-lg font-bold text-primary">
                      {editingFacultadId
                        ? 'Editar Facultad y Carreras'
                        : 'Añadir Facultad UAGRM'}
                    </h2>
                    {editingFacultadId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingFacultadId(null);
                          setFacultadForm({
                            nombre: '',
                            carrerasTexto: '',
                            orden: facultades.length + 1,
                          });
                        }}
                        className="text-xs font-headline font-bold text-secondary hover:underline cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSaveFacultad} className="space-y-4">
                    <div>
                      <label className="block font-headline text-xs font-bold text-primary mb-1">
                        Nombre Oficial de la Facultad *
                      </label>
                      <input
                        type="text"
                        value={facultadForm.nombre}
                        onChange={(e) =>
                          setFacultadForm((p) => ({ ...p, nombre: e.target.value }))
                        }
                        placeholder="Ej. Facultad de Ciencias Exactas y Tecnología (FCET)"
                        className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-headline text-xs font-bold text-primary mb-1">
                        Lista de Carreras (Una carrera por línea) *
                      </label>
                      <textarea
                        rows={6}
                        value={facultadForm.carrerasTexto}
                        onChange={(e) =>
                          setFacultadForm((p) => ({
                            ...p,
                            carrerasTexto: e.target.value,
                          }))
                        }
                        placeholder={'Ingeniería Civil\nIngeniería Industrial\nIngeniería Sistemas'}
                        className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-xs font-body"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-5 rounded-xl bg-primary text-white font-headline text-sm font-bold hover:bg-secondary transition-colors cursor-pointer shadow"
                    >
                      {editingFacultadId ? 'Actualizar Facultad' : 'Guardar Facultad'}
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 space-y-3">
                  {facultades.map((fac) => (
                    <div
                      key={fac.id}
                      className="bg-white p-4 rounded-2xl border border-light-outline/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <h4 className="font-headline text-sm font-bold text-primary">
                          {fac.nombre}
                        </h4>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {fac.carreras.map((car) => (
                            <span
                              key={car}
                              className="px-2 py-0.5 rounded-md bg-light-surface-container text-[11px] text-primary border border-light-outline/40"
                            >
                              {car}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFacultadId(fac.id);
                            setFacultadForm({
                              nombre: fac.nombre,
                              carrerasTexto: fac.carreras.join('\n'),
                              orden: fac.orden,
                            });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-headline text-xs font-bold hover:bg-primary hover:text-white cursor-pointer"
                        >
                          Editar Carreras
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFacultad(fac.id)}
                          className="px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary font-headline text-xs font-bold hover:bg-secondary hover:text-white cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            SECCIÓN 3: PUBLICACIONES DE FACEBOOK (GALERÍA Y COMUNICADOS)
           ========================================================= */}
        {activeSection === 'facebook' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-light-outline/60 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-light-outline/40 pb-3">
                <h2 className="font-headline text-title-lg font-bold text-primary">
                  {editingFbId
                    ? 'Editar Publicación de Facebook'
                    : 'Nueva Publicación de Facebook'}
                </h2>
                {editingFbId && (
                  <button
                    type="button"
                    onClick={resetFbForm}
                    className="text-xs font-headline font-bold text-secondary hover:underline cursor-pointer"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveFbPost} className="space-y-4">
                <div>
                  <label className="block font-headline text-xs font-bold text-primary mb-1">
                    Título del Comunicado (`titulo`) *
                  </label>
                  <input
                    type="text"
                    value={fbForm.titulo}
                    onChange={(e) => setFbForm((p) => ({ ...p, titulo: e.target.value }))}
                    placeholder="Ej. Convocatoria Beca Comedor 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-light-outline text-sm"
                  />
                </div>

                <div>
                  <label className="block font-headline text-xs font-bold text-primary mb-1">
                    Fecha de Publicación (`fecha`) *
                  </label>
                  <input
                    type="text"
                    value={fbForm.fecha}
                    onChange={(e) => setFbForm((p) => ({ ...p, fecha: e.target.value }))}
                    placeholder="Ej. 16 de Noviembre, 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-light-outline text-sm"
                  />
                </div>

                <div>
                  <label className="block font-headline text-xs font-bold text-primary mb-1">
                    URL de la Imagen / Afiche (`imagenUrl`) *
                  </label>
                  <input
                    type="url"
                    value={fbForm.imagenUrl}
                    onChange={(e) =>
                      setFbForm((p) => ({ ...p, imagenUrl: e.target.value }))
                    }
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-light-outline text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block font-headline text-xs font-bold text-primary mb-1">
                    Enlace Original en Facebook (`facebookPostUrl`) *
                  </label>
                  <input
                    type="url"
                    value={fbForm.facebookPostUrl}
                    onChange={(e) =>
                      setFbForm((p) => ({ ...p, facebookPostUrl: e.target.value }))
                    }
                    placeholder="https://facebook.com/ful.uagrm"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-light-outline text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block font-headline text-xs font-bold text-primary mb-1">
                    Descripción Completa (`descripcionCompleta`) *
                  </label>
                  <textarea
                    rows={5}
                    value={fbForm.descripcionCompleta}
                    onChange={(e) =>
                      setFbForm((p) => ({
                        ...p,
                        descripcionCompleta: e.target.value,
                      }))
                    }
                    placeholder="Texto íntegro del comunicado oficial..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-light-outline text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-5 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white font-headline text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>
                    {editingFbId ? 'Guardar Cambios' : 'Publicar en Galería Facebook'}
                  </span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-4">
              {facebookPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-light-outline/60 shadow-2xs flex flex-col sm:flex-row items-start gap-4"
                >
                  <img
                    src={post.imagenUrl}
                    alt={post.titulo}
                    referrerPolicy="no-referrer"
                    className="w-full sm:w-28 h-28 rounded-xl object-cover shrink-0 bg-primary/10"
                  />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="text-xs text-[#1877F2] font-bold">{post.fecha}</div>
                    <h4 className="font-headline text-sm font-bold text-primary">
                      {post.titulo}
                    </h4>
                    <p className="text-xs text-light-on-surface-container line-clamp-2">
                      {post.descripcionCompleta}
                    </p>
                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onPreviewFacebookPost(post)}
                        className="px-3 py-1.5 rounded-lg bg-light-surface-container text-primary font-headline text-xs font-bold hover:bg-primary hover:text-white cursor-pointer"
                      >
                        Previsualizar Lightbox
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingFbId(post.id);
                          setFbForm({
                            titulo: post.titulo,
                            fecha: post.fecha,
                            imagenUrl: post.imagenUrl,
                            descripcionCompleta: post.descripcionCompleta,
                            facebookPostUrl: post.facebookPostUrl,
                          });
                        }}
                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-headline text-xs font-bold hover:bg-primary hover:text-white cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFbPost(post.id)}
                        className="px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary font-headline text-xs font-bold hover:bg-secondary hover:text-white cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            SECCIÓN 4: VIDEOS DE TIKTOK
           ========================================================= */}
        {activeSection === 'tiktok' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-light-outline/60 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-light-outline/40 pb-3">
                <h2 className="font-headline text-title-lg font-bold text-primary">
                  {editingTiktokId ? 'Editar Video de TikTok' : 'Agregar Video de TikTok'}
                </h2>
                {editingTiktokId && (
                  <button
                    type="button"
                    onClick={resetTiktokForm}
                    className="text-xs font-headline font-bold text-secondary hover:underline cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveTiktok} className="space-y-4">
                <div>
                  <label className="block font-headline text-xs font-bold text-primary mb-1">
                    Título o Descripción del Video (`titulo`) *
                  </label>
                  <input
                    type="text"
                    value={tiktokForm.titulo}
                    onChange={(e) =>
                      setTiktokForm((p) => ({ ...p, titulo: e.target.value }))
                    }
                    placeholder="Ej. ¡Defensa estudiantil en módulos facultativos!"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-light-outline text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-headline text-xs font-bold text-primary mb-1">
                      Cuenta Autora (`autorCuenta`) *
                    </label>
                    <input
                      type="text"
                      value={tiktokForm.autorCuenta}
                      onChange={(e) =>
                        setTiktokForm((p) => ({ ...p, autorCuenta: e.target.value }))
                      }
                      placeholder="@ful.uagrm"
                      className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-headline text-xs font-bold text-primary mb-1">
                      Categoría
                    </label>
                    <select
                      value={tiktokForm.categoria}
                      onChange={(e) =>
                        setTiktokForm((p) => ({ ...p, categoria: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm bg-white"
                    >
                      <option value="Gestión">Gestión</option>
                      <option value="Deportes">Deportes</option>
                      <option value="Cultura">Cultura</option>
                      <option value="Tutorial">Tutorial</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-headline text-xs font-bold text-primary mb-1">
                    URL del Video en TikTok (`tiktokUrl`) *
                  </label>
                  <input
                    type="url"
                    value={tiktokForm.tiktokUrl}
                    onChange={(e) =>
                      setTiktokForm((p) => ({ ...p, tiktokUrl: e.target.value }))
                    }
                    placeholder="https://www.tiktok.com/@ful.uagrm/video/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-light-outline text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block font-headline text-xs font-bold text-primary mb-1">
                    URL de Miniatura Vertical 9:16 (`miniaturaUrl`) *
                  </label>
                  <input
                    type="url"
                    value={tiktokForm.miniaturaUrl}
                    onChange={(e) =>
                      setTiktokForm((p) => ({ ...p, miniaturaUrl: e.target.value }))
                    }
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-light-outline text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block font-headline text-xs font-bold text-primary mb-1">
                    Vistas Formateadas
                  </label>
                  <input
                    type="text"
                    value={tiktokForm.vistas}
                    onChange={(e) =>
                      setTiktokForm((p) => ({ ...p, vistas: e.target.value }))
                    }
                    placeholder="Ej. 45.2K"
                    className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-5 rounded-xl bg-secondary text-white font-headline text-sm font-bold hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>
                    {editingTiktokId ? 'Guardar Video TikTok' : 'Añadir Video TikTok'}
                  </span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-3">
              {tiktokVideos.map((vid, index) => (
                <div
                  key={vid.id}
                  className="bg-white p-4 rounded-2xl border border-light-outline/60 shadow-2xs flex items-center gap-4"
                >
                  <img
                    src={vid.miniaturaUrl}
                    alt={vid.titulo}
                    referrerPolicy="no-referrer"
                    className="w-20 h-28 rounded-xl object-cover shrink-0 bg-primary/10"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-secondary">
                        #{index + 1}
                      </span>
                      <span className="font-mono text-primary font-semibold">
                        {vid.autorCuenta}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
                        {vid.categoria}
                      </span>
                    </div>
                    <h4 className="font-headline text-sm font-bold text-primary line-clamp-2">
                      {vid.titulo}
                    </h4>
                    <p className="text-[11px] font-mono text-light-on-surface-container truncate">
                      {vid.tiktokUrl}
                    </p>
                    <div className="pt-2 flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleReorderTiktok(index, -1)}
                        className="px-2.5 py-1 rounded bg-light-surface-container text-primary text-xs font-bold disabled:opacity-40 cursor-pointer"
                        title="Subir posición"
                      >
                        ↑ Subir
                      </button>
                      <button
                        type="button"
                        disabled={index === tiktokVideos.length - 1}
                        onClick={() => handleReorderTiktok(index, 1)}
                        className="px-2.5 py-1 rounded bg-light-surface-container text-primary text-xs font-bold disabled:opacity-40 cursor-pointer"
                        title="Bajar posición"
                      >
                        ↓ Bajar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTiktokId(vid.id);
                          setTiktokForm({
                            titulo: vid.titulo,
                            autorCuenta: vid.autorCuenta,
                            tiktokUrl: vid.tiktokUrl,
                            miniaturaUrl: vid.miniaturaUrl,
                            categoria: vid.categoria,
                            vistas: vid.vistas,
                            orden: vid.orden,
                          });
                        }}
                        className="px-3 py-1 rounded bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-white cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTiktok(vid.id)}
                        className="px-3 py-1 rounded bg-secondary/10 text-secondary text-xs font-bold hover:bg-secondary hover:text-white cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            SECCIÓN 5: ESTUDIANTES INSCRITOS, CONFIGURACIÓN Y ADMINS
           ========================================================= */}
        {activeSection === 'inscritos_config' && (
          <div className="space-y-8">
            {/* A. Tabla Filtrable de Estudiantes Inscritos + Exportar CSV */}
            <div className="bg-white p-6 rounded-2xl border border-light-outline/60 shadow-2xs space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-light-outline/40 pb-4">
                <div>
                  <h2 className="font-headline text-title-lg font-bold text-primary">
                    Registro de Estudiantes Inscritos ({filteredInscritos.length})
                  </h2>
                  <p className="text-xs text-light-on-surface-container">
                    Inscripciones recibidas en tiempo real desde el formulario público de convocatorias.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={filteredInscritos.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-accent text-white font-headline text-xs font-bold hover:bg-accent/90 disabled:opacity-50 transition-colors inline-flex items-center gap-2 shadow cursor-pointer self-start lg:self-auto"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Exportar a CSV (Excel)</span>
                </button>
              </div>

              {/* Controles de Filtro por Evento y Buscador */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-headline text-xs font-bold text-primary mb-1">
                    Filtrar por Convocatoria / Evento
                  </label>
                  <select
                    value={selectedEventFilter}
                    onChange={(e) => setSelectedEventFilter(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm bg-white"
                  >
                    <option value="Todos">Todos los Eventos ({inscritos.length})</option>
                    {eventos.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.titulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-headline text-xs font-bold text-primary mb-1">
                    Buscar Estudiante (Nombre, Registro UAGRM o Código)
                  </label>
                  <input
                    type="text"
                    value={inscritoSearch}
                    onChange={(e) => setInscritoSearch(e.target.value)}
                    placeholder="Ej. 221045892 o Carlos..."
                    className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm"
                  />
                </div>
              </div>

              {/* Tabla Responsiva */}
              {filteredInscritos.length === 0 ? (
                <div className="p-8 rounded-xl bg-light-surface-container text-center text-xs text-light-on-surface-container">
                  No hay estudiantes inscritos que coincidan con el filtro seleccionado.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-light-outline/60 bg-light-surface-container text-primary font-headline">
                        <th className="py-3 px-3">Código</th>
                        <th className="py-3 px-3">Estudiante</th>
                        <th className="py-3 px-3">Registro UAGRM</th>
                        <th className="py-3 px-3">Evento</th>
                        <th className="py-3 px-3">Facultad / Carrera</th>
                        <th className="py-3 px-3">WhatsApp</th>
                        <th className="py-3 px-3">Fecha</th>
                        <th className="py-3 px-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-light-outline/40">
                      {filteredInscritos.map((ins) => (
                        <tr key={ins.id} className="hover:bg-light-surface-container/50">
                          <td className="py-3 px-3 font-mono font-bold text-secondary">
                            {ins.codigoConfirmacion}
                          </td>
                          <td className="py-3 px-3 font-semibold text-primary">
                            {ins.nombre}
                          </td>
                          <td className="py-3 px-3 font-mono">{ins.registroUniversitario}</td>
                          <td className="py-3 px-3">{ins.eventoTitulo}</td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-primary">{ins.carrera}</div>
                            <div className="text-[11px] text-light-on-surface-container">
                              {ins.facultad}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono">+591 {ins.whatsapp}</td>
                          <td className="py-3 px-3 text-light-on-surface-container">
                            {ins.fechaRegistro}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteInscrito(ins.id)}
                              className="text-secondary hover:underline font-headline font-bold cursor-pointer"
                            >
                              Borrar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* B. Configuración General y Colaboradores Autorizados */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Formulario de Configuración Rápida */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-light-outline/60 shadow-2xs space-y-4">
                <h3 className="font-headline text-title-lg font-bold text-primary border-b border-light-outline/40 pb-3">
                  Configuración General de WhatsApp y Redes Oficiales
                </h3>

                <form onSubmit={handleSaveConfig} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-headline text-xs font-bold text-primary mb-1">
                        WhatsApp General FUL (con código 591)
                      </label>
                      <input
                        type="text"
                        value={configForm.whatsappGeneral}
                        onChange={(e) =>
                          setConfigForm((p) => ({
                            ...p,
                            whatsappGeneral: e.target.value,
                          }))
                        }
                        placeholder="59175562627"
                        className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-headline text-xs font-bold text-primary mb-1">
                        WhatsApp Defensoría Estudiantil
                      </label>
                      <input
                        type="text"
                        value={configForm.whatsappDefensoria}
                        onChange={(e) =>
                          setConfigForm((p) => ({
                            ...p,
                            whatsappDefensoria: e.target.value,
                          }))
                        }
                        placeholder="59175562627"
                        className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-headline text-xs font-bold text-primary mb-1">
                        URL Facebook Oficial
                      </label>
                      <input
                        type="url"
                        value={configForm.facebookUrl}
                        onChange={(e) =>
                          setConfigForm((p) => ({ ...p, facebookUrl: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-light-outline text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-headline text-xs font-bold text-primary mb-1">
                        URL TikTok Oficial
                      </label>
                      <input
                        type="url"
                        value={configForm.tiktokUrl}
                        onChange={(e) =>
                          setConfigForm((p) => ({ ...p, tiktokUrl: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-light-outline text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-headline text-xs font-bold text-primary mb-1">
                        URL Instagram Oficial
                      </label>
                      <input
                        type="url"
                        value={configForm.instagramUrl}
                        onChange={(e) =>
                          setConfigForm((p) => ({ ...p, instagramUrl: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl border border-light-outline text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-headline text-xs font-bold text-primary mb-1">
                        Correo Institucional
                      </label>
                      <input
                        type="email"
                        value={configForm.emailContacto}
                        onChange={(e) =>
                          setConfigForm((p) => ({ ...p, emailContacto: e.target.value }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-headline text-xs font-bold text-primary mb-1">
                        Horario de Atención
                      </label>
                      <input
                        type="text"
                        value={configForm.horarioAtencion}
                        onChange={(e) =>
                          setConfigForm((p) => ({
                            ...p,
                            horarioAtencion: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-headline text-xs font-bold text-primary mb-1">
                      Dirección en Campus Universitario
                    </label>
                    <input
                      type="text"
                      value={configForm.direccionCampus}
                      onChange={(e) =>
                        setConfigForm((p) => ({ ...p, direccionCampus: e.target.value }))
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-5 rounded-xl bg-primary text-white font-headline text-sm font-bold hover:bg-secondary transition-colors cursor-pointer shadow"
                  >
                    Guardar Configuración del Portal
                  </button>
                </form>
              </div>

              {/* Gestión de Colaboradores Autorizados (Colección "admins") */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-light-outline/60 shadow-2xs space-y-4">
                <h3 className="font-headline text-title-lg font-bold text-primary border-b border-light-outline/40 pb-3">
                  Administradores Autorizados (`admins`)
                </h3>

                <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 text-xs space-y-1">
                  <span className="font-headline font-bold text-primary block">
                    Administrador Principal:
                  </span>
                  <span className="font-mono text-secondary">{PRIMARY_ADMIN_EMAIL}</span>
                </div>

                <form onSubmit={handleAddCollaboratorAdmin} className="space-y-3">
                  <div>
                    <label className="block font-headline text-xs font-bold text-primary mb-1">
                      Correo Google del Colaborador *
                    </label>
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="colaborador@gmail.com"
                      className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-headline text-xs font-bold text-primary mb-1">
                      Nombre / Secretaría en la FUL *
                    </label>
                    <input
                      type="text"
                      value={newAdminNombre}
                      onChange={(e) => setNewAdminNombre(e.target.value)}
                      placeholder="Ej. Sec. Académica FUL"
                      className="w-full px-3.5 py-2 rounded-xl border border-light-outline text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-secondary text-white font-headline text-xs font-bold hover:bg-secondary/90 transition-colors cursor-pointer"
                  >
                    Autorizar Colaborador en /admin
                  </button>
                </form>

                <div className="space-y-2 pt-2">
                  {adminsList.map((adm) => (
                    <div
                      key={adm.id}
                      className="p-3 rounded-xl bg-light-surface-container border border-light-outline/50 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-primary truncate">{adm.nombre}</div>
                        <div className="font-mono text-[11px] text-light-on-surface-container truncate">
                          {adm.email}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCollaboratorAdmin(adm.id)}
                        className="text-secondary font-headline font-bold hover:underline shrink-0 cursor-pointer"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
