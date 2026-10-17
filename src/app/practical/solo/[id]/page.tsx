import { redirect } from 'next/navigation';

export default function PracticalSoloIdRedirect({ params }: { params: { id: string } }) {
  redirect(`/practical/${params.id}`);
}
