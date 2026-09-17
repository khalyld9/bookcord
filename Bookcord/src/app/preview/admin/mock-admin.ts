import type { ReservationStatus } from "@/types/database";

export const mockStats = {
  totalBooks: 4,
  totalStock: 30,
  availableStock: 21,
  issuedBooks: 6,
  openReservations: 3,
  readyReservations: 1,
  lowStock: 1,
  outOfStock: 1,
  activeUsers: 24,
};

export type MockReservation = {
  id: string;
  code: string;
  quantity: number;
  status: ReservationStatus;
  placed: string;
  student: string;
  studentId: string;
  title: string;
};

export const mockReservations: MockReservation[] = [
  {
    id: "r1",
    code: "8F3A21C9",
    quantity: 1,
    status: "PENDING",
    placed: "Sep 16, 2026",
    student: "Juan Dela Cruz",
    studentId: "2026-00123",
    title: "Filipino sa Piling Larang Tech-Voc",
  },
  {
    id: "r2",
    code: "1B77E04D",
    quantity: 1,
    status: "READY",
    placed: "Sep 15, 2026",
    student: "Maria Santos",
    studentId: "2026-00087",
    title: "21st Century Literature from the Philippines and the World",
  },
  {
    id: "r3",
    code: "C41D9A02",
    quantity: 1,
    status: "CLAIMED",
    placed: "Sep 12, 2026",
    student: "Angelo Reyes",
    studentId: "2026-00210",
    title: "Filipino sa Piling Larang Tech-Voc",
  },
  {
    id: "r4",
    code: "5E02B77A",
    quantity: 1,
    status: "CANCELLED",
    placed: "Sep 10, 2026",
    student: "Bea Villanueva",
    studentId: "2026-00154",
    title: "Blank Test Book",
  },
];

export type MockInventory = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  subject: string;
  available: number;
  out: number;
  total: number;
  minimum: number;
};

export const mockInventory: MockInventory[] = [
  {
    id: "b1",
    title: "21st Century Literature from the Philippines and the World",
    author: "Paulin",
    isbn: "978-621-8000-02-8",
    subject: "Literature",
    available: 9,
    out: 1,
    total: 10,
    minimum: 2,
  },
  {
    id: "b2",
    title: "Filipino sa Piling Larang Tech-Voc",
    author: "De Castro",
    isbn: "978-621-8000-01-1",
    subject: "Filipino",
    available: 1,
    out: 5,
    total: 10,
    minimum: 2,
  },
  {
    id: "b3",
    title: "Blank Test Book",
    author: "Bookcords Team",
    isbn: "—",
    subject: "—",
    available: 0,
    out: 0,
    total: 0,
    minimum: 1,
  },
];

export type MockCheckout = {
  id: string;
  student: string;
  studentId: string;
  title: string;
  outNow: number;
  quantity: number;
  issued: string;
  due: string;
  overdue: boolean;
};

export const mockCheckouts: MockCheckout[] = [
  {
    id: "c1",
    student: "Angelo Reyes",
    studentId: "2026-00210",
    title: "Filipino sa Piling Larang Tech-Voc",
    outNow: 1,
    quantity: 1,
    issued: "Sep 12, 2026",
    due: "Sep 26, 2026",
    overdue: false,
  },
  {
    id: "c2",
    student: "Katrina Lim",
    studentId: "2026-00045",
    title: "Filipino sa Piling Larang Tech-Voc",
    outNow: 1,
    quantity: 1,
    issued: "Aug 30, 2026",
    due: "Sep 13, 2026",
    overdue: true,
  },
];
