using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;
using TextMe.Config;
using TextMe.Identities.Interfaces;

namespace TextMe.Identities.Classes;

public class CloudinaryStorage : ICloudinaryStorage
{
    private readonly Cloudinary cloudinary;

    public CloudinaryStorage(IOptions<CloudConfig> options)
    {
        var config = options.Value;

        cloudinary = new Cloudinary(new Account(
            config.CloudName,
            config.ApiKey,
            config.ApiSecret
        ));

        cloudinary.Api.Secure = true;
    }

    public async Task<string> UploadAsync(Stream file, string fileName)
    {
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, file),
            PublicId = $"avatars/{Guid.NewGuid()}" 
        };

        var result = await cloudinary.UploadAsync(uploadParams);

        if (result.StatusCode != System.Net.HttpStatusCode.OK)
            throw new Exception($"Upload error in Cloudinary: {result.Error?.Message}");

        return result.SecureUrl.ToString();
    }

    //public async Task DeleteAsync(string publicId)
    //{
    //    var deleteParams = new DeletionParams(publicId);
    //    var result = await _cloudinary.DestroyAsync(deleteParams);

    //    if (result.StatusCode != System.Net.HttpStatusCode.OK)
    //        throw new Exception($"Delete error Cloudinary: {result.Error?.Message}");
    //}
}

