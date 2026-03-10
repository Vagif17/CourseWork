using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;
using TextMe.Config;
using TextMe.Interfaces;

namespace TextMe.Identities;

public class CloudinaryStorage : ICloudinaryStorage
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryStorage(IOptions<CloudConfig> options)
    {
        var config = options.Value;

        _cloudinary = new Cloudinary(new Account(
            config.ApiKey,
            config.ApiSecret
        ));

        _cloudinary.Api.Secure = true;
    }

    public async Task<string> UploadAsync(Stream file, string fileName)
    {
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, file)
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

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

