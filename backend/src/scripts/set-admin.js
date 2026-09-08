import { adminDb } from '../config/supabase.js'

const email = process.argv[2] || '180rewire@gmail.com'

async function promoteToAdmin() {
  const db = adminDb()
  console.log(`Looking for user with email: ${email}...`)

  // 1. Check in auth users
  const { data: { users }, error: authError } = await db.auth.admin.listUsers()
  if (authError) {
    console.error('Error fetching auth users:', authError.message)
    process.exit(1)
  }

  const authUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!authUser) {
    console.error(`No user found with email "${email}" in Supabase Auth. Please sign up first.`)
    process.exit(1)
  }

  // 2. Ensure email is confirmed
  if (!authUser.email_confirmed_at) {
    await db.auth.admin.updateUserById(authUser.id, { email_confirm: true })
    console.log(`Auto-confirmed email for ${email}.`)
  }

  // 3. Upsert user in public.users with role = 'admin'
  const { data, error: dbError } = await db
    .from('users')
    .upsert(
      {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || authUser.email.split('@')[0],
        role: 'admin',
        profile_status: 'active',
        is_disabled: false,
      },
      { onConflict: 'id' }
    )
    .select()
    .single()

  if (dbError) {
    console.error('Error updating public.users table:', dbError.message)
    process.exit(1)
  }

  console.log(`✅ Success! User "${data.email}" (ID: ${data.id}) is now an ADMIN.`)
  console.log('You can now log in and access the Admin Portal at /admin.')
}

promoteToAdmin()
