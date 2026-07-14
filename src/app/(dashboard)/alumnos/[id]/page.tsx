import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { StudentEditForm } from "@/components/student-edit-form";
import { requireSession } from "@/lib/auth";
import { getSql } from "@/lib/db";

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession(["admin"]);
  const { id } = await params;
  const rows = await getSql()`SELECT s.*, (b.id IS NOT NULL) AS has_biometric FROM students s LEFT JOIN biometric_templates b ON b.student_id = s.id WHERE s.id = ${id} LIMIT 1`;
  if (!rows[0]) notFound();
  const student = rows[0];
  return <><PageHeader title="Editar alumno" description={`${student.last_names}, ${student.first_names} · ${student.institutional_code}`} /><StudentEditForm student={{ id: String(student.id), dni: String(student.dni), institutional_code: String(student.institutional_code), first_names: String(student.first_names), last_names: String(student.last_names), status: String(student.status), has_biometric: Boolean(student.has_biometric) }} /></>;
}
