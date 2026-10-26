import "server-only";

import { hasStaffAccess } from "@/lib/staff-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Uses the service client only after the signed passcode session is verified. */
export async function createAdminDataClient() {
  return (await hasStaffAccess()) ? createAdminClient() : await createClient();
}
