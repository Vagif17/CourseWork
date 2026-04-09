using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;
using Application.Config;
using Application.Interfaces.Storages;

namespace Infrastructure.Storages;

public class CloudinaryStorage : ICloudinaryStorage
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryStorage(IOptions<CloudConfig> options)
    {
        var config = options.Value;

        _cloudinary = new Cloudinary(new Account(
            config.CloudName,
            config.ApiKey,
            config.ApiSecret
        ))
        {
            Api = { Secure = true }
        };
    }

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType)
    {
        if (fileStream == null || fileStream.Length == 0)
            throw new ArgumentException("File stream is null or empty", nameof(fileStream));

        if (string.IsNullOrEmpty(fileName))
            throw new ArgumentException("File name is null or empty", nameof(fileName));

        if (_cloudinary == null)
            throw new Exception("Cloudinary client is not initialized");

        try
        {
            if (contentType.StartsWith("image"))
            {
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(fileName, fileStream),
                    PublicId = $"media/{Guid.NewGuid()}"
                };
                var result = await _cloudinary.UploadAsync(uploadParams);
                if (result.StatusCode != System.Net.HttpStatusCode.OK)
                    throw new Exception(result.Error?.Message);
                return result.SecureUrl.ToString();
            }
            else if (contentType.StartsWith("video"))
            {
                var uploadParams = new VideoUploadParams
                {
                    File = new FileDescription(fileName, fileStream),
                    PublicId = $"media/{Guid.NewGuid()}"
                };
                var result = await _cloudinary.UploadAsync(uploadParams);
                if (result.StatusCode != System.Net.HttpStatusCode.OK)
                    throw new Exception(result.Error?.Message);
                return result.SecureUrl.ToString();
            }
            else if (contentType.StartsWith("audio"))
            {
                var uploadParams = new RawUploadParams
                {
                    File = new FileDescription(fileName, fileStream),
                    PublicId = $"media/{Guid.NewGuid()}"
                };
                var result = await _cloudinary.UploadAsync(uploadParams);
                if (result.StatusCode != System.Net.HttpStatusCode.OK)
                    throw new Exception(result.Error?.Message);
                return result.SecureUrl.ToString();
            }
            else
            {
                throw new Exception("Unsupported file type");
            }
        }
        catch (Exception ex)
        {
            throw new Exception("Upload error in Cloudinary: " + ex.Message);
        }
    }
}