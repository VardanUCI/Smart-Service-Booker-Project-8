import { getCurrentAccount } from '@/lib/auth/server';
import { getDevAccountFromRequest } from '@/lib/auth/dev-auth';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const devAccount = getDevAccountFromRequest(request);

  if (devAccount) {
    return NextResponse.json({
      user: {
        id: devAccount.id,
        email: devAccount.email,
        role: devAccount.role,
        emailVerified: devAccount.emailVerified,
        onboardingCompleted: devAccount.onboardingCompleted,
      },
    });
  }

  const supabase = await createClient();
  const account = await getCurrentAccount(supabase);

  if (!account) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({
    user: {
      id: account.user.id,
      email: account.user.email,
      role: account.role,
      emailVerified: account.emailVerified,
      onboardingCompleted: account.onboardingCompleted,
    },
  });
}
