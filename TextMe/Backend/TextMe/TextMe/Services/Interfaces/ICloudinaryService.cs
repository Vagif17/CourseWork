namespace TextMe.Services.Interfaces;

public interface ICloudinaryService
{
    public Task<string> UploadAvatarAsync(IFormFile file );
    public Task<string> UploadMediaAsync(IFormFile file );

}
