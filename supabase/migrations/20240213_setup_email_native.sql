-- Enable the pg_net extension to make HTTP requests
create extension if not exists "pg_net";

-- Create the function that runs on new orders
create or replace function public.handle_new_order_email()
returns trigger as $$
declare
  resend_api_key text := 'YOUR_RESEND_KEY_HERE'; -- API Key provided by you
  email_from text := 'Perla Negra <onboarding@resend.dev>';
  email_to text;
  email_subject text;
  email_html text;
  products_html text := '';
  request_id int;
  customer_name text;
begin
  -- 1. Get products list for this order (from order_items table)
  SELECT string_agg(
    E'<tr>' ||
    E'<td style="padding: 12px; border-bottom: 1px solid #222; color: #BBB;">' || product_name || E'</td>' ||
    E'<td style="padding: 12px; border-bottom: 1px solid #222; color: #BBB; text-align: center;">' || quantity || E'</td>' ||
    E'<td style="padding: 12px; border-bottom: 1px solid #222; color: #3FFFC1; text-align: right; font-weight: bold;">€' || TO_CHAR(price, 'FM999,990.00') || E'</td>' ||
    E'</tr>',
    ''
  ) INTO products_html
  FROM public.order_items
  WHERE order_id = new.id;

  -- 2. Variables safely from NEW record
  customer_name := COALESCE(new.customer_name, 'Cliente');
  email_to := COALESCE(new.customer_email, 'facundo.elias10@gmail.com');
  email_subject := 'Dettagli Ordine #' || new.order_number || ' - Perla Negra';

  -- 3. Construct HTML Email Body (Premium Dark Theme with Logo and Items)
  email_html := E'<!DOCTYPE html><html><body style="background-color: #0A0A0A; font-family: \'serif\', Georgia, serif; color: #FFFFFF; margin: 0; padding: 40px 0;">' ||
                E'<div style="max-width: 600px; margin: 0 auto; background-color: #141414; border: 1px solid #222; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">' ||
                -- Header / Logo Area (CON LOGO GATTO)
                E'<div style="padding: 40px; text-align: center; border-bottom: 1px solid #222;">' ||
                E'<img src="https://hkedgklpsksezxxymdgc.supabase.co/storage/v1/object/public/images/logo-gatto.webp" alt="Perla Negra" style="width: 80px; margin-bottom: 10px;">' ||
                E'<h1 style="color: #3FFFC1; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">Perla Negra</h1>' ||
                E'<p style="color: #888; margin: 10px 0 0; font-style: italic; font-size: 14px;">Eccellenza e Seduzione</p>' ||
                E'</div>' ||
                -- Body Content
                E'<div style="padding: 40px;">' ||
                E'<h2 style="font-size: 24px; margin-bottom: 20px; font-weight: normal;">Grazie, ' || customer_name || E'.</h2>' ||
                E'<p style="color: #BBB; line-height: 1.6; font-size: 16px;">Il tuo ordine è stato ricevuto ed è ora in fase de elaborazione. Ecco el riepilogo completo:</p>' ||
                
                -- Information Grid
                E'<div style="background-color: #1A1A1A; border: 1px solid #333; padding: 25px; border-radius: 16px; margin: 20px 0;">' ||
                E'<h3 style="color: #3FFFC1; font-size: 14px; text-transform: uppercase; margin-top: 0;">Dati de Consegna</h3>' ||
                E'<p style="color: #BBB; font-size: 14px; margin: 5px 0;"><strong>Indirizzo:</strong> ' || COALESCE(new.delivery_address, 'Da concordare') || E'</p>' ||
                E'<p style="color: #BBB; font-size: 14px; margin: 5px 0;"><strong>Telefono:</strong> ' || COALESCE(new.customer_phone, '-') || E'</p>' ||
                E'<p style="color: #BBB; font-size: 14px; margin: 5px 0;"><strong>Note:</strong> ' || COALESCE(new.delivery_notes, 'Nessuna') || E'</p>' ||
                E'</div>' ||

                -- Products Table
                E'<h3 style="color: #3FFFC1; font-size: 14px; text-transform: uppercase; margin-bottom: 10px;">Articoli Ordinati</h3>' ||
                E'<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">' ||
                E'<thead><tr style="text-align: left; border-bottom: 2px solid #222;">' ||
                E'<th style="padding: 10px; color: #888;">Prodotto</th>' ||
                E'<th style="padding: 10px; color: #888; text-align: center;">Cant.</th>' ||
                E'<th style="padding: 10px; color: #888; text-align: right;">Prezzo</th>' ||
                E'</tr></thead>' ||
                E'<tbody>' || COALESCE(products_html, '') || E'</tbody>' ||
                E'</table>' ||

                -- Final Total
                E'<div style="border-top: 1px solid #333; padding-top: 20px; text-align: right;">' ||
                E'<p style="color: #888; margin: 0; font-size: 14px;">Totale dell''ordine</p>' ||
                E'<p style="color: #3FFFC1; font-size: 32px; font-weight: bold; margin: 5px 0;">€' || TO_CHAR(new.total, 'FM999,990.00') || E'</p>' ||
                E'</div>' ||

                E'<p style="color: #BBB; line-height: 1.6; margin-top: 30px;"><strong>Prossimi passi:</strong> Un nostro personal assistant ti contatterà su WhatsApp a breve per confermare la spedición.</p>' ||
                E'<center><a href="https://wa.me/393331234567" style="display: inline-block; background-color: #3FFFC1; color: #0A0A0A; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 10px; text-transform: uppercase; font-size: 14px;">Apri Chat WhatsApp</a></center>' ||
                E'</div>' ||
                
                -- Footer
                E'<div style="padding: 30px; text-align: center; border-top: 1px solid #222; background-color: #0D0D0D;">' ||
                E'<p style="font-size: 12px; color: #555; margin: 0;">&copy; 2024 Perla Negra. Tutti i diritti riservati.<br>Eccellenza e seduzione senza tabù.</p>' ||
                E'</div>' ||
                E'</div></body></html>';

  -- Send API Request to Resend via pg_net
  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || resend_api_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', email_from,
      'to', ARRAY[email_to],
      'subject', email_subject,
      'html', email_html
    )
  );

  return new;
end;
$$ language plpgsql security definer;

-- REDEFINE TRIGGER to fire AFTER UPDATE OF TOTAL 
-- (This ensures order_items are already inserted by the RPC transaction)
drop trigger if exists trigger_send_email_on_order on orders;
create trigger trigger_send_email_on_order
  after update of total on orders
  for each row
  when (old.total = 0 and new.total > 0) -- Only fire when total is first calculated
  execute function handle_new_order_email();
