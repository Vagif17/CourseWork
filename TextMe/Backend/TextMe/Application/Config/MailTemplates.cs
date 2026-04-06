namespace Application.Config;

public static class MailTemplates
{
    public static string VerificationCodeTemplate(string code)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
<meta charset='UTF-8'>
</head>
<body style='font-family:Segoe UI, Tahoma, Geneva, Verdana, sans-serif;background:#f4f4f4;padding:20px;'>

<div style='max-width:600px;margin:auto;background:white;padding:30px;border-radius:10px;'>

<h2 style='background:#007BFF;color:white;padding:15px;border-radius:8px;text-align:center;'>
Text Me Messenger
</h2>

<p style='font-size:22px;font-weight:bold;font-family:Arial, Helvetica, sans-serif;'>Hi!</p>

<p style='font-size:18px;'>Your verification code:</p>

<div style='text-align:center;font-size:36px;letter-spacing:10px;font-weight:bold;margin:30px;'>{code}</div>

<p style='font-size:14px;color:#666;text-align:center;margin-top:20px;'>
⚠️ Note: This email may sometimes go to your Spam or Promotions folder. Please check there if you don't see it in your inbox.
</p>

<p style='font-size:14px;color:#666;text-align:center;margin-top:40px;'>
© 2026 Text Me Messenger. All rights reserved.
</p>

</div>

</body>
</html>";
    }
}