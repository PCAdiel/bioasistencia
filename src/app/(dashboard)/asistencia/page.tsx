import { AttendanceScanner } from "@/components/attendance-scanner";
import { PageHeader } from "@/components/page-header";

export default function AttendancePage() {
  return <><PageHeader title="Marcar asistencia" description="Reconocimiento en el navegador, verificación de parpadeo y registro seguro de entrada o salida." /><AttendanceScanner /></>;
}
