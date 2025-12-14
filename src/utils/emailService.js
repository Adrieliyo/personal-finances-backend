import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const EmailService = {
  async sendActivationEmail(email, username, activationToken) {
    // Cambiar a la ruta del frontend sin 'api/users/'
    const activationLink = `${process.env.FRONTEND_URL}/api/users/activate-account/${activationToken}`;

    const mailOptions = {
      from: `"Personal Finances" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Activa tu cuenta - Personal Finances",
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Activación de cuenta</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0; padding:0; background-color:#f2f4f8; font-family: Arial, Helvetica, sans-serif; color:#333;">

          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f4f8; padding:30px 0;">
            <tr>
              <td align="center">

                <!-- Contenedor principal -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 18px rgba(0,0,0,0.08);">

                  <!-- Header -->
                  <tr>
                    <td style="background-color: #45ab48ff; padding:35px 20px; text-align:center;">
                      <h1 style="margin:0; color:#ffffff; font-size:26px;">
                        Personal Finances
                      </h1>
                      <p style="margin:10px 0 0; color:#eaeaff; font-size:14px;">
                        Controla tus finanzas de forma inteligente
                      </p>
                    </td>
                  </tr>

                  <!-- Contenido -->
                  <tr>
                    <td style="padding:35px 30px;">

                      <p style="font-size:16px; margin:0 0 15px;">
                        Hola <strong>${username}</strong>,
                      </p>

                      <p style="font-size:15px; line-height:1.6; margin:0 0 20px;">
                        Gracias por registrarte en <strong>Personal Finances</strong>.  
                        Para comenzar a usar tu cuenta, confirma tu correo electrónico haciendo clic en el botón de abajo:
                      </p>

                      <!-- Botón -->
                      <div style="text-align:center; margin:30px 0;">
                        <a href="${activationLink}"
                          style="background-color:#45ab48ff;
                                  color:#ffffff;
                                  text-decoration:none;
                                  padding:14px 36px;
                                  font-size:16px;
                                  font-weight:bold;
                                  border-radius:8px;
                                  display:inline-block;">
                          Activar mi cuenta
                        </a>
                      </div>

                      <p style="font-size:14px; margin:0 0 10px;">
                        Si el botón no funciona, copia y pega este enlace en tu navegador:
                      </p>

                      <p style="font-size:13px; color:#667eea; word-break:break-all; margin:0 0 20px;">
                        ${activationLink}
                      </p>

                      <p style="font-size:14px; margin:0 0 15px;">
                        ⏰ <strong>Este enlace expirará en 24 horas.</strong>
                      </p>

                      <p style="font-size:14px; color:#666; margin:0;">
                        Si no creaste esta cuenta, puedes ignorar este correo de forma segura.
                      </p>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color:#f9fafc; padding:20px; text-align:center;">
                      <p style="font-size:12px; color:#888; margin:0;">
                        © 2025 Personal Finances. Todos los derechos reservados.
                      </p>
                    </td>
                  </tr>

                </table>

              </td>
            </tr>
          </table>

        </body>
        </html>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email de activación enviado a: ${email}`);
      return true;
    } catch (error) {
      console.error("Error enviando email:", error);
      throw new Error("Error al enviar el correo de activación");
    }
  },

  async sendPasswordResetEmail(email, username, resetToken) {
    // Cambiar a la ruta del frontend sin 'api/users/'
    const resetLink = `${process.env.FRONTEND_URL}/api/users/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"Personal Finances" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Restablece tu contraseña - Personal Finances",
      html: `
        <!DOCTYPE html>
        <html>
        <body>
          <h2>Restablecimiento de contraseña</h2>
          <p>Hola ${username},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #45ab48ff; color: white; text-decoration: none; border-radius: 5px;">Restablecer contraseña</a>
          <p>Este enlace expirará en 1 hora.</p>
        </body>
        </html>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error enviando email:", error);
      throw new Error("Error al enviar el correo");
    }
  },
};
