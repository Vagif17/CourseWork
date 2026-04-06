using Application.DTOs;

namespace Application.Services.Interfaces;

public interface ICloudinaryService
{
    public Task<string> UploadAvatarAsync(UploadMediaRequestDTO file);
    public Task<string> UploadMediaAsync(UploadMediaRequestDTO file);
}
