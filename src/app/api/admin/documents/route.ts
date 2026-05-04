import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const REQUIRED_PER_CHILD = ["emergency_contact", "medical_authorization", "immunization_records"];
const REQUIRED_FAMILY = ["authorized_pickup"];

export async function GET(_req: NextRequest) {
  const [parentsResult, childrenResult, docsResult] = await Promise.all([
    pool.query(
      `SELECT DISTINCT u.user_id, u.first_name, u.last_name
       FROM users u
       JOIN parent_child_relationships pcr ON pcr.parent_user_id = u.user_id
       ORDER BY u.last_name, u.first_name`
    ),
    pool.query(
      `SELECT pcr.parent_user_id, ch.child_id, ch.first_name, ch.last_name
       FROM parent_child_relationships pcr
       JOIN children ch ON ch.child_id = pcr.child_id
       ORDER BY ch.first_name`
    ),
    pool.query(
      `SELECT parent_user_id, child_id, document_type, status FROM parent_documents`
    ),
  ]);

  const childrenByParent = new Map<number, { child_id: number; first_name: string; last_name: string }[]>();
  for (const row of childrenResult.rows) {
    if (!childrenByParent.has(row.parent_user_id)) childrenByParent.set(row.parent_user_id, []);
    childrenByParent.get(row.parent_user_id)!.push(row);
  }

  const uploadedByParent = new Map<number, { child_id: number | null; document_type: string }[]>();
  for (const row of docsResult.rows) {
    if (!uploadedByParent.has(row.parent_user_id)) uploadedByParent.set(row.parent_user_id, []);
    uploadedByParent.get(row.parent_user_id)!.push(row);
  }

  const result = parentsResult.rows.map((parent) => {
    const children = childrenByParent.get(parent.user_id) ?? [];
    const uploaded = uploadedByParent.get(parent.user_id) ?? [];

    const childRows = children.map((child) => {
      const docs: Record<string, boolean> = {};
      for (const type of REQUIRED_PER_CHILD) {
        docs[type] = uploaded.some((d) => d.child_id === child.child_id && d.document_type === type);
      }
      return { child_id: child.child_id, name: `${child.first_name} ${child.last_name}`, docs };
    });

    const familyDocs: Record<string, boolean> = {};
    for (const type of REQUIRED_FAMILY) {
      familyDocs[type] = uploaded.some((d) => d.child_id === null && d.document_type === type);
    }

    const totalRequired = children.length * REQUIRED_PER_CHILD.length + REQUIRED_FAMILY.length;
    const totalComplete =
      childRows.reduce((sum, c) => sum + Object.values(c.docs).filter(Boolean).length, 0) +
      Object.values(familyDocs).filter(Boolean).length;

    return {
      parent_id: parent.user_id,
      parent_name: `${parent.first_name} ${parent.last_name}`,
      children: childRows,
      family_docs: familyDocs,
      total_required: totalRequired,
      total_complete: totalComplete,
    };
  });

  return NextResponse.json(result);
}
