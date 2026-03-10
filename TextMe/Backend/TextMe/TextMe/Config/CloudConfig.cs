namespace TextMe.Config;

public class CloudConfig
{
    public const  string SectionName  = "Cloudinary";   

    public string ApiKey { get; set; } = string.Empty ;
    public string ApiSecret { get; set; } = string.Empty ;
}
