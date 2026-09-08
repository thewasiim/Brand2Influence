import { adminDb } from '../config/supabase.js'

async function confirmAllUsers() {
  try {
    const db = adminDb()
    console.log('Fetching all users from Supabase Auth...')
    const { data: { users }, error } = await db.auth.admin.listUsers()

    if (error) {
      console.error('Error fetching users:', error.message)
      process.exit(1)
    }

    console.log(`Found ${users.length} user(s) in Auth.`)

    for (const u of users) {
      if (!u.email_confirmed_at) {
        console.log(`Confirming email for ${u.email}...`)
        const { error: updateError } = await db.auth.admin.updateUserById(u.id, { email_confirm: true })
        if (updateError) {
          console.error(`Failed to confirm ${u.email}:`, updateError.message)
        } else {
          console.log(`✅ Confirmed email for ${u.email}`)
        }
      } else {
        console.log(`User ${u.email} is already confirmed.`)
      }
    }
  } catch (err) {
    console.error('Script error:', err.message)
  }
}

confirmAllUsers()
