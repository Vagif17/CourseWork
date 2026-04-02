using TextMe.Identities;
using TextMe.Identities.Interfaces;
using TextMe.Services.Interfaces;

namespace TextMe.Services.Classes;

public class CloudinaryService : ICloudinaryService
{
    private readonly ICloudinaryStorage cloudinaryStorage;
    public const string defaultAvatar = "https://res.cloudinary.com/diq4utz5c/image/upload/v1773148805/DefaultPFP_rykbyt.png";

    public CloudinaryService(ICloudinaryStorage _cloudinaryStorage)
    {
        cloudinaryStorage = _cloudinaryStorage;
    }

    public async Task<string> UploadAvatarAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return defaultAvatar;

        await using var stream = file.OpenReadStream();

        var url = await cloudinaryStorage.UploadAsync(stream, file.FileName);

        return url;
    }

    public async Task<string> UploadMediaAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return null;

        await using var stream = file.OpenReadStream();

        var url = await cloudinaryStorage.UploadAsync(stream, file.FileName);

        return url;
    }
}
