using System.Net;
using System.Net.Sockets;
using System.Text.Json;

var ip = IPAddress.Parse("127.0.0.1");
var port = 27001;

var client = new TcpClient();
client.Connect(ip, port);

var stream = client.GetStream();
var bw = new BinaryWriter(stream);
var br = new BinaryReader(stream);

Command command = default!;

string response = default!;

string str = default!;

while (true)
{
    Console.WriteLine("Write command name or HELP");
    str = Console.ReadLine()!.ToUpper();
    if(str == "HELP")
    {
        Console.WriteLine();
        Console.WriteLine("Command list:");
        Console.WriteLine(Command.ProccessList);
        Console.WriteLine($"{Command.Run} <proccess_name>");
        Console.WriteLine($"{Command.Kill} <proccess_name>");
        Console.ReadLine();
        Console.Clear();
    }
    var input = str.Split(' ');
    switch (input[0])
    {
        case Command.ProccessList:
            command = new Command { Text = input[0] };
            bw.Write(JsonSerializer.Serialize(command));
            response = br.ReadString();
            var proccessList = JsonSerializer.Deserialize<List<string>>(response);
            proccessList!.ForEach(p => { Console.WriteLine($"     {p}"); });
            break;
        case Command.Run:
            command = new Command { Text = input[0], Param = input[1] };
            bw.Write(JsonSerializer.Serialize(command));
            response = br.ReadString();
            Console.WriteLine(response);
            break;
        case Command.Kill:
            command = new Command { Text = input[0],Param = input[1]};
            bw.Write(JsonSerializer.Serialize(command));
            response = br.ReadString();
            Console.WriteLine(response);
            break;
    }
    Console.WriteLine("Press any key to continue");
    Console.ReadKey();
    Console.Clear();
}