using System.Security.Cryptography;
using System.Text;
using Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Services;

public class EncryptionService : IEncryptionService
{
    private readonly byte[] _key;

    private const string EncryptedPrefix = "[AES]";

    public EncryptionService(IConfiguration configuration)
    {
        var keyString = configuration["EncryptionKey"] ?? "b14ca5898a4e4133bbce2ea2315a1916";
        _key = Encoding.UTF8.GetBytes(keyString.PadRight(32).Substring(0, 32));
    }

    public string Encrypt(string plainText)
    {
        if (string.IsNullOrEmpty(plainText))
            return plainText;

        using Aes aes = Aes.Create();
        aes.Key = _key;
        aes.GenerateIV();
        var iv = aes.IV;

        using var encryptor = aes.CreateEncryptor(aes.Key, iv);
        using var ms = new MemoryStream();
        ms.Write(iv, 0, iv.Length);
        using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
        using (var sw = new StreamWriter(cs))
        {
            sw.Write(plainText);
        }

        var encryptedData = ms.ToArray();
        return EncryptedPrefix + Convert.ToBase64String(encryptedData);
    }

    public string Decrypt(string cipherText)
    {
        if (string.IsNullOrEmpty(cipherText))
            return cipherText;

        if (!cipherText.StartsWith(EncryptedPrefix))
            return cipherText;

        var actualCipher = cipherText.Substring(EncryptedPrefix.Length);

        try
        {
            var fullCipher = Convert.FromBase64String(actualCipher);
            using Aes aes = Aes.Create();
            aes.Key = _key;

            var iv = new byte[aes.BlockSize / 8];
            Array.Copy(fullCipher, 0, iv, 0, iv.Length);
            aes.IV = iv;

            using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
            using var ms = new MemoryStream(fullCipher, iv.Length, fullCipher.Length - iv.Length);
            using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
            using var sr = new StreamReader(cs);

            return sr.ReadToEnd();
        }
        catch
        {
            return "Error decrypting message.";
        }
    }
}
