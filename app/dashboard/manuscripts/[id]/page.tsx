import { redirect } from "next/navigation";

/**
 * Legacy dashboard URL — kept alive as a permanent redirect to the rich
 * status view. The /status/[jobId] page is the canonical post-upload
 * surface: live pipeline timeline, executive summary, FAQ, contact card.
 */
export default function ManuscriptRedirect({ params }: { params: { id: string } }) {
  redirect(`/status/${params.id}`);
}
