import { PageHeader } from "@/components/page-header";
import { StudentEnrollmentForm } from "@/components/student-enrollment-form";
import { requireSession } from "@/lib/auth";

export default async function NewStudentPage() {
  await requireSession(["admin"]);
  return <><PageHeader title="Registrar alumno" description="Enrolamiento con consentimiento, verificación de vida y tres muestras faciales." /><StudentEnrollmentForm /></>;
}
