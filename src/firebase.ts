import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  EventCategory,
  EventItem,
  FACEBOOK_POSTS,
  FacebookPostItem,
  FacultyOption,
  NewsItem,
  OFFICIAL_FACEBOOK_URL,
  OFFICIAL_WHATSAPP_NUMBER,
  PORTAL_EVENTS,
  PORTAL_NEWS,
  ReelItem,
  resolveEventImage,
  TIKTOK_REELS,
  UAGRM_FACULTIES,
} from './data/portalData';

// Primary bootstrapped administrator email
export const PRIMARY_ADMIN_EMAIL = 'leonardoquisbert@gmail.com';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export {
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
};
export type { User };

// ===============================================================
// Mandatory Error Handling & Connection Test
// ===============================================================

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'configuracion', 'general'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// ===============================================================
// Firestore Document Interfaces (Matching firebase-blueprint.json)
// ===============================================================

export interface FirestoreNoticia {
  id: string;
  titulo: string;
  categoria: 'Proyección Social' | 'Gestión' | 'Infraestructura' | 'Académico';
  fecha: string;
  resumen: string;
  contenidoCompleto: string;
  imagenUrl: string;
  destacada: boolean;
  archivada: boolean;
  autor: string;
  impactos: string[];
}

export interface FirestoreEvento {
  id: string;
  titulo: string;
  tipo: 'Deportivo' | 'Académico' | 'Cultural' | 'Innovación y Negocios';
  fechaEvento: string;
  lugar: string;
  descripcion: string;
  imagenUrl: string;
  cupoMaximo: number;
  estado: 'Activo' | 'Cerrado';
  organizador: string;
  etiquetaCorta: string;
}

export interface FirestoreTikTokVideo {
  id: string;
  titulo: string;
  autorCuenta: string;
  tiktokUrl: string;
  miniaturaUrl: string;
  categoria: string;
  vistas: string;
  orden: number;
}

export interface FirestoreFacultad {
  id: string;
  nombre: string;
  carreras: string[];
  orden: number;
}

export interface PortalConfig {
  whatsappGeneral: string;
  whatsappDefensoria: string;
  facebookUrl: string;
  tiktokUrl: string;
  instagramUrl: string;
  emailContacto: string;
  direccionCampus: string;
  horarioAtencion: string;
}

export interface FirestoreInscrito {
  id: string;
  codigoConfirmacion: string;
  eventoId: string;
  eventoTitulo: string;
  nombre: string;
  registroUniversitario: string;
  facultad: string;
  carrera: string;
  whatsapp: string;
  fechaRegistro: string;
}

export interface FirestoreAdminUser {
  id: string;
  email: string;
  nombre: string;
  agregadoPor: string;
  fechaAlta: string;
}

export const DEFAULT_PORTAL_CONFIG: PortalConfig = {
  whatsappGeneral: OFFICIAL_WHATSAPP_NUMBER,
  whatsappDefensoria: OFFICIAL_WHATSAPP_NUMBER,
  facebookUrl: OFFICIAL_FACEBOOK_URL,
  tiktokUrl: 'https://tiktok.com/@ful.uagrm',
  instagramUrl: 'https://instagram.com/ful.uagrm',
  emailContacto: 'contacto@ful-uagrm.edu.bo',
  direccionCampus:
    'Ciudad Universitaria (Campus), Av. Busch y 2do Anillo, Santa Cruz de la Sierra, Bolivia.',
  horarioAtencion: 'Lun a Vie: 08:00 – 18:30 (Atención continua)',
};

export function buildDynamicWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanNumber = phoneNumber.replace(/\D/g, '') || OFFICIAL_WHATSAPP_NUMBER;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

// ===============================================================
// Adapters between Firestore Docs and Portal UI Models
// ===============================================================

export function mapFirestoreNoticiaToNewsItem(docData: FirestoreNoticia): NewsItem {
  const categoryBg: 'accent' | 'primary' | 'secondary' =
    docData.categoria === 'Proyección Social'
      ? 'accent'
      : docData.categoria === 'Gestión'
      ? 'primary'
      : 'secondary';

  const paragraphs = docData.contenidoCompleto
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return {
    id: docData.id,
    title: docData.titulo,
    category: docData.categoria,
    categoryBg,
    date: docData.fecha,
    readTime: '3 min de lectura',
    author: docData.autor || 'Dirección de Comunicación FUL UAGRM',
    summary: docData.resumen,
    image: docData.imagenUrl,
    fullContent: paragraphs.length > 0 ? paragraphs : [docData.contenidoCompleto],
    keyImpacts:
      docData.impactos && docData.impactos.length > 0
        ? docData.impactos
        : [
            'Gestión transparente y verificable a favor del estamento estudiantil moreniano',
            'Participación abierta de las 18 facultades y unidades integrales de la UAGRM',
          ],
    featuredInHome: docData.destacada && !docData.archivada,
  };
}

export function mapFirestoreEventoToEventItem(docData: FirestoreEvento): EventItem {
  const categoryMap: Record<FirestoreEvento['tipo'], EventCategory> = {
    Deportivo: 'Deporte',
    Académico: 'Académico',
    Cultural: 'Cultura',
    'Innovación y Negocios': 'Innovación y Negocios',
  };
  const category = categoryMap[docData.tipo] || 'Académico';
  const categoryColor: 'secondary' | 'accent' | 'primary' =
    category === 'Innovación y Negocios'
      ? 'accent'
      : category === 'Académico'
      ? 'primary'
      : 'secondary';

  const badgeIcon =
    category === 'Deporte'
      ? 'sports_soccer'
      : category === 'Cultura'
      ? 'theater_comedy'
      : category === 'Innovación y Negocios'
      ? 'storefront'
      : 'school';

  return {
    id: docData.id,
    title: docData.titulo,
    category,
    categoryColor,
    badgeIcon,
    badgeText:
      docData.estado === 'Cerrado'
        ? 'Cerrado'
        : docData.etiquetaCorta || `${docData.cupoMaximo} Cupos`,
    badgeBg: docData.estado === 'Cerrado' ? 'primary' : category === 'Académico' ? 'accent' : 'primary',
    dateLabel: docData.fechaEvento,
    shortDate: docData.fechaEvento,
    description: docData.descripcion,
    image: resolveEventImage(docData.imagenUrl, category, `${docData.id} ${docData.titulo}`),
    location: docData.lugar,
    organizer: docData.organizador,
    quota: `${docData.cupoMaximo} cupos habilitados (${docData.estado})`,
    requirements: [
      'Estudiante regular matriculado en la presente gestión académica de la UAGRM',
      'Presentar Registro Universitario activo (8 o 9 dígitos) y Cédula de Identidad',
    ],
    benefits: [
      'Acreditación y certificación institucional avalada por la FUL UAGRM 2026–2028',
      'Participación 100% gratuita para el estamento estudiantil moreniano',
    ],
    basesSummary: docData.descripcion,
    featuredInHome: docData.estado === 'Activo',
  };
}

export function mapFirestoreTikTokToReelItem(docData: FirestoreTikTokVideo): ReelItem {
  const validCategories = ['Gestión', 'Deportes', 'Cultura', 'Tutorial'] as const;
  const cat = validCategories.includes(docData.categoria as (typeof validCategories)[number])
    ? (docData.categoria as ReelItem['category'])
    : 'Gestión';

  const categoryBg: 'primary' | 'secondary' | 'accent' =
    cat === 'Deportes' ? 'secondary' : cat === 'Cultura' ? 'accent' : 'primary';

  return {
    id: docData.id,
    title: docData.titulo,
    caption: docData.titulo,
    category: cat,
    categoryBg,
    views: docData.vistas || '15.2K',
    likes: '3.4K',
    comments: '240',
    duration: '00:55',
    publishedAt: docData.autorCuenta || '@ful.uagrm',
    image: docData.miniaturaUrl,
    tiktokUrl: docData.tiktokUrl,
    highlights: [
      `Publicado por ${docData.autorCuenta || '@ful.uagrm'}`,
      'Cobertura oficial de actividades estudiantiles de la Gestión 2026–2028',
      'Haz clic en el botón inferior para ver el video original en TikTok',
    ],
    featuredInHome: true,
  };
}

// ===============================================================
// Initial Seed Helper (Populates Firestore when Admin first logs in)
// ===============================================================

export async function seedInitialPortalDataIfEmpty(): Promise<void> {
  // 1. Seed Configuracion
  try {
    const configRef = doc(db, 'configuracion', 'general');
    const configSnap = await getDoc(configRef);
    if (!configSnap.exists()) {
      await setDoc(configRef, DEFAULT_PORTAL_CONFIG);
    }
  } catch (err) {
    console.warn('Skipping config seed:', err);
  }

  // 2. Seed Noticias
  try {
    const noticiasSnap = await getDocs(collection(db, 'noticias'));
    if (noticiasSnap.empty) {
      for (const n of PORTAL_NEWS) {
        const docId = n.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        const payload: Omit<FirestoreNoticia, 'id'> = {
          titulo: n.title,
          categoria: n.category,
          fecha: n.date,
          resumen: n.summary,
          contenidoCompleto: n.fullContent.join('\n\n'),
          imagenUrl: n.image,
          destacada: n.featuredInHome,
          archivada: false,
          autor: n.author,
          impactos: n.keyImpacts.slice(0, 10),
        };
        await setDoc(doc(db, 'noticias', docId), payload);
      }
    }
  } catch (err) {
    console.warn('Skipping noticias seed:', err);
  }

  // 3. Seed Eventos
  try {
    const eventosSnap = await getDocs(collection(db, 'eventos'));
    if (eventosSnap.empty) {
      for (const ev of PORTAL_EVENTS) {
        const docId = ev.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        const tipoMap: Record<EventCategory, FirestoreEvento['tipo']> = {
          Deporte: 'Deportivo',
          Académico: 'Académico',
          Cultura: 'Cultural',
          'Innovación y Negocios': 'Innovación y Negocios',
        };
        const payload: Omit<FirestoreEvento, 'id'> = {
          titulo: ev.title,
          tipo: tipoMap[ev.category] || 'Académico',
          fechaEvento: ev.dateLabel,
          lugar: ev.location,
          descripcion: ev.description,
          imagenUrl: ev.image,
          cupoMaximo: 120,
          estado: 'Activo',
          organizador: ev.organizer,
          etiquetaCorta: ev.badgeText,
        };
        await setDoc(doc(db, 'eventos', docId), payload);
      }
    }
  } catch (err) {
    console.warn('Skipping eventos seed:', err);
  }

  // 4. Seed Facebook Posts
  try {
    const fbSnap = await getDocs(collection(db, 'facebook_posts'));
    if (fbSnap.empty) {
      for (const post of FACEBOOK_POSTS) {
        const docId = post.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        const payload: Omit<FacebookPostItem, 'id'> = {
          titulo: post.titulo,
          fecha: post.fecha,
          imagenUrl: post.imagenUrl,
          descripcionCompleta: post.descripcionCompleta,
          facebookPostUrl: post.facebookPostUrl,
        };
        await setDoc(doc(db, 'facebook_posts', docId), payload);
      }
    }
  } catch (err) {
    console.warn('Skipping facebook_posts seed:', err);
  }

  // 5. Seed TikTok Videos
  try {
    const tiktokSnap = await getDocs(collection(db, 'tiktok_videos'));
    if (tiktokSnap.empty) {
      for (let i = 0; i < TIKTOK_REELS.length; i++) {
        const r = TIKTOK_REELS[i];
        const docId = r.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        const payload: Omit<FirestoreTikTokVideo, 'id'> = {
          titulo: r.caption,
          autorCuenta: '@ful.uagrm',
          tiktokUrl: r.tiktokUrl,
          miniaturaUrl: r.image,
          categoria: r.category,
          vistas: r.views,
          orden: i + 1,
        };
        await setDoc(doc(db, 'tiktok_videos', docId), payload);
      }
    }
  } catch (err) {
    console.warn('Skipping tiktok_videos seed:', err);
  }

  // 6. Seed Facultades
  try {
    const facSnap = await getDocs(collection(db, 'facultades'));
    if (facSnap.empty) {
      for (let i = 0; i < UAGRM_FACULTIES.length; i++) {
        const f: FacultyOption = UAGRM_FACULTIES[i];
        const docId = f.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        const payload: Omit<FirestoreFacultad, 'id'> = {
          nombre: f.name,
          carreras: f.careers.slice(0, 25),
          orden: i + 1,
        };
        await setDoc(doc(db, 'facultades', docId), payload);
      }
    }
  } catch (err) {
    console.warn('Skipping facultades seed:', err);
  }
}
