// Cloudflare Pages Function — contact + newsletter handler (Brevo)
// Newsletter signups → add to Brevo list
// Contact form → email to admin

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    let data;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      data = await request.json();
    } else {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
    }

    const { name, email, county, type, message } = data;

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // NEWSLETTER SIGNUP
    if (type === 'newsletter') {
      const listId = parseInt(env.BREVO_LIST_ID) || 3;

      const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': env.BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          listIds: [listId],
          updateEnabled: true,
          attributes: {
            FIRSTNAME: name || '',
            SOURCE: 'floridadatacenters.org'
          }
        })
      });

      if (!brevoResponse.ok) {
        const errorText = await brevoResponse.text();
        console.error('Brevo contact error:', errorText);
        if (errorText.includes('Contact already exist')) {
          await fetch('https://api.brevo.com/v3/contacts/lists/' + listId + '/contacts/add', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'api-key': env.BREVO_API_KEY,
              'content-type': 'application/json'
            },
            body: JSON.stringify({ emails: [email] })
          });
        } else {
          return new Response(
            JSON.stringify({ error: 'Failed to subscribe' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      if (!contentType.includes('application/json')) {
        return new Response(null, {
          status: 302,
          headers: { 'Location': '/?subscribed=true' }
        });
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // CONTACT FORM
    if (!message || message.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Message too short' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailBody = 'New submission from globaldatacenters.net\n\nType: ' + type + '\nName: ' + (name || '(not provided)') + '\nEmail: ' + email + '\nCounty: ' + (county || '(not provided)') + '\n\nMessage:\n' + message + '\n\n---\nSubmitted: ' + new Date().toISOString();

    const mailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Global Data Centers Tip Line', email: env.BREVO_FROM || 'tips@floridadatacenters.org' },
        to: [{ email: env.CONTACT_TO_EMAIL }],
        replyTo: { email: email, name: name || 'Tipster' },
        subject: '[FL Data Centers] ' + type + ' from ' + (name || email),
        textContent: emailBody
      })
    });

    if (!mailResponse.ok) {
      return Response.json({error:'Your message could not be sent. Please try again.'},{status:502});
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Contact form error:', err);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
