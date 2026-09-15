"use client";

import { useActionState } from "react";
import { updateAdminRoleAction, type ActionState } from "@/lib/actions/adminSecurity";

export function UpdateAdminRoleForm({ adminId, role, status }: { adminId: string; role: string; status: string }) {
  const [, formAction] = useActionState<ActionState, FormData>(updateAdminRoleAction, undefined);
  return (
    <form action={formAction} className="flex gap-1">
      <input type="hidden" name="adminId" value={adminId} />
      <select name="role" defaultValue={role} className="border border-neutral-300 rounded text-xs px-1 py-1">
        <option value="STAFF">STAFF</option>
        <option value="MANAGER">MANAGER</option>
        <option value="SUPER">SUPER</option>
      </select>
      <select name="status" defaultValue={status} className="border border-neutral-300 rounded text-xs px-1 py-1">
        <option value="ACTIVE">ACTIVE</option>
        <option value="DISABLED">DISABLED</option>
      </select>
      <button className="text-xs bg-neutral-900 text-white px-2 py-1 rounded">저장</button>
    </form>
  );
}
