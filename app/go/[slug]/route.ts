import { NextResponse } from 'next/server'

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET
const writeToken = process.env.SANITY_WRITE_TOKEN // optional

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const { slug } = params
  const origin = req.headers.get('origin') || ''
  const userAgent = req.headers.get('user-agent') || ''
  const forwardedFor = req.headers.get('x-forwarded-for') || ''
  const ts = new Date().toISOString()

  // 1️⃣  Get the redirect target from Sanity
  const url = `https://${projectId}.api.sanity.io/v2023-05-03/data/query/${dataset}?query=*[_type=="affiliateRedirect" && slug.current=="${slug}"][0]{url}`
  const res = await fetch(url)
  const data = await res.json()
  const targetUrl = data.result?.url

  if (!targetUrl) {
    return new NextResponse('Redirect not found', { status: 404 })
  }

  // 2️⃣  Add basic UTM parameters
  const redirectUrl = new URL(targetUrl)
  redirectUrl.searchParams.set('utm_source', 'barelyfunctional')
  redirectUrl.searchParams.set('utm_medium', 'affiliate')
  redirectUrl.searchParams.set('utm_campaign', slug)

  // 3️⃣  Log the click if a write token is present
  if (writeToken) {
    fetch(`https://${projectId}.api.sanity.io/v2023-05-03/data/mutate/${dataset}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${writeToken}`,
      },
      body: JSON.stringify({
        mutations: [
          {
            create: {
              _type: 'redirectEvent',
              slug,
              targetUrl: redirectUrl.toString(),
              referrer: origin,
              userAgent,
              ip: forwardedFor,
              ts,
            },
          },
        ],
      }),
    }).catch(() => {})
  }

  // 4️⃣  Redirect
  return NextResponse.redirect(redirectUrl.toString(), 302)
}
