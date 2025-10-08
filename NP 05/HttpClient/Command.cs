using TcpListener;

namespace NP_04_TcpClient;

public class Command
{
    public const string put = "PUT";
    public const string get = "GET";
    public const string post = "POST";
    public Car? Car { get; set; }
    public string? Param { get; set; }

}