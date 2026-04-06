using Application.DTOs;
using Application.Interfaces.Storages;
using Application.Services.Interfaces;

namespace Application.Services.Classes;

public class CloudinaryService : ICloudinaryService
{
    private readonly ICloudinaryStorage _cloudinaryStorage;
    public const string DefaultAvatar = "https://res.cloudinary.com/diq4utz5c/image/upload/v1773148805/DefaultPFP_rykbyt.png";

    public CloudinaryService(ICloudinaryStorage cloudinaryStorage)
    {
        _cloudinaryStorage = cloudinaryStorage;
    }

    public async Task<string> UploadAvatarAsync(UploadMediaRequestDTO file)
    {
        if (file == null || file.FileStream == null || file.FileStream.Length == 0)
            return DefaultAvatar;

        var url = await _cloudinaryStorage.UploadAsync(file.FileStream, file.FileName, file.ContentType);
        return url;
    }

    public async Task<string> UploadMediaAsync(UploadMediaRequestDTO file)
    {
        if (file == null || file.FileStream == null || file.FileStream.Length == 0)
            return string.Empty;

        var url = await _cloudinaryStorage.UploadAsync(file.FileStream, file.FileName, file.ContentType);
        return url;
    }
}