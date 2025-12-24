import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  appUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, appUrl }: WelcomeEmailRequest = await req.json();
    
    console.log("[SEND-WELCOME-EMAIL] Sending welcome email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Clarity <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Clarity – Your Thinking Partner",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fafafa;">
  <div style="max-width: 560px; margin: 0 auto; padding: 48px 24px;">
    <div style="text-align: center; margin-bottom: 48px;">
      <h1 style="font-size: 28px; font-weight: 600; color: #1a1a1a; margin: 0 0 8px 0; letter-spacing: -0.5px;">Clarity</h1>
      <p style="font-size: 14px; color: #666; margin: 0;">Think better. Decide once.</p>
    </div>
    
    <div style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 40px 32px;">
      <p style="font-size: 16px; color: #333; line-height: 1.7; margin: 0 0 24px 0;">
        You have made an important choice: to stop second-guessing and start thinking clearly.
      </p>
      
      <p style="font-size: 16px; color: #333; line-height: 1.7; margin: 0 0 24px 0;">
        Clarity is not here to think for you. It is here to force you to think better.
      </p>
      
      <p style="font-size: 16px; color: #333; line-height: 1.7; margin: 0 0 32px 0;">
        When you are ready to face a decision, we will be here.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${appUrl}/dashboard" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: 500;">Begin Your First Decision</a>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 40px;">
      <p style="font-size: 13px; color: #999; margin: 0;">
        This is your only welcome email. No spam. No tips. Just silence until you need us.
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    console.log("[SEND-WELCOME-EMAIL] Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[SEND-WELCOME-EMAIL] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
