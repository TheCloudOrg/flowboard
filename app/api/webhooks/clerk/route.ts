import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'

// Use service role key for admin operations (bypasses RLS)
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    // Create user in Supabase
    const { error } = await supabaseAdmin.from('users').insert({
      id: id,
      email: email_addresses[0].email_address,
      name: `${first_name || ''} ${last_name || ''}`.trim() || null,
      avatar_url: image_url || null,
    })

    if (error) {
      console.error('Error creating user in Supabase:', error)
      return new Response('Error creating user', { status: 500 })
    }

    console.log('✅ User created in Supabase:', id)
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    // Update user in Supabase
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        email: email_addresses[0].email_address,
        name: `${first_name || ''} ${last_name || ''}`.trim() || null,
        avatar_url: image_url || null,
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating user in Supabase:', error)
      return new Response('Error updating user', { status: 500 })
    }

    console.log('✅ User updated in Supabase:', id)
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    // Delete user in Supabase (cascades to related records)
    const { error } = await supabaseAdmin.from('users').delete().eq('id', id!)

    if (error) {
      console.error('Error deleting user in Supabase:', error)
      return new Response('Error deleting user', { status: 500 })
    }

    console.log('✅ User deleted in Supabase:', id)
  }

  if (eventType === 'organization.created') {
    const { id, name, slug, created_by } = evt.data

    // Create organization in Supabase
    const { error: orgError } = await supabaseAdmin.from('organizations').insert({
      id: id,
      name: name,
      slug: slug!,
      created_by: created_by,
    })

    if (orgError) {
      console.error('Error creating organization in Supabase:', orgError)
      return new Response('Error creating organization', { status: 500 })
    }

    // Add creator as organization member
    const { error: memberError } = await supabaseAdmin
      .from('organization_members')
      .insert({
        organization_id: id,
        user_id: created_by,
        role: 'admin',
      })

    if (memberError) {
      console.error('Error creating organization member:', memberError)
      return new Response('Error creating organization member', { status: 500 })
    }

    console.log('✅ Organization created in Supabase:', id)
  }

  if (eventType === 'organization.updated') {
    const { id, name, slug } = evt.data

    // Update organization in Supabase
    const { error } = await supabaseAdmin
      .from('organizations')
      .update({
        name: name,
        slug: slug!,
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating organization in Supabase:', error)
      return new Response('Error updating organization', { status: 500 })
    }

    console.log('✅ Organization updated in Supabase:', id)
  }

  if (eventType === 'organization.deleted') {
    const { id } = evt.data

    // Delete organization in Supabase (cascades to related records)
    const { error } = await supabaseAdmin.from('organizations').delete().eq('id', id!)

    if (error) {
      console.error('Error deleting organization in Supabase:', error)
      return new Response('Error deleting organization', { status: 500 })
    }

    console.log('✅ Organization deleted in Supabase:', id)
  }

  if (eventType === 'organizationMembership.created') {
    const { organization, public_user_data } = evt.data

    // Add user to organization in Supabase
    const { error } = await supabaseAdmin.from('organization_members').insert({
      organization_id: organization.id,
      user_id: public_user_data!.user_id,
      role: 'member',
    })

    if (error) {
      // Ignore duplicate key errors (user already in organization)
      if (error.code === '23505') {
        console.log('ℹ️ Organization membership already exists (skipped):', organization.id, public_user_data!.user_id)
        return new Response('Webhook processed', { status: 200 })
      }

      // Ignore foreign key errors (organization/user doesn't exist yet - race condition)
      if (error.code === '23503') {
        console.log('ℹ️ Organization or user not found yet (race condition, skipped):', organization.id, public_user_data!.user_id)
        return new Response('Webhook processed', { status: 200 })
      }

      console.error('Error creating organization membership:', error)
      return new Response('Error creating organization membership', { status: 500 })
    }

    console.log('✅ Organization membership created:', organization.id, public_user_data!.user_id)
  }

  if (eventType === 'organizationMembership.deleted') {
    const { organization, public_user_data } = evt.data

    // Remove user from organization in Supabase
    const { error } = await supabaseAdmin
      .from('organization_members')
      .delete()
      .eq('organization_id', organization.id)
      .eq('user_id', public_user_data!.user_id)

    if (error) {
      console.error('Error deleting organization membership:', error)
      return new Response('Error deleting organization membership', { status: 500 })
    }

    console.log('✅ Organization membership deleted:', organization.id, public_user_data!.user_id)
  }

  return new Response('Webhook processed', { status: 200 })
}
