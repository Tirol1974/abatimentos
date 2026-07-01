import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDate(date: string | Date) {
  return format(
    typeof date === "string" ? parseISO(date) : date,
    "dd/MM/yyyy",
    { locale: ptBR }
  );
}

export function formatDateTime(date: string | Date) {
  return format(
    typeof date === "string" ? parseISO(date) : date,
    "dd/MM/yyyy HH:mm",
    { locale: ptBR }
  );
}

export function formatLongDate(date: string | Date) {
  return format(
    typeof date === "string" ? parseISO(date) : date,
    "dd 'de' MMMM 'de' yyyy",
    { locale: ptBR }
  );
}