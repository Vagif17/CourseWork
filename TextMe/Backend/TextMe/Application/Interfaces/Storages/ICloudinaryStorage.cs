namespace Application.Interfaces.Storages;

public interface ICloudinaryStorage
{
    Task<string> UploadAsync(Stream fileStream, string fileName, string contentType);

}
