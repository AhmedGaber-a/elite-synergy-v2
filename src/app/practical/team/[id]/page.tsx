import { redirect } from 'next/navigation';

export default function PracticalTeamIdRedirect({ params }: { params: { id: string } }) {
  redirect(`/practical/${params.id}`);
}
