using TextMe.Identities;
using TextMe.Interfaces;
using TextMe.Services.Interfaces;

namespace TextMe.Services.Classes;

public class CloudinaryService : ICloudinaryService
{
    private readonly ICloudinaryStorage cloudinaryStorage;

    public CloudinaryService(ICloudinaryStorage _cloudinaryStorage)
    {
        cloudinaryStorage = _cloudinaryStorage;
    }

    public async Task<string> UploadAvatarAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File not selected!");

        await using var stream = file.OpenReadStream();

        var url = await cloudinaryStorage.UploadAsync(stream, file.FileName);

        return url;
    }
}
