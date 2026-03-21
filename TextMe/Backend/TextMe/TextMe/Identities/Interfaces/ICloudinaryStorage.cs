namespace TextMe.Identities.Interfaces;

public interface ICloudinaryStorage
{
    public Task<string> UploadAsync(Stream file, string url);
    //public Task DeleteAsync(string publicId);

}
