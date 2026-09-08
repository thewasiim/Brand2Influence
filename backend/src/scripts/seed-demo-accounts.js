import { adminDb } from '../config/supabase.js'

const DEMO_USERS = [
  {
    email: 'admin@brand2influence.com',
    password: 'admin123',
    name: 'System Admin',
    role: 'admin',
  },
  {
    email: 'brand@brand2influence.com',
    password: 'brand123',
    name: 'Blue Tokai Roasters',
    role: 'brand',
    brandProfile: {
      business_name: 'Blue Tokai Coffee Roasters',
      business_type: 'Food & Beverage',
      location: 'Mumbai',
      budget_range: '₹5,000–₹25,000',
    },
  },
  {
    email: 'influencer@brand2influence.com',
    password: 'creator123',
    name: 'Aanya Kapoor',
    role: 'influencer',
    influencerProfile: {
      niche: 'Fashion & Lifestyle',
      location: 'Mumbai',
      bio: 'Sustainable fashion stylist and aesthetic routine creator based in Mumbai.',
      starting_rate: 4500,
      followers_count: 185000,
    },
  },
]

async function seedDemoAccounts() {
  const db = adminDb()
  console.log('🚀 Seeding sample demo accounts for Admin, Brand, and Influencer...')

  // 1. Demote 180rewire@gmail.com from admin
  console.log('Updating 180rewire@gmail.com role to regular user...')
  await db.from('users').update({ role: 'influencer' }).eq('email', '180rewire@gmail.com')

  // 2. Fetch existing auth users
  const { data: { users: existingAuthUsers }, error: fetchError } = await db.auth.admin.listUsers()
  if (fetchError) {
    console.error('Error fetching existing auth users:', fetchError.message)
    process.exit(1)
  }

  for (const demo of DEMO_USERS) {
    console.log(`\nProcessing ${demo.role.toUpperCase()}: ${demo.email}...`)

    let authUser = existingAuthUsers.find(u => u.email.toLowerCase() === demo.email.toLowerCase())

    if (!authUser) {
      console.log(`Creating Auth user for ${demo.email}...`)
      const { data: createData, error: createError } = await db.auth.admin.createUser({
        email: demo.email,
        password: demo.password,
        email_confirm: true,
        user_metadata: { name: demo.name },
      })
      if (createError) {
        console.error(`Error creating ${demo.email}:`, createError.message)
        continue
      }
      authUser = createData.user
    } else {
      console.log(`Updating password & confirming ${demo.email}...`)
      const { data: updateData, error: updateError } = await db.auth.admin.updateUserById(authUser.id, {
        password: demo.password,
        email_confirm: true,
        user_metadata: { name: demo.name },
      })
      if (updateError) {
        console.error(`Error updating ${demo.email}:`, updateError.message)
      } else {
        authUser = updateData.user
      }
    }

    // Upsert into public.users table
    const { error: userUpsertError } = await db.from('users').upsert(
      {
        id: authUser.id,
        email: authUser.email,
        name: demo.name,
        role: demo.role,
        profile_status: 'active',
        is_disabled: false,
      },
      { onConflict: 'id' }
    )

    if (userUpsertError) {
      console.error(`Error upserting public.users for ${demo.email}:`, userUpsertError.message)
      continue
    }

    // Upsert role profile if applicable
    if (demo.role === 'brand' && demo.brandProfile) {
      await db.from('brand_profiles').upsert({
        user_id: authUser.id,
        ...demo.brandProfile,
      }, { onConflict: 'user_id' })
    }

    if (demo.role === 'influencer' && demo.influencerProfile) {
      await db.from('influencer_profiles').upsert({
        user_id: authUser.id,
        ...demo.influencerProfile,
      }, { onConflict: 'user_id' })
    }

    console.log(`✅ ${demo.role.toUpperCase()} account ready! Email: ${demo.email} | Password: ${demo.password}`)
  }

  console.log('\n🎉 All demo accounts successfully created & confirmed!')
}

seedDemoAccounts()
